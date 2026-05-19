import mongoose, { Schema } from "mongoose";
import type { IStudentDoc, IStudentModel } from "../types/index.js";
import { normalizeEmail } from "../utils/email.js";

const studentSchema = new Schema<IStudentDoc>(
    {
        hebrewName: { type: String, required: true, trim: true },
        englishName: { type: String, required: true, trim: true },
        studentId: { type: String, required: true, unique: true, trim: true },
        email: { type: String, required: false, trim: true, default: "" },
        normalizedEmail: {
            type: String,
            required: false,
            unique: true,
            sparse: true,
            index: true,
        },
        status: {
            type: String,
            enum: ["active", "pending", "graduated"],
            required: true,
            default: "pending",
        },
        user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

studentSchema.pre("validate", function normalizeStudentEmail(next) {
    const normalized = normalizeEmail(this.email);
    if (normalized) {
        this.normalizedEmail = normalized;
    } else {
        this.set("normalizedEmail", undefined);
    }
    this.email = this.email?.trim() ?? "";
    next();
});

studentSchema.statics.findByNormalizedEmail = async function (email: string) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
        return null;
    }
    return this.findOne({ normalizedEmail });
};

const StudentModel = mongoose.model<IStudentDoc, IStudentModel>(
    "Student",
    studentSchema,
);

export default StudentModel;
