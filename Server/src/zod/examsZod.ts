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

export const resultIdParamSchema = z.object({
    resultId: z.string().trim().min(1),
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

const localExamOptionSchema = z.object({
    id: z.string().trim().min(1),
    label: z.string().trim().min(1),
    isCorrect: z.boolean().default(false),
});

const localChoiceQuestionBaseSchema = z
    .object({
        id: z.string().trim().min(1),
        type: z.enum(["single_choice", "multi_choice"]),
        prompt: z.string().trim().min(1),
        points: z.number().min(0),
        options: z.array(localExamOptionSchema).min(2),
    });

const localSingleChoiceQuestionSchema = localChoiceQuestionBaseSchema
    .extend({ type: z.literal("single_choice") })
    .superRefine((question, ctx) => {
        const optionIds = new Set(question.options.map((option) => option.id));
        if (optionIds.size !== question.options.length) {
            ctx.addIssue({
                code: "custom",
                message: "Option IDs must be unique",
                path: ["options"],
            });
        }

        const correctCount = question.options.filter((option) => option.isCorrect).length;
        if (correctCount !== 1) {
            ctx.addIssue({
                code: "custom",
                message: "Single choice questions must have exactly one correct option",
                path: ["options"],
            });
        }
    });

const localMultiChoiceQuestionSchema = localChoiceQuestionBaseSchema
    .extend({ type: z.literal("multi_choice") })
    .superRefine((question, ctx) => {
        const optionIds = new Set(question.options.map((option) => option.id));
        if (optionIds.size !== question.options.length) {
            ctx.addIssue({
                code: "custom",
                message: "Option IDs must be unique",
                path: ["options"],
            });
        }

        const correctCount = question.options.filter((option) => option.isCorrect).length;
        if (correctCount < 1) {
            ctx.addIssue({
                code: "custom",
                message: "Multi choice questions must have at least one correct option",
                path: ["options"],
            });
        }
    });

const localTextQuestionSchema = z.object({
    id: z.string().trim().min(1),
    type: z.enum(["short_text", "long_text"]),
    prompt: z.string().trim().min(1),
    points: z.number().min(0),
    correctText: z.string().trim().optional(),
});

export const localExamQuestionSchema = z.union([
    localSingleChoiceQuestionSchema,
    localMultiChoiceQuestionSchema,
    localTextQuestionSchema.extend({ type: z.literal("short_text") }),
    localTextQuestionSchema.extend({ type: z.literal("long_text") }),
]);

export const createLocalExamSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().optional(),
    questions: z.array(localExamQuestionSchema).min(1),
    dueAt: z.coerce.date().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
});

export const updateLocalExamSchema = createLocalExamSchema.partial().extend({
    questions: z.array(localExamQuestionSchema).min(1).optional(),
});

export const assignStudentsSchema = z.object({
    studentIds: z.array(z.string().trim().min(1)).min(1),
});

export const submitLocalExamSchema = z.object({
    answers: z.array(
        z.object({
            questionId: z.string().trim().min(1),
            selectedOptionIds: z.array(z.string().trim().min(1)).optional(),
            textAnswer: z.string().optional(),
        }),
    ),
});

export const gradeLocalExamResultSchema = z.object({
    manualOverrideScore: z.number().min(0).optional(),
    answers: z
        .array(
            z.object({
                questionId: z.string().trim().min(1),
                awardedPoints: z.number().min(0),
            }),
        )
        .optional(),
});
