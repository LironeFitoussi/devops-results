import mongoose, { Schema } from "mongoose";
import type {
    ICodeReviewExamDoc,
    IExamBaseDoc,
    IGoogleFormExamDoc,
    ILocalExamDoc,
} from "../types/index.js";

const identityConfigSchema = new Schema(
    {
        mode: {
            type: String,
            enum: ["firstLast", "fullName"],
            required: true,
        },
        firstNameQuestionId: { type: String, trim: true },
        lastNameQuestionId: { type: String, trim: true },
        fullNameQuestionId: { type: String, trim: true },
    },
    { _id: false },
);

const baseExamSchema = new Schema<IExamBaseDoc>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        importedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
        discriminatorKey: "type",
        collection: "exams",
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const ExamModel = mongoose.model<IExamBaseDoc>("Exam", baseExamSchema);

const googleFormExamSchema = new Schema<IGoogleFormExamDoc>(
    {
        googleFormId: {
            type: String,
            required: true,
            unique: true,
            sparse: true,
            index: true,
        },
        documentTitle: { type: String, trim: true },
        questionSnapshot: { type: [Schema.Types.Mixed], required: true, default: [] },
        maxScore: { type: Number },
        identityConfig: { type: identityConfigSchema, required: true },
    },
    { _id: false },
);

const codeReviewExamSchema = new Schema<ICodeReviewExamDoc>({}, { _id: false });

const localExamOptionSchema = new Schema(
    {
        id: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, required: true, default: false },
    },
    { _id: false },
);

const localExamQuestionSchema = new Schema(
    {
        id: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["single_choice", "multi_choice", "short_text", "long_text"],
            required: true,
        },
        prompt: { type: String, required: true, trim: true },
        points: { type: Number, required: true, min: 0 },
        options: { type: [localExamOptionSchema], default: undefined },
        correctText: { type: String, trim: true },
    },
    { _id: false },
);

const localExamSchema = new Schema<ILocalExamDoc>(
    {
        questions: {
            type: [localExamQuestionSchema],
            required: true,
            default: [],
        },
        totalPoints: { type: Number, required: true, min: 0, default: 0 },
        assignedStudents: {
            type: [{ type: Schema.Types.ObjectId, ref: "Student" }],
            required: true,
            default: [],
            index: true,
        },
        status: {
            type: String,
            enum: ["draft", "published", "closed"],
            required: true,
            default: "draft",
            index: true,
        },
        dueAt: { type: Date },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { _id: false },
);

export const GoogleFormExamModel = ExamModel.discriminator<IGoogleFormExamDoc>(
    "GoogleFormExam",
    googleFormExamSchema,
    { value: "google_form" },
);

export const CodeReviewExamModel = ExamModel.discriminator<ICodeReviewExamDoc>(
    "CodeReviewExam",
    codeReviewExamSchema,
    { value: "code_review" },
);

export const LocalExamModel = ExamModel.discriminator<ILocalExamDoc>(
    "LocalExam",
    localExamSchema,
    { value: "local" },
);

export default ExamModel;
