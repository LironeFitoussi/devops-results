import type { Document, Types } from "mongoose";

export type ExamType = "google_form" | "code_review" | "local";

export type LocalExamQuestionType =
    | "single_choice"
    | "multi_choice"
    | "short_text"
    | "long_text";

export type LocalExamStatus = "draft" | "published" | "closed";

export interface ILocalExamOption {
    id: string;
    label: string;
    isCorrect: boolean;
}

export interface ILocalExamQuestion {
    id: string;
    type: LocalExamQuestionType;
    prompt: string;
    points: number;
    options?: ILocalExamOption[] | undefined;
    correctText?: string | undefined;
}

export type LocalExamResultStatus = "in_progress" | "submitted" | "graded";

export interface ILocalExamAnswer {
    questionId: string;
    selectedOptionIds?: string[] | undefined;
    textAnswer?: string | undefined;
    isCorrect?: boolean | undefined;
    awardedPoints?: number | undefined;
    manualOverride?: boolean | undefined;
}

export type ExamIdentityMode = "firstLast" | "fullName";

export interface ExamIdentityConfig {
    mode: ExamIdentityMode;
    firstNameQuestionId?: string;
    lastNameQuestionId?: string;
    fullNameQuestionId?: string;
}

export interface IExamBase {
    type: ExamType;
    title: string;
    description?: string;
    importedBy?: Types.ObjectId;
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

export interface ILocalExam extends IExamBase {
    type: "local";
    questions: ILocalExamQuestion[];
    totalPoints: number;
    assignedStudents: Types.ObjectId[];
    status: LocalExamStatus;
    dueAt?: Date | undefined;
    createdBy: Types.ObjectId;
}

export type IExam = IGoogleFormExam | ICodeReviewExam | ILocalExam;

export interface IExamBaseDoc extends IExamBase, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IGoogleFormExamDoc extends IGoogleFormExam, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ICodeReviewExamDoc extends ICodeReviewExam, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocalExamDoc extends ILocalExam, Document {
    createdAt: Date;
    updatedAt: Date;
}

export type IExamDoc = IGoogleFormExamDoc | ICodeReviewExamDoc | ILocalExamDoc;

export interface IExamResultBase {
    type: ExamType;
    exam: Types.ObjectId;
    score?: number;
    maxScore?: number;
    confirmedBy?: Types.ObjectId;
    confirmedAt: Date;
}

export interface IGoogleFormResult extends IExamResultBase {
    type: "google_form";
    student: Types.ObjectId;
    googleResponseId: string;
    answersSnapshot: unknown;
    extractedIdentity: {
        firstName?: string;
        lastName?: string;
        fullName?: string;
        fallbackEvidence?: string[];
    };
    matchConfidence: number;
}

export interface ICodeReviewResult extends IExamResultBase {
    type: "code_review";
    students: Types.ObjectId[];
    reviewText: string;
    githubUrl?: string;
}

export interface ILocalExamResult extends IExamResultBase {
    type: "local";
    student: Types.ObjectId;
    answers: ILocalExamAnswer[];
    status: LocalExamResultStatus;
    autoGradedScore: number;
    manualOverrideScore?: number | undefined;
    submittedAt?: Date | undefined;
}

export type IExamResult = IGoogleFormResult | ICodeReviewResult | ILocalExamResult;

export interface IGoogleFormResultDoc extends IGoogleFormResult, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ICodeReviewResultDoc extends ICodeReviewResult, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ILocalExamResultDoc extends ILocalExamResult, Document {
    createdAt: Date;
    updatedAt: Date;
}

export type IExamResultDoc =
    | IGoogleFormResultDoc
    | ICodeReviewResultDoc
    | ILocalExamResultDoc;
