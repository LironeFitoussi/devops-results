import api from "./api";
import type {
  AssignedLocalExam,
  CreateCodeReviewExamInput,
  CreateLocalExamInput,
  ExamIdentityConfig,
  ExamImportPreview,
  ExamResult,
  ExamResultsResponse,
  GradeLocalExamResultInput,
  IExam,
  ILocalExam,
  LocalExamResult,
  StartLocalExamResponse,
  SubmitLocalExamInput,
  UpdateCodeReviewExamInput,
  UpdateLocalExamInput,
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

export const updateCodeReviewExam = async (
  token: string,
  examId: string,
  payload: UpdateCodeReviewExamInput,
): Promise<{ exam: IExam; results: ExamResult[] }> => {
  const { data } = await api.patch(
    `/exams/code-review/${encodeURIComponent(examId)}`,
    payload,
    authConfig(token),
  );
  return data.data;
};

export const createLocalExam = async (
  token: string,
  payload: CreateLocalExamInput,
): Promise<{ exam: ILocalExam }> => {
  const { data } = await api.post("/exams/local", payload, authConfig(token));
  return data.data;
};

export const updateLocalExam = async (
  token: string,
  examId: string,
  payload: UpdateLocalExamInput,
): Promise<{ exam: ILocalExam }> => {
  const { data } = await api.patch(
    `/exams/local/${encodeURIComponent(examId)}`,
    payload,
    authConfig(token),
  );
  return data.data;
};

export const assignLocalExamStudents = async (
  token: string,
  examId: string,
  studentIds: string[],
): Promise<{ exam: ILocalExam }> => {
  const { data } = await api.post(
    `/exams/local/${encodeURIComponent(examId)}/assign`,
    { studentIds },
    authConfig(token),
  );
  return data.data;
};

export const publishLocalExam = async (
  token: string,
  examId: string,
): Promise<{ exam: ILocalExam }> => {
  const { data } = await api.post(
    `/exams/local/${encodeURIComponent(examId)}/publish`,
    {},
    authConfig(token),
  );
  return data.data;
};

export const closeLocalExam = async (
  token: string,
  examId: string,
): Promise<{ exam: ILocalExam }> => {
  const { data } = await api.post(
    `/exams/local/${encodeURIComponent(examId)}/close`,
    {},
    authConfig(token),
  );
  return data.data;
};

export const getAssignedLocalExams = async (
  token: string,
): Promise<AssignedLocalExam[]> => {
  const { data } = await api.get("/exams/local/assigned", authConfig(token));
  return data.data;
};

export const startLocalExam = async (
  token: string,
  examId: string,
): Promise<StartLocalExamResponse> => {
  const { data } = await api.get(
    `/exams/local/${encodeURIComponent(examId)}/take`,
    authConfig(token),
  );
  return data.data;
};

export const submitLocalExam = async (
  token: string,
  examId: string,
  payload: SubmitLocalExamInput,
): Promise<{ result: LocalExamResult }> => {
  const { data } = await api.post(
    `/exams/local/${encodeURIComponent(examId)}/submit`,
    payload,
    authConfig(token),
  );
  return data.data;
};

export const gradeLocalExamResult = async (
  token: string,
  resultId: string,
  payload: GradeLocalExamResultInput,
): Promise<{ result: LocalExamResult }> => {
  const { data } = await api.patch(
    `/exams/results/${encodeURIComponent(resultId)}/grade`,
    payload,
    authConfig(token),
  );
  return data.data;
};

export const reopenLocalExamResult = async (
  token: string,
  resultId: string,
): Promise<{ result: LocalExamResult }> => {
  const { data } = await api.post(
    `/exams/results/${encodeURIComponent(resultId)}/reopen`,
    {},
    authConfig(token),
  );
  return data.data;
};

export const deleteLocalExam = async (
  token: string,
  examId: string,
): Promise<{ ok: true }> => {
  const { data } = await api.delete(
    `/exams/local/${encodeURIComponent(examId)}`,
    authConfig(token),
  );
  return data.data;
};
