import dotenv from "dotenv";
import mongoose from "mongoose";
import Student from "../src/models/studentModel.js";
import { starterStudents } from "../src/data/starterStudents.js";
import { normalizeEmail } from "../src/utils/email.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    throw new Error("MONGO_URI is not set");
}

await mongoose.connect(mongoUri);

let upserted = 0;

for (const student of starterStudents) {
    const email = normalizeEmail(student.email);
    const result = await Student.updateOne(
        { studentId: student.studentId },
        {
            $set: {
                ...student,
                email,
                normalizedEmail: email || undefined,
            },
        },
        { upsert: true, runValidators: true },
    );

    if (result.upsertedCount > 0 || result.modifiedCount > 0) {
        upserted += 1;
    }
}

await mongoose.disconnect();

console.log(`Seeded ${upserted} student records.`);
