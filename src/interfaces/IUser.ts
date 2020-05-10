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
    platformData: {
        codeforces: {
            username: string;
            email: string;
            lastSubmission: IProblem;
        };
    };
}

export interface IInfo {
    major: string;
    year: string;
    school: string;
    bio: string;
    profilePhoto: string;
}
