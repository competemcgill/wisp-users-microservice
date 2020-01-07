import { sampleUsers } from "./user";
import { User, IUserModel } from "../models/user";
import { createUser } from "../interactions/UserDB";

export const seedUsers = async () => {
    for (const sampleUser of sampleUsers) {
        const userSeed: IUserModel = new User(sampleUser);
        let user = await createUser(userSeed);
    }
};