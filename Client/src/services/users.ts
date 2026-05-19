import type { IUser } from "@/types";
import api from "./api";


export const getUsers = async () => {
    const {data} = await api.get("/users");
    return data.data;
};

export const getCurrentUser = async (payload: string) => {
    const {data} = await api.get(`/auth/me`, {
        headers: {
            Authorization: `Bearer ${payload}`,
        },
    });
    return data;
};

export const createUser = async (payload: IUser) => {
    const {data} = await api.post("/users", payload );
    return data;
};
