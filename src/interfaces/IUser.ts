import { IProblem } from "./IProblem";

export interface IUser {
    username: string;
    password: string;
    email: string;
    role: string;
    info: IInfo;
    createdAt: string;
    updatedAt: string;
    problems: IProblem[];
    problemSets: string[];
    platformData: {
        codeforces: {
            username: string;
            email: string;
            lastSubmission: IProblem;
        };
    };
    confirmation: {
        isConfirmed: boolean;
        confirmationCode: string;
    }
}

export interface IInfo {
    major: string;
    year: string;
    school: string;
    bio: string;
    profilePhoto: string;
}
