import type { Document, Model, Types } from "mongoose";

export interface IUser  {
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    auth0Id: string;
    email: string;
    role: 'admin' | 'user' | 'staff' | 'student';
    enrolledCourses?: Types.ObjectId[];
}

export interface IUserDoc extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
}

// Interface for static methods
export interface IUserModel extends Model<IUserDoc> {
    findByAuth0Id(auth0Id: string): Promise<IUserDoc | null>;
}