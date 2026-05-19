import mongoose, { Schema } from "mongoose";
import type { IExamResultDoc } from "../types/index.js";

const extractedIdentitySchema = new Schema(
    {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        fullName: { type: String, trim: true },
        fallbackEvidence: { type: [String], default: [] },
    },
    { _id: false },
);

const examResultSchema = new Schema<IExamResultDoc>(
    {
        exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true, index: true },
        student: {
            type: Schema.Types.ObjectId,
            ref: "Student",
            required: true,
            index: true,
        },
        googleResponseId: { type: String, required: true, trim: true },
        score: { type: Number },
        maxScore: { type: Number },
        answersSnapshot: { type: Schema.Types.Mixed, required: true },
        extractedIdentity: { type: extractedIdentitySchema, required: true },
        matchConfidence: { type: Number, required: true, min: 0, max: 1 },
        confirmedBy: { type: Schema.Types.ObjectId, ref: "User" },
        confirmedAt: { type: Date, required: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

examResultSchema.index({ exam: 1, googleResponseId: 1 }, { unique: true });

const ExamResultModel = mongoose.model<IExamResultDoc>(
    "ExamResult",
    examResultSchema,
);

export default ExamResultModel;
