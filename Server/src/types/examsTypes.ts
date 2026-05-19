import type { Document, Types } from "mongoose";

export type ExamIdentityMode = "firstLast" | "fullName";

export interface ExamIdentityConfig {
    mode: ExamIdentityMode;
    firstNameQuestionId?: string;
    lastNameQuestionId?: string;
    fullNameQuestionId?: string;
}

export interface IExam {
    googleFormId: string;
    title: string;
    documentTitle?: string;
    description?: string;
    questionSnapshot: unknown[];
    maxScore?: number;
    identityConfig: ExamIdentityConfig;
    importedBy?: Types.ObjectId;
}

export interface IExamDoc extends IExam, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IExamResult {
    exam: Types.ObjectId;
    student: Types.ObjectId;
    googleResponseId: string;
    score?: number;
    maxScore?: number;
    answersSnapshot: unknown;
    extractedIdentity: {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        fallbackEvidence?: string[];
    };
    matchConfidence: number;
    confirmedBy?: Types.ObjectId;
    confirmedAt: Date;
}

export interface IExamResultDoc extends IExamResult, Document {
    createdAt: Date;
    updatedAt: Date;
}
