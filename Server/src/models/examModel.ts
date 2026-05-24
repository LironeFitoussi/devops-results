import mongoose, { Schema } from "mongoose";
import type {
    ICodeReviewExamDoc,
    IExamBaseDoc,
    IGoogleFormExamDoc,
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

export default ExamModel;
