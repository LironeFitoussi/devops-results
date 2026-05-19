import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

// Health check for database
router.get("/db-health", async (_req, res) => {
    // Check NODE_ENV
    if (process.env.NODE_ENV !== "development") {
        return res.status(403).json({
            success: false,
            message: "This action is not allowed in production"
        });
    }
    
    try {
        const dbStatus = mongoose.connection.readyState;
        const statusMap: Record<number, string> = {
            0: "disconnected",
            1: "connected",
            2: "connecting",
            3: "disconnecting"
        };
        
        res.status(200).json({
            success: true,
            database: statusMap[dbStatus] || "unknown",
            collections: await mongoose.connection.db?.listCollections().toArray()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get database health",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

export default router;