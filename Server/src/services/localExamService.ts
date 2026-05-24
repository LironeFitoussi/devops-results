import { Types } from "mongoose";
import type { z } from "zod";
import { LocalExamModel } from "../models/examModel.js";
import { LocalExamResultModel } from "../models/examResultModel.js";
import Student from "../models/studentModel.js";
import type {
    ILocalExamAnswer,
    ILocalExamDoc,
    ILocalExamGradeEditChange,
    ILocalExamQuestion,
    IUserDoc,
} from "../types/index.js";
import { AppError } from "../utils/errorHandler.js";
import type {
    assignStudentsSchema,
    createLocalExamSchema,
    gradeLocalExamResultSchema,
    submitLocalExamSchema,
    updateLocalExamSchema,
} from "../zod/examsZod.js";

type CreateLocalExamInput = z.infer<typeof createLocalExamSchema>;
type UpdateLocalExamInput = z.infer<typeof updateLocalExamSchema>;
type AssignStudentsInput = z.infer<typeof assignStudentsSchema>;
type SubmitLocalExamInput = z.infer<typeof submitLocalExamSchema>;
type GradeLocalExamResultInput = z.infer<typeof gradeLocalExamResultSchema>;

function asObjectId(value: string, label: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
        throw new AppError(`Invalid ${label}`, 400);
    }
    return new Types.ObjectId(value);
}

function totalPoints(questions: ILocalExamQuestion[]): number {
    return questions.reduce((total, question) => total + question.points, 0);
}

function normalizeText(value?: string): string {
    return value?.trim().toLowerCase() ?? "";
}

function sameSet(left: string[], right: string[]): boolean {
    if (left.length !== right.length) return false;
    const rightSet = new Set(right);
    return left.every((value) => rightSet.has(value));
}

function gradeAnswer(
    question: ILocalExamQuestion,
    answer?: SubmitLocalExamInput["answers"][number],
): ILocalExamAnswer {
    if (question.type === "single_choice" || question.type === "multi_choice") {
        const selectedOptionIds = answer?.selectedOptionIds ?? [];
        const correctOptionIds =
            question.options
                ?.filter((option) => option.isCorrect)
                .map((option) => option.id) ?? [];
        const isCorrect = sameSet(selectedOptionIds, correctOptionIds);
        return {
            questionId: question.id,
            selectedOptionIds,
            isCorrect,
            awardedPoints: isCorrect ? question.points : 0,
        };
    }

    const textAnswer = answer?.textAnswer ?? "";
    const hasAnswerKey = Boolean(question.correctText?.trim());
    if (!hasAnswerKey) {
        return { questionId: question.id, textAnswer };
    }

    const isCorrect = normalizeText(textAnswer) === normalizeText(question.correctText);
    return {
        questionId: question.id,
        textAnswer,
        isCorrect,
        awardedPoints: isCorrect ? question.points : 0,
    };
}

function redactExam(exam: ILocalExamDoc) {
    const plain = exam.toObject();
    return {
        ...plain,
        questions: plain.questions.map((question: ILocalExamQuestion) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            points: question.points,
            options: question.options?.map((option) => ({
                id: option.id,
                label: option.label,
            })),
        })),
    };
}

async function findLocalExam(id: string): Promise<ILocalExamDoc> {
    const exam = await LocalExamModel.findById(asObjectId(id, "exam id"));
    if (!exam) {
        throw new AppError("Local exam not found", 404);
    }
    return exam;
}

export async function createLocalExam(
    payload: CreateLocalExamInput,
    user: IUserDoc,
) {
    const exam = await LocalExamModel.create({
        type: "local",
        title: payload.title,
        description: payload.description,
        questions: payload.questions,
        totalPoints: totalPoints(payload.questions),
        assignedStudents: [],
        status: payload.status,
        dueAt: payload.dueAt,
        createdBy: user._id,
        importedBy: user._id,
    });

    return { exam };
}

export async function updateLocalExam(id: string, payload: UpdateLocalExamInput) {
    const exam = await findLocalExam(id);
    if (exam.status !== "draft") {
        throw new AppError("Only draft local exams can be edited", 409);
    }

    if (payload.title !== undefined) exam.title = payload.title;
    if (payload.description !== undefined) exam.description = payload.description;
    if (payload.questions !== undefined) {
        exam.questions = payload.questions;
        exam.totalPoints = totalPoints(payload.questions);
    }
    if (payload.dueAt !== undefined) exam.dueAt = payload.dueAt;
    if (payload.status !== undefined) exam.status = payload.status;

    await exam.save();
    return { exam };
}

