import type { OAuth2Client } from "google-auth-library";
import type { Types } from "mongoose";
import { GoogleFormExamModel } from "../models/examModel.js";
import { GoogleFormResultModel } from "../models/examResultModel.js";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import { getForm, getResponses } from "./googleFormsService.js";
import {
    extractIdentity,
    predictStudentMatches,
    type GoogleResponseLike,
} from "./examMatchingService.js";
import type {
    ExamIdentityConfig,
    IGoogleFormExamDoc,
    IUserDoc,
} from "../types/index.js";
import { AppError } from "../utils/errorHandler.js";

interface FormInfo {
    title?: string;
    documentTitle?: string;
    description?: string;
}

interface FormQuestion {
    grading?: {
        pointValue?: number;
    };
}

interface FormItem {
    itemId?: string;
    title?: string;
    questionItem?: {
        question?: FormQuestion;
    };
}

interface GoogleFormLike {
    formId?: string;
    info?: FormInfo;
    items?: FormItem[];
}

interface GoogleResponsesLike {
    responses?: GoogleResponseLike[];
}

export interface ConfirmedImportRow {
    responseId: string;
    studentId: string;
    matchConfidence?: number | undefined;
}

function asGoogleForm(value: unknown): GoogleFormLike {
    return value as GoogleFormLike;
}

function asGoogleResponses(value: unknown): GoogleResponsesLike {
    return value as GoogleResponsesLike;
}

export function formTitle(form: GoogleFormLike, fallback: string): string {
    return form.info?.title ?? form.info?.documentTitle ?? fallback;
}

export function possibleScore(items: FormItem[] = []): number | undefined {
    const scores = items
        .map((item) => item.questionItem?.question?.grading?.pointValue)
        .filter((score): score is number => typeof score === "number");
    if (scores.length === 0) {
        return undefined;
    }
    return scores.reduce((total, score) => total + score, 0);
}

async function fetchExamSource(auth: OAuth2Client, formId: string) {
    const [formRaw, responsesRaw] = await Promise.all([
        getForm(auth, formId),
        getResponses(auth, formId),
    ]);
    const form = asGoogleForm(formRaw);
    const responses = asGoogleResponses(responsesRaw).responses ?? [];
    return { form, responses };
}

export async function buildImportPreview(
    auth: OAuth2Client,
    formId: string,
    identityConfig: ExamIdentityConfig,
) {
    const [{ form, responses }, students] = await Promise.all([
        fetchExamSource(auth, formId),
        Student.find({ status: { $ne: "graduated" } }).sort({ englishName: 1 }),
    ]);

    return {
        form: {
            googleFormId: form.formId ?? formId,
            title: formTitle(form, formId),
            maxScore: possibleScore(form.items),
            identityConfig,
        },
        responses: responses
            .filter((response) => response.responseId)
            .map((response) =>
                predictStudentMatches(response, students, identityConfig),
            ),
        students: students.map((student) => ({
            _id: String(student._id as Types.ObjectId),
            studentId: student.studentId,
            hebrewName: student.hebrewName,
            englishName: student.englishName,
            email: student.email,
            status: student.status,
        })),
    };
}

async function upsertExam(
    form: GoogleFormLike,
    formId: string,
    identityConfig: ExamIdentityConfig,
    importedBy?: Types.ObjectId,
): Promise<IGoogleFormExamDoc> {
    const update = {
        googleFormId: form.formId ?? formId,
        title: formTitle(form, formId),
        documentTitle: form.info?.documentTitle,
        description: form.info?.description,
        questionSnapshot: form.items ?? [],
        maxScore: possibleScore(form.items),
        identityConfig,
        ...(importedBy ? { importedBy } : {}),
    };

    return GoogleFormExamModel.findOneAndUpdate(
        { googleFormId: formId },
        update,
        {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true,
        },
    ) as Promise<IGoogleFormExamDoc>;
}

export async function importConfirmedGoogleExam(
    auth: OAuth2Client,
    formId: string,
    identityConfig: ExamIdentityConfig,
    confirmedRows: ConfirmedImportRow[],
    user: IUserDoc,
) {
    if (confirmedRows.length === 0) {
        throw new AppError("At least one confirmed row is required", 400);
    }

    const { form, responses } = await fetchExamSource(auth, formId);
    const maxScore = possibleScore(form.items);
    const exam = await upsertExam(
        form,
        formId,
        identityConfig,
        user._id as Types.ObjectId,
    );

    const responseById = new Map(
        responses
            .filter((response) => response.responseId)
            .map((response) => [response.responseId as string, response]),
    );

    const savedResults = [];
    for (const row of confirmedRows) {
        const response = responseById.get(row.responseId);
        if (!response) {
            throw new AppError(`Response ${row.responseId} not found in Google Form`, 400);
        }

        const student = await Student.findById(row.studentId);
        if (!student) {
            throw new AppError(`Student ${row.studentId} not found`, 400);
        }

        const extractedIdentity = extractIdentity(response, identityConfig);
        const resultUpdate = {
            exam: exam._id,
            student: student._id,
            googleResponseId: row.responseId,
            score: response.totalScore,
            maxScore,
            answersSnapshot: response.answers ?? {},
            extractedIdentity,
            matchConfidence: row.matchConfidence ?? 1,
            confirmedBy: user._id,
            confirmedAt: new Date(),
        };

        const saved = await GoogleFormResultModel.findOneAndUpdate(
            { exam: exam._id, googleResponseId: row.responseId },
            resultUpdate,
            {
                new: true,
                upsert: true,
                runValidators: true,
                setDefaultsOnInsert: true,
            },
        ).populate("student");
        savedResults.push(saved);
    }

    return { exam, results: savedResults };
}

export async function getUserWithGoogleToken(sub: string) {
    const user = await User.findOne({ auth0Id: sub }).select("+googleRefreshToken");
    if (!user) {
        throw new AppError("User not found", 404);
    }
    if (!user.googleRefreshToken) {
        throw new AppError("Google account not connected", 409);
    }
    return user;
}
