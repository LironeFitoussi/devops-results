import type { Request, Response } from "express";
import Exam from "../models/examModel.js";
import ExamResult from "../models/examResultModel.js";
import { linkUserToStudentByEmail } from "../services/studentLinkingService.js";
import User from "../models/userModel.js";
import { authedClient } from "../services/googleOAuthService.js";
import {
    getUserWithGoogleToken,
    importConfirmedGoogleExam,
} from "../services/examImportService.js";
import {
    examIdParamSchema,
    googleFormIdParamSchema,
    importGoogleExamSchema,
} from "../zod/examsZod.js";
import { AppError } from "../utils/errorHandler.js";

class ExamsController {
    async getExams(_req: Request, res: Response) {
        const exams = await Exam.find().sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: exams });
    }

    async getExamByGoogleForm(req: Request, res: Response) {
        const { formId } = googleFormIdParamSchema.parse(req.params);
        const exam = await Exam.findOne({ googleFormId: formId });
        res.status(200).json({ success: true, data: exam });
    }

    async getExamResults(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const exam = await Exam.findById(id);
        if (!exam) {
            throw new AppError("Exam not found", 404);
        }
        const results = await ExamResult.find({ exam: id })
            .populate("student")
            .sort({ score: -1, updatedAt: -1 });
        res.status(200).json({ success: true, data: { exam, results } });
    }

    async getMyExamResults(req: Request, res: Response) {
        const student = await this.getLinkedStudentId(req);
        const results = await ExamResult.find({ student })
            .populate("exam")
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: results });
    }

    async getMyExamResult(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const student = await this.getLinkedStudentId(req);
        const result = await ExamResult.findOne({ _id: id, student })
            .populate("exam")
            .populate("student");
        if (!result) {
            throw new AppError("Exam result not found", 404);
        }
        res.status(200).json({ success: true, data: result });
    }

    async importGoogleExam(req: Request, res: Response) {
        const sub = req.auth?.payload?.sub;
        if (!sub) {
            throw new AppError("User information not found in token", 401);
        }

        const payload = importGoogleExamSchema.parse(req.body);
        const user = await getUserWithGoogleToken(sub);
        if (!user.googleRefreshToken) {
            throw new AppError("Google account not connected", 409);
        }
        const auth = authedClient(user.googleRefreshToken);
        const result = await importConfirmedGoogleExam(
            auth,
            payload.googleFormId,
            payload.identityConfig,
            payload.confirmedRows,
            user,
        );

        res.status(201).json({ success: true, data: result });
    }

    private async getLinkedStudentId(req: Request) {
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
        return linkedUser.student;
    }
}

export default ExamsController;
