import type { Document, Model, Types } from "mongoose";

export interface IUser  {
    firstName: string;
    lastName: string;
    phone?: string;
    profilePicture?: string;
    auth0Id: string;
    email: string;
    role: 'admin' | 'user' | 'staff' | 'student';
    student?: Types.ObjectId;
    enrolledCourses?: Types.ObjectId[];
    // OAuth2 refresh token for the admin's linked Google account
    // (Forms/Drive read access). Set via the /api/google/oauth flow.
    googleRefreshToken?: string;
}

export interface IUserDoc extends IUser, Document {
    createdAt: Date;
    updatedAt: Date;
}

// Interface for static methods
export interface IUserModel extends Model<IUserDoc> {
    findByAuth0Id(auth0Id: string): Promise<IUserDoc | null>;
}
