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
import { createCodeReviewExam } from "../services/codeReviewExamService.js";
import {
    assignStudentsToLocalExam,
    closeLocalExam,
    createLocalExam,
    deleteLocalExam,
    getAssignedLocalExams,
    gradeLocalExamResult,
    publishLocalExam,
    reopenLocalExamResult,
    startOrGetLocalExam,
    submitLocalExam,
    updateLocalExam,
} from "../services/localExamService.js";
import {
    assignStudentsSchema,
    createCodeReviewExamSchema,
    createLocalExamSchema,
    examIdParamSchema,
    gradeLocalExamResultSchema,
    googleFormIdParamSchema,
    importGoogleExamSchema,
    resultIdParamSchema,
    submitLocalExamSchema,
    updateLocalExamSchema,
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
            .populate("students")
            .sort({ score: -1, updatedAt: -1 });
        res.status(200).json({ success: true, data: { exam, results } });
    }

    async getMyExamResults(req: Request, res: Response) {
        const student = await this.getLinkedStudentId(req);
        const results = await ExamResult.find({
            $or: [{ student }, { students: student }],
        })
            .populate("exam")
            .populate("students")
            .sort({ updatedAt: -1 });
        res.status(200).json({ success: true, data: results });
    }

    async getMyExamResult(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const student = await this.getLinkedStudentId(req);
        const result = await ExamResult.findOne({
            _id: id,
            $or: [{ student }, { students: student }],
        })
            .populate("exam")
            .populate("student")
            .populate("students");
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

    async createCodeReviewExam(req: Request, res: Response) {
        const user = await this.getCurrentUser(req);
        const payload = createCodeReviewExamSchema.parse(req.body);
        const result = await createCodeReviewExam(payload, user);
        res.status(201).json({ success: true, data: result });
    }

    async createLocalExam(req: Request, res: Response) {
        const user = await this.getCurrentUser(req);
        const payload = createLocalExamSchema.parse(req.body);
        const result = await createLocalExam(payload, user);
        res.status(201).json({ success: true, data: result });
    }

    async updateLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const payload = updateLocalExamSchema.parse(req.body);
        const result = await updateLocalExam(id, payload);
        res.status(200).json({ success: true, data: result });
    }

    async assignLocalExamStudents(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const payload = assignStudentsSchema.parse(req.body);
        const result = await assignStudentsToLocalExam(id, payload);
        res.status(200).json({ success: true, data: result });
    }

    async publishLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const result = await publishLocalExam(id);
        res.status(200).json({ success: true, data: result });
    }

    async closeLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const result = await closeLocalExam(id);
        res.status(200).json({ success: true, data: result });
    }

    async deleteLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const result = await deleteLocalExam(id);
        res.status(200).json({ success: true, data: result });
    }

    async getAssignedLocalExams(req: Request, res: Response) {
        const student = await this.getLinkedStudentId(req);
        const result = await getAssignedLocalExams(student);
        res.status(200).json({ success: true, data: result });
    }

    async startLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const student = await this.getLinkedStudentId(req);
        const result = await startOrGetLocalExam(id, student);
        res.status(200).json({ success: true, data: result });
    }

    async submitLocalExam(req: Request, res: Response) {
        const { id } = examIdParamSchema.parse(req.params);
        const student = await this.getLinkedStudentId(req);
        const payload = submitLocalExamSchema.parse(req.body);
        const result = await submitLocalExam(id, student, payload);
        res.status(200).json({ success: true, data: result });
    }

    async gradeLocalExamResult(req: Request, res: Response) {
        const user = await this.getCurrentUser(req);
        const { resultId } = resultIdParamSchema.parse(req.params);
        const payload = gradeLocalExamResultSchema.parse(req.body);
        const result = await gradeLocalExamResult(resultId, payload, user);
        res.status(200).json({ success: true, data: result });
    }

    async reopenLocalExamResult(req: Request, res: Response) {
        const user = await this.getCurrentUser(req);
        const { resultId } = resultIdParamSchema.parse(req.params);
        const result = await reopenLocalExamResult(resultId, user);
        res.status(200).json({ success: true, data: result });
    }

    private async getCurrentUser(req: Request) {
        const sub = req.auth?.payload?.sub;
        if (!sub) {
            throw new AppError("User information not found in token", 401);
        }

        const user = await User.findByAuth0Id(sub);
        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    }

    private async getLinkedStudentId(req: Request) {
        const user = await this.getCurrentUser(req);
        const linkedUser = await linkUserToStudentByEmail(user);
        if (!linkedUser.student) {
            throw new AppError("Student profile not found", 404);
        }
        return linkedUser.student;
    }
}

export default ExamsController;
