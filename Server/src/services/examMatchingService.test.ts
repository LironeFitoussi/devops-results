import { describe, expect, it } from "vitest";
import { Types } from "mongoose";
import { predictStudentMatches } from "./examMatchingService.js";
import type { IStudentDoc } from "../types/index.js";

function student({
    englishName,
    hebrewName,
    studentId,
    email = "",
}: {
    englishName: string;
    hebrewName: string;
    studentId: string;
    email?: string;
}): IStudentDoc {
    return {
        _id: new Types.ObjectId(),
        englishName,
        hebrewName,
        studentId,
        email,
        status: "active",
    } as IStudentDoc;
}

const students = [
    student({
        englishName: "Daniel Rosman",
        hebrewName: "דניאל רוסמן",
        studentId: "111111111",
    }),
    student({
        englishName: "Daniel Yacov",
        hebrewName: "דניאל יעקב",
        studentId: "222222222",
    }),
    student({
        englishName: "Yuval Dar",
        hebrewName: "יובל דר",
        studentId: "333333333",
    }),
    student({
        englishName: "Yuval Farkash",
        hebrewName: "יובל פרקש",
        studentId: "444444444",
    }),
    student({
        englishName: "Maxim Raikinakh",
        hebrewName: "מקסים רייקניך",
        studentId: "555555555",
    }),
];

describe("exam matching", () => {
    it("matches split Hebrew first and last name fields", () => {
        const result = predictStudentMatches(
            {
                responseId: "r1",
                answers: {
                    first: { textAnswers: { answers: [{ value: "מקסים " }] } },
                    last: { textAnswers: { answers: [{ value: "רייקניך" }] } },
                },
            },
            students,
            {
                mode: "firstLast",
                firstNameQuestionId: "first",
                lastNameQuestionId: "last",
            },
        );

        expect(result.predictedStudent?.englishName).toBe("Maxim Raikinakh");
        expect(result.predictedStudent?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("matches selected full name fields", () => {
        const result = predictStudentMatches(
            {
                responseId: "r2",
                answers: {
                    full: { textAnswers: { answers: [{ value: "Yuval Dar" }] } },
                },
            },
            students,
            { mode: "fullName", fullNameQuestionId: "full" },
        );

        expect(result.predictedStudent?.englishName).toBe("Yuval Dar");
        expect(result.predictedStudent?.confidence).toBeGreaterThanOrEqual(0.9);
    });

    it("does not auto-predict ambiguous first-name-only responses", () => {
        const result = predictStudentMatches(
            {
                responseId: "r3",
                answers: {
                    first: { textAnswers: { answers: [{ value: "Daniel" }] } },
                    last: { textAnswers: { answers: [{ value: "" }] } },
                },
            },
            students,
            {
                mode: "firstLast",
                firstNameQuestionId: "first",
                lastNameQuestionId: "last",
            },
        );

        expect(result.predictedStudent).toBeUndefined();
        expect(result.candidates[0]?.confidence).toBeLessThan(0.9);
    });

    it("uses file names as fallback evidence for incomplete text fields", () => {
        const result = predictStudentMatches(
            {
                responseId: "r4",
                answers: {
                    first: { textAnswers: { answers: [{ value: "Yuval" }] } },
                    last: { textAnswers: { answers: [{ value: "" }] } },
                    upload: {
                        fileUploadAnswers: {
                            answers: [{ fileName: "screenshot - yuval farkash.png" }],
                        },
                    },
                },
            },
            students,
            {
                mode: "firstLast",
                firstNameQuestionId: "first",
                lastNameQuestionId: "last",
            },
        );

        expect(result.predictedStudent?.englishName).toBe("Yuval Farkash");
        expect(result.predictedStudent?.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it("matches exact student ids when present", () => {
        const result = predictStudentMatches(
            {
                responseId: "r5",
                answers: {
                    full: { textAnswers: { answers: [{ value: "student 222222222" }] } },
                },
            },
            students,
            { mode: "fullName", fullNameQuestionId: "full" },
        );

        expect(result.predictedStudent?.englishName).toBe("Daniel Yacov");
        expect(result.predictedStudent?.confidence).toBe(1);
    });
});
