import type { IStudent } from "./studentsTypes";
import type { GoogleResponseAnswer } from "@/services/googleForms";

export type ExamType = "google_form" | "code_review";

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

export interface IExamBase {
  _id?: string;
  id?: string;
  type: ExamType;
  title: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IGoogleFormExam extends IExamBase {
  type: "google_form";
  googleFormId: string;
  documentTitle?: string;
  questionSnapshot: unknown[];
  maxScore?: number;
  identityConfig: ExamIdentityConfig;
}

export interface ICodeReviewExam extends IExamBase {
  type: "code_review";
}

export type IExam = IGoogleFormExam | ICodeReviewExam;

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

export interface ExamResultBase {
  _id?: string;
  id?: string;
  type: ExamType;
  exam: string | IExam;
  score?: number;
  maxScore?: number;
  confirmedAt: string;
}

export interface GoogleFormExamResult extends ExamResultBase {
  type: "google_form";
  student: IStudent;
  googleResponseId: string;
  answersSnapshot: Record<string, GoogleResponseAnswer>;
  extractedIdentity: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    fallbackEvidence?: string[];
  };
  matchConfidence: number;
}

export interface CodeReviewExamResult extends ExamResultBase {
  type: "code_review";
  students: IStudent[];
  reviewText: string;
  githubUrl?: string;
}

export type ExamResult = GoogleFormExamResult | CodeReviewExamResult;

export interface ExamResultsResponse {
  exam: IExam;
  results: ExamResult[];
}

export interface CodeReviewResultRowInput {
  studentIds: string[];
  reviewText: string;
  githubUrl?: string;
}

export interface CreateCodeReviewExamInput {
  title: string;
  description?: string;
  results: CodeReviewResultRowInput[];
}