export async function assignStudentsToLocalExam(
    id: string,
    payload: AssignStudentsInput,
) {
    const exam = await findLocalExam(id);
    const studentIds = payload.studentIds.map((studentId) =>
        asObjectId(studentId, "student id"),
    );
    const existingCount = await Student.countDocuments({ _id: { $in: studentIds } });
    if (existingCount !== studentIds.length) {
        throw new AppError("One or more students were not found", 404);
    }

    const current = new Set(exam.assignedStudents.map((studentId) => String(studentId)));
    for (const studentId of studentIds) {
        current.add(String(studentId));
    }
    exam.assignedStudents = [...current].map((studentId) => new Types.ObjectId(studentId));
    await exam.save();

    return { exam };
}

export async function publishLocalExam(id: string) {
    const exam = await findLocalExam(id);
    exam.status = "published";
    await exam.save();
    return { exam };
}

export async function closeLocalExam(id: string) {
    const exam = await findLocalExam(id);
    exam.status = "closed";
    await exam.save();
    return { exam };
}

export async function getAssignedLocalExams(studentId: Types.ObjectId) {
    const exams = await LocalExamModel.find({
        assignedStudents: studentId,
        status: "published",
    }).sort({ dueAt: 1, updatedAt: -1 });

    const results = await LocalExamResultModel.find({
        student: studentId,
        exam: { $in: exams.map((exam) => exam._id) },
    });
    const resultByExam = new Map(results.map((result) => [String(result.exam), result]));

    return exams.map((exam) => ({
        exam: redactExam(exam),
        result: resultByExam.get(String(exam._id)) ?? null,
    }));
}

export async function startOrGetLocalExam(id: string, studentId: Types.ObjectId) {
    const exam = await findLocalExam(id);
    if (exam.status !== "published") {
        throw new AppError("This exam is not open", 409);
    }
    if (!exam.assignedStudents.some((assignedId) => assignedId.equals(studentId))) {
        throw new AppError("This exam is not assigned to you", 403);
    }

    const result = await LocalExamResultModel.findOneAndUpdate(
        { exam: exam._id, student: studentId },
        {
            $setOnInsert: {
                type: "local",
                exam: exam._id,
                student: studentId,
                answers: [],
                status: "in_progress",
                autoGradedScore: 0,
                maxScore: exam.totalPoints,
                confirmedAt: new Date(),
            },
        },
        { new: true, upsert: true },
    );

    return { exam: redactExam(exam), result };
}

export async function submitLocalExam(
    id: string,
    studentId: Types.ObjectId,
    payload: SubmitLocalExamInput,
) {
    const exam = await findLocalExam(id);
    if (exam.status !== "published") {
        throw new AppError("This exam is not open", 409);
    }
    if (!exam.assignedStudents.some((assignedId) => assignedId.equals(studentId))) {
        throw new AppError("This exam is not assigned to you", 403);
    }

    const result = await LocalExamResultModel.findOne({
        exam: exam._id,
        student: studentId,
    });
    if (result?.status !== undefined && result.status !== "in_progress") {
        throw new AppError("This exam has already been submitted", 409);
    }

    const answerByQuestion = new Map(
        payload.answers.map((answer) => [answer.questionId, answer]),
    );
    const answers = exam.questions.map((question) =>
        gradeAnswer(question, answerByQuestion.get(question.id)),
    );
    const autoGradedScore = answers.reduce(
        (total, answer) => total + (answer.awardedPoints ?? 0),
        0,
    );
    const fullyGraded = answers.every(
        (answer) => typeof answer.awardedPoints === "number",
    );

    const saved = await LocalExamResultModel.findOneAndUpdate(
        { exam: exam._id, student: studentId },
        {
            $set: {
                type: "local",
                exam: exam._id,
                student: studentId,
                answers,
                status: fullyGraded ? "graded" : "submitted",
                autoGradedScore,
                score: fullyGraded ? autoGradedScore : undefined,
                maxScore: exam.totalPoints,
                submittedAt: new Date(),
                confirmedAt: new Date(),
            },
        },
        { new: true, upsert: true },
    );

    return { result: saved };
}

