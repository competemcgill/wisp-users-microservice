import { Document, Model, model, Schema } from "mongoose";
import { IUser } from "../../interfaces/IUser";

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
    problems: [{
        problemId: {
            type: Schema.Types.ObjectId,
            ref: "Problem"
        },
        isComplete: Boolean
    }]
},
    {
        timestamps: true
    }
);

const User: Model<IUserModel> = model("User", userSchema);

export { User };
