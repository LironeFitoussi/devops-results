import type { IUser } from "./usersTypes";

export type StudentStatus = "active" | "pending" | "graduated";

export interface IStudent {
  _id?: string;
  id?: string;
  hebrewName: string;
  englishName: string;
  studentId: string;
  email?: string;
  status: StudentStatus;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfileResponse {
  student: IStudent;
  user: IUser;
  linked: boolean;
}
