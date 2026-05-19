import type { Request, Response } from "express";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import { createStudentSchema, updateStudentSchema } from "../zod/studentsZod.js";
import { AppError } from "../utils/errorHandler.js";
import {
    linkStudentToExistingUser,
    linkUserToStudentByEmail,
    normalizeEmail,
} from "../services/studentLinkingService.js";

class StudentsController {
    async getStudents(_req: Request, res: Response) {
        const students = await Student.find().sort({ englishName: 1 });
        res.status(200).json({ success: true, data: students });
    }

    async createStudent(req: Request, res: Response) {
        const payload = createStudentSchema.parse(req.body);
        const email = normalizeEmail(payload.email);
        const student = await Student.create({
            ...payload,
            email,
            status: payload.status ?? (email ? "active" : "pending"),
        });
        const linkedStudent = await linkStudentToExistingUser(student);
        res.status(201).json({ success: true, data: linkedStudent });
    }

    async updateStudent(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            throw new AppError("Student ID is required", 400);
        }

        const payload = updateStudentSchema.parse(req.body);
        if (Object.keys(payload).length === 0) {
            throw new AppError("At least one field must be provided for update", 400);
        }

        const updateData = {
            ...payload,
            ...(payload.email !== undefined
                ? { email: normalizeEmail(payload.email) }
                : {}),
        };

        const student = await Student.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });
        if (!student) {
            throw new AppError("Student not found", 404);
        }

        const linkedStudent = await linkStudentToExistingUser(student);
        res.status(200).json({ success: true, data: linkedStudent });
    }

    async deleteStudent(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            throw new AppError("Student ID is required", 400);
        }

        const student = await Student.findByIdAndDelete(id);
        if (!student) {
            throw new AppError("Student not found", 404);
        }

        if (student.user) {
            await User.findByIdAndUpdate(student.user, {
                $unset: { student: "" },
                $set: { role: "user" },
            });
        }

        res.status(200).json({
            success: true,
            message: "Student deleted successfully",
        });
    }

    async getCurrentStudent(req: Request, res: Response) {
        const sub = req.auth?.payload?.sub;
        if (!sub) {
            throw new AppError("User information not found in token", 401);
        }

        const user = await User.findByAuth0Id(sub);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        const linkedUser = await linkUserToStudentByEmail(user);
        if (!linkedUser.student) {
            throw new AppError("Student profile not found", 404);
        }

        const student = await Student.findById(linkedUser.student);
        if (!student) {
            throw new AppError("Student profile not found", 404);
        }

        res.status(200).json({
            success: true,
            data: {
                student,
                user: linkedUser,
                linked: Boolean(student.user),
            },
        });
    }
}

export default StudentsController;
