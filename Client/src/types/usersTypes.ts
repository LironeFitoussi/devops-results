export interface IUser {
    email: string;
    email_verified: boolean;
    lastName: string;
    firstName: string;
    name: string;
    nickname: string;
    picture: string;
    auth0Id: string;
    profilePicture: string;
    updatedAt?: string;
    createdAt?: string;
    phone?: string;
    student?: string;
    role?: 'admin' | 'user' | 'student' | 'instructor' | 'Coordinator' | 'staff' | 'Instructor';
}
