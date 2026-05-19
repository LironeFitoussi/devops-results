import type { Request, Response, NextFunction } from "express";
import { auth0Middleware } from "./auth0Mdw.js";
import User from "../models/userModel.js";
import { AppError } from "../utils/errorHandler.js";

// Runs the standard Auth0 JWT check, then enforces that the
// authenticated user has the `admin` role in our database.
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    auth0Middleware(req, res, (err?: unknown) => {
        if (err) {
            return next(err);
        }

        const sub = req.auth?.payload?.sub;
        if (!sub) {
            return next(new AppError("User information not found in token", 401));
        }

        User.findByAuth0Id(sub)
            .then((user) => {
                if (!user) {
                    return next(new AppError("User not found", 404));
                }
                if (user.role !== "admin") {
                    return next(new AppError("Admin access required", 403));
                }
                next();
            })
            .catch(next);
    });
};
