import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";
import { AppError } from "../utils/errorHandler.js";

// Read-only Drive + Forms access via the official googleapis SDK. `auth` is an
// OAuth2 client backed by the admin's stored refresh token.

const FORM_MIME = "application/vnd.google-apps.form";

function mapGoogleError(error: unknown, context: string): never {
    const err = error as { code?: number; message?: string };
    const status = typeof err.code === "number" ? err.code : undefined;
    const detail = err.message ?? "unknown error";
    if (status === 401 || status === 403) {
        throw new AppError(
            `Google authorization failed for ${context} — reconnect Google (${detail})`,
            502,
        );
    }
    if (status === 404) {
        throw new AppError(`${context}: not found`, 404);
    }
    throw new AppError(`Google API error during ${context}: ${detail}`, 502);
}

export interface DriveFormSummary {
    id: string;
    name: string;
    createdTime?: string;
    modifiedTime?: string;
}

// Forms API has no "list" endpoint; enumerate owned forms via Drive.
export async function listForms(
    auth: OAuth2Client,
): Promise<DriveFormSummary[]> {
    try {
        const drive = google.drive({ version: "v3", auth });
        const { data } = await drive.files.list({
            q: `mimeType='${FORM_MIME}' and 'me' in owners and trashed=false`,
            fields: "files(id,name,createdTime,modifiedTime)",
            pageSize: 100,
            orderBy: "modifiedTime desc",
        });
        return (data.files ?? []).map((f) => {
            const summary: DriveFormSummary = {
                id: f.id ?? "",
                name: f.name ?? "(untitled)",
            };
            if (f.createdTime) summary.createdTime = f.createdTime;
            if (f.modifiedTime) summary.modifiedTime = f.modifiedTime;
            return summary;
        });
    } catch (error) {
        mapGoogleError(error, "listForms");
    }
}

export async function getForm(
    auth: OAuth2Client,
    formId: string,
): Promise<unknown> {
    try {
        const forms = google.forms({ version: "v1", auth });
        const { data } = await forms.forms.get({ formId });
        return data;
    } catch (error) {
        mapGoogleError(error, "getForm");
    }
}

export async function getResponses(
    auth: OAuth2Client,
    formId: string,
): Promise<unknown> {
    try {
        const forms = google.forms({ version: "v1", auth });
        const { data } = await forms.forms.responses.list({ formId });
        return data;
    } catch (error) {
        mapGoogleError(error, "getResponses");
    }
}
