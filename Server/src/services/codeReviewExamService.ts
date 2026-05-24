import mongoose from "mongoose";
import type { Types } from "mongoose";
import { CodeReviewExamModel } from "../models/examModel.js";
import { CodeReviewResultModel } from "../models/examResultModel.js";
import Student from "../models/studentModel.js";
import type {
    ICodeReviewExamDoc,
    ICodeReviewResultDoc,
    IUserDoc,
} from "../types/index.js";
import { AppError } from "../utils/errorHandler.js";

export interface CodeReviewResultRowInput {
    studentIds: string[];
    reviewText: string;
    githubUrl?: string | undefined;
}

export interface CreateCodeReviewExamInput {
    title: string;
    description?: string | undefined;
    results: CodeReviewResultRowInput[];
}

export async function createCodeReviewExam(
    payload: CreateCodeReviewExamInput,
    user: IUserDoc,
): Promise<{ exam: ICodeReviewExamDoc; results: ICodeReviewResultDoc[] }> {
    const uniqueIds = Array.from(
        new Set(payload.results.flatMap((row) => row.studentIds)),
    );
    const students = await Student.find({ _id: { $in: uniqueIds } }).select("_id");
    if (students.length !== uniqueIds.length) {
        const foundIds = new Set(students.map((s) => String(s._id)));
        const missing = uniqueIds.filter((id) => !foundIds.has(id));
        throw new AppError(`Students not found: ${missing.join(", ")}`, 400);
    }

    const session = await mongoose.startSession();
    try {
        let exam: ICodeReviewExamDoc | null = null;
        let results: ICodeReviewResultDoc[] = [];

        await session.withTransaction(async () => {
            const [createdExam] = await CodeReviewExamModel.create(
                [
                    {
                        title: payload.title,
                        description: payload.description,
                        importedBy: user._id,
                    },
                ],
                { session },
            );
            exam = createdExam as ICodeReviewExamDoc;

            const now = new Date();
            const docs = payload.results.map((row) => ({
                exam: (exam as ICodeReviewExamDoc)._id,
                students: row.studentIds,
                reviewText: row.reviewText,
                githubUrl: row.githubUrl,
                confirmedBy: user._id as Types.ObjectId,
                confirmedAt: now,
            }));
            results = (await CodeReviewResultModel.create(docs, {
                session,
            })) as unknown as ICodeReviewResultDoc[];
        });

        return {
            exam: exam as unknown as ICodeReviewExamDoc,
            results,
        };
    } finally {
        await session.endSession();
    }
}
