import { z } from "zod";
// import type { IUser } from "../types";

export const createUserSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    profilePicture: z.string().optional(),
    auth0Id: z.string().min(1),
    email: z.string().email(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
}).partial();