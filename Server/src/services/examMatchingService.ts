import type { Types } from "mongoose";
import type { ExamIdentityConfig, IStudentDoc } from "../types/index.js";

const HEBREW_OR_ENGLISH_OR_DIGIT = /[^\p{Script=Hebrew}\p{Script=Latin}\p{Number}]+/gu;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const ID_PATTERN = /\b\d{5,10}\b/g;

interface TextAnswer {
    value?: string;
}

interface FileAnswer {
    fileName?: string;
}

interface ResponseAnswer {
    textAnswers?: {
        answers?: TextAnswer[];
    };
    fileUploadAnswers?: {
        answers?: FileAnswer[];
    };
}

export interface GoogleResponseLike {
    responseId?: string;
    respondentEmail?: string;
    totalScore?: number;
    answers?: Record<string, ResponseAnswer>;
}

export interface ExtractedIdentity {
    firstName?: string;
    lastName?: string;
    fullName?: string;
    fallbackEvidence: string[];
}

export interface StudentMatch {
    studentId: string;
    studentObjectId: string;
    hebrewName: string;
    englishName: string;
    confidence: number;
    reasons: string[];
}

export interface ResponsePrediction {
    responseId: string;
    extractedIdentity: ExtractedIdentity;
    predictedStudent?: StudentMatch;
    candidates: StudentMatch[];
    score?: number;
}

function compact(value: string | undefined): string | undefined {
    const cleaned = value?.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
    return cleaned ? cleaned : undefined;
}

export function normalizeIdentity(value: string | undefined): string {
    return (
        compact(value)
            ?.toLocaleLowerCase("en-US")
            .replace(HEBREW_OR_ENGLISH_OR_DIGIT, " ")
            .replace(/\s+/g, " ")
            .trim() ?? ""
    );
}

function tokens(value: string | undefined): string[] {
    const normalized = normalizeIdentity(value);
    return normalized ? normalized.split(" ").filter(Boolean) : [];
}

function getTextAnswer(response: GoogleResponseLike, questionId?: string): string | undefined {
    if (!questionId) {
        return undefined;
    }
    const answer = response.answers?.[questionId];
    const values =
        answer?.textAnswers?.answers
            ?.map((entry) => compact(entry.value))
            .filter((entry): entry is string => Boolean(entry)) ?? [];
    return compact(values.join(" "));
}

function fileEvidence(response: GoogleResponseLike): string[] {
    return Object.values(response.answers ?? {})
        .flatMap((answer) => answer.fileUploadAnswers?.answers ?? [])
        .map((entry) => compact(entry.fileName))
        .filter((entry): entry is string => Boolean(entry));
}

export function extractIdentity(
    response: GoogleResponseLike,
    identityConfig: ExamIdentityConfig,
): ExtractedIdentity {
    const fallbackEvidence = fileEvidence(response);
    if (identityConfig.mode === "fullName") {
        const fullName = getTextAnswer(response, identityConfig.fullNameQuestionId);
        return {
            ...(fullName ? { fullName } : {}),
            fallbackEvidence,
        };
    }

    const firstName = getTextAnswer(response, identityConfig.firstNameQuestionId);
    const lastName = getTextAnswer(response, identityConfig.lastNameQuestionId);
    return {
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        fallbackEvidence,
    };
}

function studentPlainId(student: IStudentDoc): string {
    return String(student._id as Types.ObjectId);
}

function scoreStudent(
    student: IStudentDoc,
    extracted: ExtractedIdentity,
    respondentEmail?: string,
): StudentMatch {
    const reasons: string[] = [];
    let confidence = 0;

    const identityText = [extracted.fullName, extracted.firstName, extracted.lastName]
        .filter(Boolean)
        .join(" ");
    const normalizedIdentity = normalizeIdentity(identityText);
    const identityTokens = new Set(tokens(identityText));
    const fallbackTokens = new Set(tokens(extracted.fallbackEvidence.join(" ")));
    const studentIdMatches = [...identityText.matchAll(ID_PATTERN)].map((match) => match[0]);
    const email = identityText.match(EMAIL_PATTERN)?.[0] ?? respondentEmail;

    const english = normalizeIdentity(student.englishName);
    const hebrew = normalizeIdentity(student.hebrewName);
    const englishTokens = tokens(student.englishName);
    const hebrewTokens = tokens(student.hebrewName);
    const allStudentTokens = [...englishTokens, ...hebrewTokens];

    if (studentIdMatches.includes(student.studentId)) {
        confidence = 1;
        reasons.push("student id");
    }

    if (
        email &&
        student.email &&
        email.trim().toLocaleLowerCase("en-US") ===
            student.email.trim().toLocaleLowerCase("en-US")
    ) {
        confidence = Math.max(confidence, 1);
        reasons.push("email");
    }

    if (normalizedIdentity && (normalizedIdentity === english || normalizedIdentity === hebrew)) {
        confidence = Math.max(confidence, 0.98);
        reasons.push("exact full name");
    }

    const first = extracted.firstName;
    const last = extracted.lastName;
    if (first && last) {
        const firstTokens = tokens(first);
        const lastTokens = tokens(last);
        const firstHit = firstTokens.some((token) => allStudentTokens.includes(token));
        const lastHit = lastTokens.some((token) => allStudentTokens.includes(token));
        if (firstHit && lastHit) {
            confidence = Math.max(confidence, 0.94);
            reasons.push("first and last name");
        }
    }

    const identityHits = allStudentTokens.filter((token) => identityTokens.has(token));
    if (identityHits.length >= 2) {
        confidence = Math.max(confidence, 0.9);
        reasons.push("multiple name tokens");
    } else if (identityHits.length === 1) {
        confidence = Math.max(confidence, 0.52);
        reasons.push("single name token");
    }

    const fallbackHits = allStudentTokens.filter((token) => fallbackTokens.has(token));
    if (confidence < 0.9 && fallbackHits.length >= 2) {
        confidence = Math.max(confidence, 0.86);
        reasons.push("file name");
    } else if (confidence < 0.7 && fallbackHits.length === 1) {
        confidence = Math.max(confidence, 0.62);
        reasons.push("file name token");
    }

    return {
        studentId: student.studentId,
        studentObjectId: studentPlainId(student),
        hebrewName: student.hebrewName,
        englishName: student.englishName,
        confidence,
        reasons,
    };
}

export function predictStudentMatches(
    response: GoogleResponseLike,
    students: IStudentDoc[],
    identityConfig: ExamIdentityConfig,
): ResponsePrediction {
    const extractedIdentity = extractIdentity(response, identityConfig);
    const candidates = students
        .map((student) => scoreStudent(student, extractedIdentity, response.respondentEmail))
        .filter((candidate) => candidate.confidence > 0)
        .sort((left, right) => right.confidence - left.confidence)
        .slice(0, 5);

    const [best, second] = candidates;
    const ambiguous =
        best && second && best.confidence < 0.9 && best.confidence - second.confidence < 0.15;
    const predictedStudent = best && !ambiguous ? best : undefined;

    return {
        responseId: response.responseId ?? "",
        extractedIdentity,
        ...(predictedStudent ? { predictedStudent } : {}),
        candidates,
        ...(typeof response.totalScore === "number" ? { score: response.totalScore } : {}),
    };
}
