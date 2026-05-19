import { google } from "googleapis";
import crypto from "node:crypto";
import { AppError } from "../utils/errorHandler.js";

// Direct Google OAuth2 (own GCP client) — no Auth0 Token Vault. The admin
// links their Google account once; we store the refresh token on their User
// doc and mint short-lived access tokens from it on demand.

const SCOPES = [
    "https://www.googleapis.com/auth/forms.body.readonly",
    "https://www.googleapis.com/auth/forms.responses.readonly",
    "https://www.googleapis.com/auth/drive.readonly",
];

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new AppError(
            `Server misconfigured: ${name} is not set (required for Google OAuth)`,
            500,
        );
    }
    return value;
}

export function createOAuthClient() {
    return new google.auth.OAuth2(
        requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
        requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
        requireEnv("GOOGLE_OAUTH_REDIRECT_URI"),
    );
}

// `state` is an HMAC of the admin's auth0 sub so the stateless callback can
// (a) defend against CSRF and (b) know which user to attach the token to.
function stateSecret(): string {
    return requireEnv("GOOGLE_OAUTH_STATE_SECRET");
}

export function buildState(sub: string): string {
    const sig = crypto
        .createHmac("sha256", stateSecret())
        .update(sub)
        .digest("hex");
    return Buffer.from(`${sub}:${sig}`).toString("base64url");
}

export function verifyState(state: string): string {
    let decoded: string;
    try {
        decoded = Buffer.from(state, "base64url").toString("utf8");
    } catch {
        throw new AppError("Invalid OAuth state", 400);
    }
    const idx = decoded.lastIndexOf(":");
    if (idx === -1) {
        throw new AppError("Invalid OAuth state", 400);
    }
    const sub = decoded.slice(0, idx);
    const sig = decoded.slice(idx + 1);
    const expected = crypto
        .createHmac("sha256", stateSecret())
        .update(sub)
        .digest("hex");
    if (
        sig.length !== expected.length ||
        !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
    ) {
        throw new AppError("OAuth state verification failed", 400);
    }
    return sub;
}

export function getAuthUrl(sub: string): string {
    const client = createOAuthClient();
    return client.generateAuthUrl({
        access_type: "offline",
        prompt: "consent", // force refresh_token issuance every time
        scope: SCOPES,
        state: buildState(sub),
    });
}

// Exchange the authorization code for tokens; returns the refresh token.
export async function exchangeCode(code: string): Promise<string> {
    const client = createOAuthClient();
    try {
        const { tokens } = await client.getToken(code);
        if (!tokens.refresh_token) {
            throw new AppError(
                "Google did not return a refresh token — revoke app access in Google account and reconnect",
                502,
            );
        }
        return tokens.refresh_token;
    } catch (error) {
        if (error instanceof AppError) throw error;
        const detail = error instanceof Error ? error.message : "unknown";
        throw new AppError(`Google code exchange failed: ${detail}`, 502);
    }
}

// Build an authenticated OAuth2 client from a stored refresh token. googleapis
// transparently refreshes the access token as needed.
export function authedClient(refreshToken: string) {
    const client = createOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    return client;
}
