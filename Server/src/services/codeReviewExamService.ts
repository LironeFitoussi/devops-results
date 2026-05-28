import mongoose from "mongoose";
import type { Types } from "mongoose";
import { CodeReviewExamModel } from "../models/examModel.js";
import ExamResultModel, { CodeReviewResultModel } from "../models/examResultModel.js";
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
    grade?: number | undefined;
}

export interface CreateCodeReviewExamInput {
    title: string;
    description?: string | undefined;
    results: CodeReviewResultRowInput[];
}

export interface UpdateCodeReviewResultRowInput extends CodeReviewResultRowInput {
    _id?: string | undefined;
}

export interface UpdateCodeReviewExamInput {
    title?: string | undefined;
    description?: string | undefined;
    results: UpdateCodeReviewResultRowInput[];
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
                grade: row.grade,
                confirmedBy: user._id as Types.ObjectId,
                confirmedAt: now,
            }));
            results = (await CodeReviewResultModel.create(docs, {
                session,
                ordered: true,
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

export async function updateCodeReviewExam(
    examId: string,
    payload: UpdateCodeReviewExamInput,
    user: IUserDoc,
): Promise<{ exam: ICodeReviewExamDoc; results: ICodeReviewResultDoc[] }> {
    const exam = await CodeReviewExamModel.findById(examId);
    if (!exam) throw new AppError("Code review exam not found", 404);

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
        let updatedExam: ICodeReviewExamDoc | null = null;
        let results: ICodeReviewResultDoc[] = [];

        await session.withTransaction(async () => {
            if (payload.title !== undefined) exam.title = payload.title;
            if (payload.description !== undefined) exam.description = payload.description;
            await exam.save({ session });
            updatedExam = exam as ICodeReviewExamDoc;

            const now = new Date();
            const incomingIds = new Set(
                payload.results.map((r) => r._id).filter(Boolean),
            );

            // delete results removed from the payload
            await ExamResultModel.deleteMany(
                { exam: exam._id, _id: { $nin: Array.from(incomingIds) } },
                { session },
            );

            // upsert each row
            for (const row of payload.results) {
                const doc = {
                    exam: exam._id,
                    students: row.studentIds,
                    reviewText: row.reviewText,
                    githubUrl: row.githubUrl,
                    grade: row.grade,
                    confirmedBy: user._id as Types.ObjectId,
                    confirmedAt: now,
                };
                if (row._id) {
                    const updated = await CodeReviewResultModel.findByIdAndUpdate(
                        row._id,
                        { $set: doc },
                        { new: true, session },
                    );
                    if (updated) results.push(updated as ICodeReviewResultDoc);
                } else {
                    const [created] = await CodeReviewResultModel.create([doc], {
                        session,
                        ordered: true,
                    });
                    results.push(created as unknown as ICodeReviewResultDoc);
                }
            }
        });

        return {
            exam: updatedExam as unknown as ICodeReviewExamDoc,
            results,
        };
    } finally {
        await session.endSession();
    }
}
