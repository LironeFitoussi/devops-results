import api from "./api";

// Backend reads Google Forms/Drive using the admin's own Google OAuth refresh
// token (linked via /google/oauth/start). The Auth0 token is passed explicitly
// per-request so a query firing before AppInitializer sets the axios default
// header does not 401.

export interface DriveFormSummary {
    id: string;
    name: string;
    createdTime?: string;
    modifiedTime?: string;
}

export interface GoogleFormQuestion {
    questionId?: string;
    required?: boolean;
    grading?: {
        pointValue?: number;
    };
}

export interface GoogleFormItem {
    itemId?: string;
    title?: string;
    description?: string;
    questionItem?: {
        question?: GoogleFormQuestion;
    };
}

export interface GoogleFormDetail {
    formId?: string;
    info?: {
        title?: string;
        documentTitle?: string;
        description?: string;
    };
    items?: GoogleFormItem[];
}

export interface GoogleTextAnswer {
    value?: string;
}

export interface GoogleFileAnswer {
    fileId?: string;
    fileName?: string;
    mimeType?: string;
}

export interface GoogleResponseAnswer {
    questionId?: string;
    textAnswers?: {
        answers?: GoogleTextAnswer[];
    };
    fileUploadAnswers?: {
        answers?: GoogleFileAnswer[];
    };
    grade?: {
        score?: number;
        correct?: boolean;
        feedback?: unknown;
    };
}

export interface GoogleFormResponse {
    responseId?: string;
    createTime?: string;
    lastSubmittedTime?: string;
    respondentEmail?: string;
    totalScore?: number;
    answers?: Record<string, GoogleResponseAnswer>;
}

export interface GoogleFormResponses {
    responses?: GoogleFormResponse[];
}

const authConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});

export const listForms = async (
    token: string,
): Promise<DriveFormSummary[]> => {
    const { data } = await api.get("/google/forms", authConfig(token));
    return data.data;
};

export const getForm = async (
    token: string,
    formId: string,
): Promise<GoogleFormDetail> => {
    const { data } = await api.get(
        `/google/forms/${encodeURIComponent(formId)}`,
        authConfig(token),
    );
    return data.data;
};

export const getFormResponses = async (
    token: string,
    formId: string,
): Promise<GoogleFormResponses> => {
    const { data } = await api.get(
        `/google/forms/${encodeURIComponent(formId)}/responses`,
        authConfig(token),
    );
    return data.data;
};

// Returns the Google consent URL to link the admin's Google account.
export const getOAuthStartUrl = async (token: string): Promise<string> => {
    const { data } = await api.get("/google/oauth/start", authConfig(token));
    return data.data.url;
};

export const getConnectStatus = async (token: string): Promise<boolean> => {
    const { data } = await api.get("/google/oauth/status", authConfig(token));
    return data.data.connected;
};
