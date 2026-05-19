import type { Request, Response } from "express";
import User from "../models/userModel";
import { createUserSchema, updateUserSchema } from "../zod/usersZod.js";
import { AppError } from "../utils/errorHandler.js";

class UsersController {
    async createUser(req: Request, res: Response) {
        try {
            const { 
                firstName, 
                email, 
                auth0Id,
                lastName,
                phone,
                profilePicture
            } = createUserSchema.parse(req.body);
            
            const user = await User.create({ firstName, email, auth0Id, lastName, phone, profilePicture });
            res.status(201).json({
                success: true,
                data: user
            });
        } catch (error) {
            throw error; // Let the error handler middleware handle it
        }
    }

    async getUsers(_req: Request, res: Response) {
        const users = await User.find();

        if (users.length === 0) {
            throw new AppError('No users found', 404);
        }

        res.status(200).json({
            success: true,
            data: users
        });
    }

    async getUserById(req: Request, res: Response) {
        const { id } = req.params;
        
        if (!id) {
            throw new AppError('User ID is required', 400);
        }

        const user = await User.findById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    }

    async updateUser(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updateData = updateUserSchema.parse(req.body);

            // Check if at least one field is provided for update
            if (Object.keys(updateData).length === 0) {
                throw new AppError('At least one field must be provided for update', 400);
            }

            const user = await User.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new AppError('User not found', 404);
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            throw error; // Let the error handler middleware handle it
        }
    }

    async deleteUser(req: Request, res: Response) {
        const { id } = req.params;

        if (!id) {
            throw new AppError('User ID is required', 400);
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
}

export default UsersController;