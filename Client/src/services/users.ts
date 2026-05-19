import api from "./api";

// Matches the server's createUserSchema (Server/src/zod/usersZod.ts)
export interface CreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    auth0Id: string;
    phone?: string;
    profilePicture?: string;
}


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

export const createUser = async (payload: CreateUserPayload) => {
    const {data} = await api.post("/users", payload );
    return data;
};
