import { IUser } from "../../interfaces/IUser";
import { Schema, Document, Model, model } from "mongoose";

export interface IUserModel extends IUser, Document { }

const userSchema: Schema = new Schema({
    region: {
        type: Schema.Types.ObjectId,
        ref: "Region"
    },
    signalCount: Number,
    username: String,
    email: String,
    role: String,
    info: {
        major: String,
        year: String,
        school: String,
        bio: String,
        profilePhoto: String
    },
    createdAt: String,
    updatedAt: String,
    problems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem"
        },
        isComplete: Boolean
    }]
});

userSchema.pre("save", (next) => {
    let now = new Date()
    if (!this.createdAt) {
        this.createdAt = now
    }
    this.updatedAt = now
    next()
})

const User: Model<IUserModel> = model("User", userSchema);

export { User };