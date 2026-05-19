import { beforeEach, describe, expect, it, vi } from "vitest";
import { Types } from "mongoose";

vi.mock("../models/studentModel.js", () => ({
    default: {
        findByNormalizedEmail: vi.fn(),
        findById: vi.fn(),
    },
}));

vi.mock("../models/userModel.js", () => ({
    default: {
        findOne: vi.fn(),
    },
}));

import Student from "../models/studentModel.js";
import {
    linkUserToStudentByEmail,
    normalizeEmail,
} from "./studentLinkingService.js";

const mockedStudent = vi.mocked(Student);

describe("student linking", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("normalizes emails for matching", () => {
        expect(normalizeEmail("  Student@Example.COM ")).toBe(
            "student@example.com",
        );
        expect(normalizeEmail("")).toBe("");
        expect(normalizeEmail(undefined)).toBe("");
    });

    it("links a matching student to a user", async () => {
        const userId = new Types.ObjectId();
        const studentId = new Types.ObjectId();
        const user = {
            _id: userId,
            email: "Student@Example.COM",
            role: "user",
            student: undefined,
            save: vi.fn(),
        };
        user.save.mockResolvedValue(user);
        const student = {
            _id: studentId,
            user: undefined,
            save: vi.fn(),
        };
        student.save.mockResolvedValue(student);
        mockedStudent.findByNormalizedEmail.mockResolvedValue(student as never);

        const linkedUser = await linkUserToStudentByEmail(user as never);

        expect(mockedStudent.findByNormalizedEmail).toHaveBeenCalledWith(
            "student@example.com",
        );
        expect(linkedUser.role).toBe("student");
        expect(linkedUser.student).toBeDefined();
        expect(student.user).toBeDefined();
        expect((linkedUser.student as Types.ObjectId).equals(studentId)).toBe(
            true,
        );
        expect((student.user as unknown as Types.ObjectId).equals(userId)).toBe(
            true,
        );
        expect(user.save).toHaveBeenCalledTimes(1);
        expect(student.save).toHaveBeenCalledTimes(1);
    });

    it("leaves unmatched users unchanged", async () => {
        const user = {
            _id: new Types.ObjectId(),
            email: "user@example.com",
            role: "user",
            save: vi.fn(),
        };
        mockedStudent.findByNormalizedEmail.mockResolvedValue(null);

        const linkedUser = await linkUserToStudentByEmail(user as never);

        expect(linkedUser).toBe(user);
        expect(user.role).toBe("user");
        expect(user.save).not.toHaveBeenCalled();
    });

    it("does not resave an already linked user and student", async () => {
        const userId = new Types.ObjectId();
        const studentId = new Types.ObjectId();
        const user = {
            _id: userId,
            email: "student@example.com",
            role: "student",
            student: studentId,
            save: vi.fn(),
        };
        const student = {
            _id: studentId,
            user: userId,
            save: vi.fn(),
        };
        mockedStudent.findByNormalizedEmail.mockResolvedValue(student as never);

        await linkUserToStudentByEmail(user as never);

        expect(user.save).not.toHaveBeenCalled();
        expect(student.save).not.toHaveBeenCalled();
    });
});
