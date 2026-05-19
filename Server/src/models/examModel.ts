import mongoose, { Schema } from "mongoose";
import type { IExamDoc } from "../types/index.js";

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

const examSchema = new Schema<IExamDoc>(
    {
        googleFormId: { type: String, required: true, unique: true, index: true },
        title: { type: String, required: true, trim: true },
        documentTitle: { type: String, trim: true },
        description: { type: String, trim: true },
        questionSnapshot: { type: [Schema.Types.Mixed], required: true, default: [] },
        maxScore: { type: Number },
        identityConfig: { type: identityConfigSchema, required: true },
        importedBy: { type: Schema.Types.ObjectId, ref: "User" },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

const ExamModel = mongoose.model<IExamDoc>("Exam", examSchema);

export default ExamModel;
