import { IProblem } from './IProblem'

export interface IUser {
    id: string;
    username: string;
    email: string;
    role: string;
    info: IInfo;
    createdAt: string;
    updatedAt: string;
    problems: {
        [key: string]: IProblem;
    };
}

export interface IInfo {
    major: string;
    year: string;
    school: string;
    bio: string;
    profilePhoto: string;
}