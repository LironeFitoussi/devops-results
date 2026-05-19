import type { Request, Response } from "express";
import { AppError } from "../utils/errorHandler.js";
import { formIdParamSchema } from "../zod/googleFormsZod.js";
import User from "../models/userModel.js";
import {
    getAuthUrl,
    exchangeCode,
    verifyState,
    authedClient,
} from "../services/googleOAuthService.js";
import {
    listForms,
    getForm,
    getResponses,
} from "../services/googleFormsService.js";

const CLIENT_URL = process.env.CLIENT_URL ?? "http://localhost:5173";

// Loads the admin's stored Google refresh token and returns an authenticated
// OAuth2 client. `adminOnly` already verified the JWT + admin role.
async function adminGoogleClient(req: Request) {
    const sub = req.auth?.payload?.sub;
    if (!sub) {
        throw new AppError("User information not found in token", 401);
    }
    const user = await User.findOne({ auth0Id: sub }).select(
        "+googleRefreshToken",
    );
    if (!user?.googleRefreshToken) {
        throw new AppError(
            "Google account not connected — click Connect Google",
            409,
        );
    }
    return authedClient(user.googleRefreshToken);
}

class GoogleFormsController {
    // Returns the Google consent URL for the admin to link their account.
    async connectStart(req: Request, res: Response) {
        const sub = req.auth?.payload?.sub;
        if (!sub) {
            throw new AppError("User information not found in token", 401);
        }
        res.status(200).json({ success: true, data: { url: getAuthUrl(sub) } });
    }

    // Google redirects here with ?code&state. No adminOnly (Google calls it);
    // identity + CSRF come from the signed state.
    async oauthCallback(req: Request, res: Response) {
        const code = typeof req.query.code === "string" ? req.query.code : "";
        const state =
            typeof req.query.state === "string" ? req.query.state : "";
        if (!code || !state) {
            throw new AppError("Missing code or state", 400);
        }
        const sub = verifyState(state);
        const refreshToken = await exchangeCode(code);
        const updated = await User.findOneAndUpdate(
            { auth0Id: sub },
            { googleRefreshToken: refreshToken },
        );
        if (!updated) {
            throw new AppError("User not found", 404);
        }
        res.redirect(`${CLIENT_URL}/google-forms?google=connected`);
    }

    async connectStatus(req: Request, res: Response) {
        const sub = req.auth?.payload?.sub;
        const user = sub
            ? await User.findOne({ auth0Id: sub }).select(
                  "+googleRefreshToken",
              )
            : null;
        res.status(200).json({
            success: true,
            data: { connected: Boolean(user?.googleRefreshToken) },
        });
    }

    async listForms(req: Request, res: Response) {
        const auth = await adminGoogleClient(req);
        const forms = await listForms(auth);
        res.status(200).json({ success: true, data: forms });
    }

    async getForm(req: Request, res: Response) {
        const { id } = formIdParamSchema.parse(req.params);
        const auth = await adminGoogleClient(req);
        const form = await getForm(auth, id);
        res.status(200).json({ success: true, data: form });
    }

    async getResponses(req: Request, res: Response) {
        const { id } = formIdParamSchema.parse(req.params);
        const auth = await adminGoogleClient(req);
        const responses = await getResponses(auth, id);
        res.status(200).json({ success: true, data: responses });
    }
}

export default GoogleFormsController;
