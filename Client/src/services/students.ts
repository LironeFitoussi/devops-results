import api from "./api";
import type { IStudent, StudentProfileResponse, StudentStatus } from "@/types";

export interface StudentPayload {
  hebrewName: string;
  englishName: string;
  studentId: string;
  email?: string;
  status?: StudentStatus;
}

const authConfig = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const getStudents = async (token: string): Promise<IStudent[]> => {
  const { data } = await api.get("/students", authConfig(token));
  return data.data;
};

export const createStudent = async (
  token: string,
  payload: StudentPayload,
): Promise<IStudent> => {
  const { data } = await api.post("/students", payload, authConfig(token));
  return data.data;
};

export const updateStudent = async (
  token: string,
  id: string,
  payload: Partial<StudentPayload>,
): Promise<IStudent> => {
  const { data } = await api.patch(`/students/${id}`, payload, authConfig(token));
  return data.data;
};

export const deleteStudent = async (token: string, id: string): Promise<void> => {
  await api.delete(`/students/${id}`, authConfig(token));
};

export const getCurrentStudent = async (
  token: string,
): Promise<StudentProfileResponse> => {
  const { data } = await api.get("/students/me", authConfig(token));
  return data.data;
};