export async function gradeLocalExamResult(
    resultId: string,
    payload: GradeLocalExamResultInput,
    user: IUserDoc,
) {
    const result = await LocalExamResultModel.findById(asObjectId(resultId, "result id"));
    if (!result) {
        throw new AppError("Local exam result not found", 404);
    }
    if (result.status === "in_progress") {
        throw new AppError("Cannot grade an in-progress exam", 409);
    }

    const exam = await LocalExamModel.findById(result.exam);
    if (!exam) {
        throw new AppError("Local exam not found", 404);
    }

    const questionById = new Map(
        exam.questions.map((question) => [question.id, question]),
    );
    const changes: ILocalExamGradeEditChange[] = [];

    if (payload.answers) {
        for (const override of payload.answers) {
            const question = questionById.get(override.questionId);
            if (!question) {
                throw new AppError(
                    `Question ${override.questionId} does not belong to this exam`,
                    400,
                );
            }
            if (override.awardedPoints > question.points) {
                throw new AppError(
                    `Awarded points for question ${override.questionId} exceeds the question max (${question.points})`,
                    400,
                );
            }
        }

        const overrideById = new Map(
            payload.answers.map((answer) => [
                answer.questionId,
                { awardedPoints: answer.awardedPoints, isCorrect: answer.isCorrect },
            ]),
        );

        let anyAnswerChanged = false;
        const nextAnswers: ILocalExamAnswer[] = result.answers.map((answer) => {
            const override = overrideById.get(answer.questionId);
            if (!override) return { ...answer };
            const nextPoints = override.awardedPoints;
            const nextIsCorrect =
                override.isCorrect !== undefined ? override.isCorrect : answer.isCorrect;
            const pointsChanged = nextPoints !== answer.awardedPoints;
            const correctChanged = nextIsCorrect !== answer.isCorrect;
            if (!pointsChanged && !correctChanged) return { ...answer };
            if (pointsChanged) {
                changes.push({
                    questionId: answer.questionId,
                    field: "awardedPoints",
                    before: answer.awardedPoints,
                    after: nextPoints,
                });
            }
            anyAnswerChanged = true;
            return {
                ...answer,
                awardedPoints: nextPoints,
                isCorrect: nextIsCorrect,
                manualOverride: true,
            };
        });
        if (anyAnswerChanged) {
            result.set("answers", nextAnswers);
            result.markModified("answers");
        }
    }

    if (payload.manualOverrideScore !== result.manualOverrideScore) {
        changes.push({
            field: "manualOverrideScore",
            before: result.manualOverrideScore,
            after: payload.manualOverrideScore,
        });
        result.manualOverrideScore = payload.manualOverrideScore;
    }

    const computedScore = result.answers.reduce(
        (total, answer) => total + (answer.awardedPoints ?? 0),
        0,
    );
    const finalScore = result.manualOverrideScore ?? computedScore;
    result.score = finalScore;

    if (result.status !== "graded") {
        changes.push({
            field: "status",
            before: result.status,
            after: "graded",
        });
        result.status = "graded";
    }

    if (changes.length > 0) {
        result.gradeEdits.push({
            editedBy: user._id,
            editedAt: new Date(),
            changes,
        });
        result.confirmedBy = user._id;
        result.confirmedAt = new Date();
    }

    await result.save();

    return { result };
}

export async function deleteLocalExam(id: string) {
    const exam = await findLocalExam(id);
    await LocalExamResultModel.deleteMany({ exam: exam._id });
    await exam.deleteOne();
    return { ok: true };
}

export async function reopenLocalExamResult(resultId: string, user: IUserDoc) {
    const result = await LocalExamResultModel.findById(asObjectId(resultId, "result id"));
    if (!result) {
        throw new AppError("Local exam result not found", 404);
    }
    if (result.status === "in_progress") {
        throw new AppError("Exam is already in progress", 409);
    }

    const previousStatus = result.status;
    result.status = "in_progress";
    result.set("score", undefined);
    result.set("manualOverrideScore", undefined);
    result.gradeEdits.push({
        editedBy: user._id,
        editedAt: new Date(),
        changes: [
            { field: "reopened", before: previousStatus, after: "in_progress" },
        ],
    });
    await result.save();

    return { result };
}
