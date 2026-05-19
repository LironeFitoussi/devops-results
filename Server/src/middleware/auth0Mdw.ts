import type { Request, Response, NextFunction } from "express";
import { checkJwt } from "../utils/auth0";

// Re-export the checkJwt middleware for consistency
// export { checkJwt as auth0Middleware };

// Optional: Create a custom middleware that extends the base checkJwt
export const auth0Middleware = (req: Request, res: Response, next: NextFunction) => {
    // First apply the JWT verification
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    checkJwt(req, res, (err) => {
        if (err) {
            return next(err);
        }
        
        // Additional custom logic can be added here
        // For example, you might want to:
        // - Extract user information from the token
        // - Add custom authorization checks
        // - Log authentication events
        
        // The user information is already available in req.auth
        // from the express-oauth2-jwt-bearer middleware
        
        next();
    });
};
