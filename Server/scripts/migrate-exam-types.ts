import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
}

await mongoose.connect(mongoUri);

const db = mongoose.connection.db;
if (!db) {
    throw new Error("Database connection failed");
}

const examsRes = await db
    .collection("exams")
    .updateMany(
        { type: { $exists: false } },
        { $set: { type: "google_form" } },
    );

const resultsRes = await db
    .collection("examresults")
    .updateMany(
        { type: { $exists: false } },
        { $set: { type: "google_form" } },
    );

try {
    await db.collection("examresults").dropIndex("exam_1_googleResponseId_1");
    console.log("Dropped legacy non-sparse index exam_1_googleResponseId_1");
} catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`Legacy index drop skipped: ${message}`);
}

console.log(
    `exams: matched=${examsRes.matchedCount} modified=${examsRes.modifiedCount}`,
);
console.log(
    `examresults: matched=${resultsRes.matchedCount} modified=${resultsRes.modifiedCount}`,
);

await mongoose.disconnect();
