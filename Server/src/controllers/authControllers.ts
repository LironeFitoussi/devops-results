import type { Request, Response } from "express";
import User from "../models/userModel";
import { AppError } from "@/utils/errorHandler";

class AuthController {
    async getCurrentUser(req: Request, res: Response) {
        // Get user info from JWT payload
        const userInfo = req.auth?.payload;
        
        // console.log(userInfo);
        if (!userInfo || !userInfo.sub) {
            throw new AppError('User information not found in token', 401);
        }

        // Find user in database by auth0Id from JWT
        const user = await User.findByAuth0Id(userInfo.sub);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        
        res.status(200).json({
            success: true,
            data: user
        });
    }

    async validateToken(req: Request, res: Response) {
        // The JWT middleware has already validated the token
        // The user information is available in req.auth
        const userInfo = req.auth?.payload;
        
        if (!userInfo) {
            throw new AppError('Token validation failed', 401);
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            data: {
                sub: userInfo.sub,
                email: userInfo.email,
                name: userInfo.name,
                email_verified: userInfo.email_verified,
                aud: userInfo.aud,
                iss: userInfo.iss,
                iat: userInfo.iat,
                exp: userInfo.exp
            }
        });
    }
}

export default AuthController;