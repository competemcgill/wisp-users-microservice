import { Request, Response } from "express";
import { getUser, getUsers, createUser } from "../database/interactions/UserDB";
import { User, IUserModel } from "../database/models/user";

const userController = {

    index: async (req: Request, res: Response) => {
        try {
            const users = await getUsers();
            res.status(200).send(users);
        } catch (err) {
            // TODO: proper error handling + msgs/error codes
            res.status(500).send(err);
        }
    },

    show: async (req: Request, res: Response) => {
        // TODO: input validation
        try {
            const userId: string = req.params.userId;
            const user: IUserModel = await getUser(userId);
            user ? res.status(200).send(user) : res.status(404).send({ status: 404, message: "User not found" });
        } catch (error) {
            res.status(500).send(error);
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const user: IUserModel = req.body;
            const createdUser: IUserModel = await createUser(req.body);
            res.status(200).send(createdUser);
        } catch (error) {
            res.status(500).send(error);
        }
    },
};


export { userController };