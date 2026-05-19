import api from "./api";

export const validateToken = async (token: string) => {
    const {data} = await api.get("/auth/validate", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return data;
};