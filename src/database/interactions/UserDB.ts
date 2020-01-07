import { IUser } from "../../interfaces/IUser";
import { User, IUserModel } from "../models/user";

export const createUser = (user: IUser): Promise<IUserModel> => {
    return User.create(user);
};

export const getUsers = (): Promise<IUserModel> => {
    return User.find().exec();
};

export const getUser = (userId: string): Promise<IUserModel> => {
    return User.findOne({ _id: userId }).exec();
};