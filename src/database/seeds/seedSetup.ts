import { sampleUsers } from "./user";
import { User, IUserModel } from "../models/user";
import { userDBInteractions } from "../interactions/user";

export const seedUsers = async () => {
    for (const sampleUser of sampleUsers) {
        const userSeed: IUserModel = new User(sampleUser);
        let user = await userDBInteractions.create(userSeed);
    }
};