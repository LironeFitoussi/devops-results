import mongoose, { Schema } from "mongoose";
import type { IUserDoc, IUserModel } from "../types/index";

const userSchema = new Schema<IUserDoc>({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: false },
    profilePicture: { type: String, required: false },
    auth0Id: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
        type: String, 
        enum: ['admin', 'user'], 
        required: true, 
        default: 'user' 
    },
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }   
});

// Custom method to get user by auth0Id
userSchema.statics.findByAuth0Id = async function(auth0Id: string) {
    return this.findOne({ auth0Id });
};

const UserModel = mongoose.model<IUserDoc, IUserModel>("User", userSchema);

export default UserModel;