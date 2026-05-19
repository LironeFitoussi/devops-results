// Modules imports
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import morgan from "morgan";

// Config
import connectDB from "./config/db.js";
import { errorHandler } from "./utils/errorHandler.js";

// Routes
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dangerRoutes from "./routes/dangerRoutes.js";

// Config Middleware
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;


if (!PORT) {
    throw new Error("PORT is not set");
} 

if (!CLIENT_URL) {
    throw new Error("CLIENT_URL is not set");
}

// Cors
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

// Rate Limit 
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10000, // 100 requests per 15 minutes
}));

// Morgan 
app.use(morgan("dev")); // dev is the format of the logs

// Connect to database
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/health", (req, res) => {
    res.json({ success: true, message: "Server is healthy" });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/danger", dangerRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});