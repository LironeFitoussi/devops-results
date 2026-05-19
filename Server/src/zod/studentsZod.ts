import { z } from "zod";

const emptyEmailToUndefined = (value: unknown) => {
    if (typeof value !== "string") {
        return value;
    }
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
};

export const studentStatusSchema = z.enum(["active", "pending", "graduated"]);

export const createStudentSchema = z.object({
    hebrewName: z.string().min(1),
    englishName: z.string().min(1),
    studentId: z.string().min(1),
    email: z.preprocess(emptyEmailToUndefined, z.email().optional()),
    status: studentStatusSchema.optional(),
});

export const updateStudentSchema = z
    .object({
        hebrewName: z.string().min(1).optional(),
        englishName: z.string().min(1).optional(),
        studentId: z.string().min(1).optional(),
        email: z.preprocess(emptyEmailToUndefined, z.email().optional()),
        status: studentStatusSchema.optional(),
    })
    .partial();
