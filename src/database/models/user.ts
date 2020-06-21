import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "../../interfaces/IUser";

export interface IUserModel extends IUser, Document {}

const problemSchema: Schema = new Schema(
    {
        problemId: String,
        isComplete: Boolean,
        status: String
    },
    { _id: false }
);

const userSchema: Schema = new Schema(
    {
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String,
            select: false
        },
        role: {
            type: String,
            enum: ["ADMIN", "USER"],
            default: "USER"
        },
        info: {
            major: {
                type: String,
                default: ""
            },
            year: {
                type: String,
                default: ""
            },
            school: {
                type: String,
                default: ""
            },
            bio: {
                type: String,
                default: ""
            },
            profilePhoto: {
                type: String,
                default: ""
            }
        },
        problems: [problemSchema],
        problemSets: [String],
        platformData: {
            codeforces: {
                username: {
                    type: String,
                    default: ""
                },
                email: {
                    type: String,
                    default: ""
                },
                lastSubmission: {
                    type: {
                        problemId: String,
                        isComplete: Boolean,
                        status: String
                    },
                    default: {}
                }
            }
        }
    },
    {
        timestamps: true,
        minimize: false
    }
);

userSchema.index(
    {
        email: 1
    },
    {
        unique: true
    }
);

userSchema.index(
    {
        username: 1
    },
    {
        unique: true
    }
);

const User: Model<IUserModel> = model("User", userSchema);

export { User };
