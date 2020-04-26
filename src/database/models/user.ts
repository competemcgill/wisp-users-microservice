import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "../../interfaces/IUser";

export interface IUserModel extends IUser, Document { }

const userSchema: Schema = new Schema({
    username: String,
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
        select: false,
    },
    role: {
        type: String,
        enum: ["ADMIN", "USER"],
        default: "USER",
    },
    info: {
        major: String,
        year: String,
        school: String,
        bio: String,
        profilePhoto: String,
    },
    problems: [
        {
            problemId: String,
            isComplete: Boolean,
            status: String,
        },
    ],
    platformData: {
        codeforces: {
            username: String,
            email: String,
            latestSubmission: String,
        },
    },
}, {
    timestamps: true,
});

userSchema.index({
    email: 1,
}, {
    unique: true,
});

const User: Model<IUserModel> = model("User", userSchema);

export { User };
