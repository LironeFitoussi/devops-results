import { z } from "zod";

export const identityConfigSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("firstLast"),
        firstNameQuestionId: z.string().trim().min(1),
        lastNameQuestionId: z.string().trim().min(1),
    }),
    z.object({
        mode: z.literal("fullName"),
        fullNameQuestionId: z.string().trim().min(1),
    }),
]);

export const importPreviewSchema = z.object({
    identityConfig: identityConfigSchema,
});

export const confirmedImportRowSchema = z.object({
    responseId: z.string().trim().min(1),
    studentId: z.string().trim().min(1),
    matchConfidence: z.number().min(0).max(1).optional(),
});

export const importGoogleExamSchema = z.object({
    googleFormId: z.string().trim().min(1),
    identityConfig: identityConfigSchema,
    confirmedRows: z.array(confirmedImportRowSchema),
});

export const examIdParamSchema = z.object({
    id: z.string().trim().min(1),
});

export const googleFormIdParamSchema = z.object({
    formId: z.string().trim().min(1),
});

export const codeReviewResultRowSchema = z.object({
    studentIds: z.array(z.string().trim().min(1)).min(1),
    reviewText: z.string().trim().min(1),
    githubUrl: z.string().trim().url().optional(),
});

export const createCodeReviewExamSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().optional(),
    results: z.array(codeReviewResultRowSchema).min(1),
});
