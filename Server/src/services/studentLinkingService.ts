import type { Types } from "mongoose";
import Student from "../models/studentModel.js";
import User from "../models/userModel.js";
import type { IStudentDoc, IUserDoc } from "../types/index.js";
import { normalizeEmail } from "../utils/email.js";

export { normalizeEmail };

export async function linkUserToStudentByEmail(
    user: IUserDoc,
): Promise<IUserDoc> {
    const normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) {
        return user;
    }

    const student = await Student.findByNormalizedEmail(normalizedEmail);
    if (!student) {
        return user;
    }

    const studentObjectId = student._id as Types.ObjectId;
    const userObjectId = user._id as Types.ObjectId;
    let changed = false;

    if (user.role !== "student") {
        user.role = "student";
        changed = true;
    }

    if (!user.student || !user.student.equals(studentObjectId)) {
        user.student = studentObjectId;
        changed = true;
    }

    if (!student.user || !student.user.equals(userObjectId)) {
        student.user = userObjectId;
        await student.save();
    }

    return changed ? user.save() : user;
}

export async function linkStudentToExistingUser(
    student: IStudentDoc,
): Promise<IStudentDoc> {
    const normalizedEmail = normalizeEmail(student.email);
    if (!normalizedEmail) {
        return student;
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        return student;
    }

    await linkUserToStudentByEmail(user);
    return Student.findById(student._id) as Promise<IStudentDoc>;
}
