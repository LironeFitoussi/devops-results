import type { Document, Model, Types } from "mongoose";

export type StudentStatus = "active" | "pending" | "graduated";

export interface IStudent {
    hebrewName: string;
    englishName: string;
    studentId: string;
    email?: string;
    normalizedEmail?: string;
    status: StudentStatus;
    user?: Types.ObjectId;
}

export interface IStudentDoc extends IStudent, Document {
    createdAt: Date;
    updatedAt: Date;
}

export interface IStudentModel extends Model<IStudentDoc> {
    findByNormalizedEmail(email: string): Promise<IStudentDoc | null>;
}
