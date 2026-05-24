import mongoose, { Schema } from "mongoose";
import type {
    ICodeReviewResultDoc,
    IExamResultBase,
    IGoogleFormResultDoc,
    ILocalExamResultDoc,
} from "../types/index.js";

const extractedIdentitySchema = new Schema(
    {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        fullName: { type: String, trim: true },
        fallbackEvidence: { type: [String], default: [] },
    },
    { _id: false },
);

const baseExamResultSchema = new Schema<IExamResultBase>(
    {
        exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
        score: { type: Number },
        maxScore: { type: Number },
        confirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
        confirmedAt: { type: Date, required: true, default: Date.now },
    },
    {
        timestamps: true,
        discriminatorKey: "type",
        collection: "examresults",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const ExamResultModel = mongoose.model<IExamResultBase>(
    "ExamResult",
    baseExamResultSchema,
);

const googleFormResultSchema = new Schema<IGoogleFormResultDoc>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        googleResponseId: { type: String, required: true, trim: true },
        answersSnapshot: { type: Schema.Types.Mixed, required: true },
        extractedIdentity: { type: extractedIdentitySchema, required: true },
        matchConfidence: { type: Number, required: true, min: 0, max: 1 },
    },
    { _id: false },
);

googleFormResultSchema.index(
    { exam: 1, googleResponseId: 1 },
    { unique: true, sparse: true },
);

const githubUrlRegex = /^https?:\/\/(www\.)?github\.com\/.+/i;

const codeReviewResultSchema = new Schema<ICodeReviewResultDoc>(
    {
        students: {
            type: [{ type: Schema.Types.ObjectId, ref: "Student" }],
            required: true,
            index: true,
            validate: {
                validator: (arr: unknown[]) => Array.isArray(arr) && arr.length >= 1,
                message: "At least one student is required",
            },
        },
        reviewText: { type: String, required: true, trim: true },
        githubUrl: {
            type: String,
            trim: true,
            validate: {
                validator: (val?: string) => !val || githubUrlRegex.test(val),
                message: "Invalid GitHub URL",
            },
        },
    },
    { _id: false },
);

const localExamAnswerSchema = new Schema(
    {
        questionId: { type: String, required: true, trim: true },
        selectedOptionIds: { type: [String], default: undefined },
        textAnswer: { type: String, trim: true },
        isCorrect: { type: Boolean },
        awardedPoints: { type: Number, min: 0 },
        manualOverride: { type: Boolean, default: false },
    },
    { _id: false },
);

const localExamResultSchema = new Schema<ILocalExamResultDoc>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        answers: { type: [localExamAnswerSchema], required: true, default: [] },
        status: {
            type: String,
            enum: ["in_progress", "submitted", "graded"],
            required: true,
            default: "in_progress",
            index: true,
        },
        autoGradedScore: { type: Number, required: true, min: 0, default: 0 },
        manualOverrideScore: { type: Number, min: 0 },
        submittedAt: { type: Date },
    },
    { _id: false },
);

localExamResultSchema.index({ exam: 1, student: 1 }, { unique: true });

export const GoogleFormResultModel =
    ExamResultModel.discriminator<IGoogleFormResultDoc>(
        "GoogleFormResult",
        googleFormResultSchema,
        { value: "google_form" },
    );

export const CodeReviewResultModel =
    ExamResultModel.discriminator<ICodeReviewResultDoc>(
        "CodeReviewResult",
        codeReviewResultSchema,
        { value: "code_review" },
    );

export const LocalExamResultModel =
    ExamResultModel.discriminator<ILocalExamResultDoc>(
        "LocalExamResult",
        localExamResultSchema,
        { value: "local" },
    );

export default ExamResultModel;
