import mongoose from "mongoose";

export default async function connectDB() {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is not set");
    }
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}