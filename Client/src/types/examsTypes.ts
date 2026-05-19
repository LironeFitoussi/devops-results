import type { IStudent } from "./studentsTypes";
import type { GoogleResponseAnswer } from "@/services/googleForms";

export type ExamIdentityMode = "firstLast" | "fullName";

export type ExamIdentityConfig =
  | {
      mode: "firstLast";
      firstNameQuestionId: string;
      lastNameQuestionId: string;
    }
  | {
      mode: "fullName";
      fullNameQuestionId: string;
    };

export interface IExam {
  _id?: string;
  id?: string;
  googleFormId: string;
  title: string;
  documentTitle?: string;
  description?: string;
  questionSnapshot: unknown[];
  maxScore?: number;
  identityConfig: ExamIdentityConfig;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExamStudentMatch {
  studentId: string;
  studentObjectId: string;
  hebrewName: string;
  englishName: string;
  confidence: number;
  reasons: string[];
}

export interface ExamImportPreviewRow {
  responseId: string;
  extractedIdentity: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    fallbackEvidence: string[];
  };
  predictedStudent?: ExamStudentMatch;
  candidates: ExamStudentMatch[];
  score?: number;
}

export interface ExamImportPreview {
  form: {
    googleFormId: string;
    title: string;
    maxScore?: number;
    identityConfig: ExamIdentityConfig;
  };
  responses: ExamImportPreviewRow[];
  students: IStudent[];
}

export interface ExamResult {
  _id?: string;
  id?: string;
  exam: string | IExam;
  student: IStudent;
  googleResponseId: string;
  score?: number;
  maxScore?: number;
  answersSnapshot: Record<string, GoogleResponseAnswer>;
  extractedIdentity: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    fallbackEvidence?: string[];
  };
  matchConfidence: number;
  confirmedAt: string;
}

export interface ExamResultsResponse {
  exam: IExam;
  results: ExamResult[];
}
