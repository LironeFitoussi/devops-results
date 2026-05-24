import api from "./api";
import type {
  CreateCodeReviewExamInput,
  ExamIdentityConfig,
  ExamImportPreview,
  ExamResult,
  ExamResultsResponse,
  IExam,
} from "@/types";

export interface ConfirmedImportRow {
  responseId: string;
  studentId: string;
  matchConfidence?: number | undefined;
}

const authConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getExamByGoogleForm = async (
  token: string,
  formId: string,
): Promise<IExam | null> => {
  const { data } = await api.get(
    `/exams/by-google-form/${encodeURIComponent(formId)}`,
    authConfig(token),
  );
  return data.data;
};

export const getExams = async (token: string): Promise<IExam[]> => {
  const { data } = await api.get("/exams", authConfig(token));
  return data.data;
};

export const previewGoogleFormImport = async (
  token: string,
  formId: string,
  identityConfig: ExamIdentityConfig,
): Promise<ExamImportPreview> => {
  const { data } = await api.post(
    `/google/forms/${encodeURIComponent(formId)}/import-preview`,
    { identityConfig },
    authConfig(token),
  );
  return data.data;
};

export const importGoogleExam = async (
  token: string,
  googleFormId: string,
  identityConfig: ExamIdentityConfig,
  confirmedRows: ConfirmedImportRow[],
): Promise<{ exam: IExam }> => {
  const { data } = await api.post(
    "/exams/import-google",
    { googleFormId, identityConfig, confirmedRows },
    authConfig(token),
  );
  return data.data;
};

export const getExamResults = async (
  token: string,
  examId: string,
): Promise<ExamResultsResponse> => {
  const { data } = await api.get(
    `/exams/${encodeURIComponent(examId)}/results`,
    authConfig(token),
  );
  return data.data;
};

export const getMyExamResults = async (token: string): Promise<ExamResult[]> => {
  const { data } = await api.get("/exams/me", authConfig(token));
  return data.data;
};

export const getMyExamResult = async (
  token: string,
  resultId: string,
): Promise<ExamResult> => {
  const { data } = await api.get(
    `/exams/me/${encodeURIComponent(resultId)}`,
    authConfig(token),
  );
  return data.data;
};

export const createCodeReviewExam = async (
  token: string,
  payload: CreateCodeReviewExamInput,
): Promise<{ exam: IExam; results: ExamResult[] }> => {
  const { data } = await api.post(
    "/exams/code-review",
    payload,
    authConfig(token),
  );
  return data.data;
};
