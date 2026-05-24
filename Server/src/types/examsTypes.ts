import type { Document, Types } from "mongoose";

export type ExamType = "google_form" | "code_review";

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

export type IExam = IGoogleFormExam | ICodeReviewExam;

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

export type IExamDoc = IGoogleFormExamDoc | ICodeReviewExamDoc;

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

export type IExamResult = IGoogleFormResult | ICodeReviewResult;

export interface IGoogleFormResultDoc extends IGoogleFormResult, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface ICodeReviewResultDoc extends ICodeReviewResult, Document {
    createdAt: Date;
    updatedAt: Date;
}

export type IExamResultDoc = IGoogleFormResultDoc | ICodeReviewResultDoc;
