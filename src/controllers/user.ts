import { Request, Response } from "express";
import { userDBInteractions } from "../database/interactions/user";
import { User, IUserModel } from "../database/models/user";
import { IUser } from "../interfaces/IUser";
import { validationResult } from "express-validator/check";
import { errorMessage } from "../config/errorFormatter";
import { bcryptPassword } from "../config/bcrypt";
import { statusCodes } from "../config/statusCodes";
import { codeforces } from "../util/codeforces";

const userController = {

    index: async (req: Request, res: Response) => {
        try {
            const users = await userDBInteractions.all();
            res.status(statusCodes.SUCCESS).send(users);
        } catch (err) {
            res.status(statusCodes.SERVER_ERROR).send(err);
        }
    },

    show: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const userId: string = req.params.userId;
                const user: IUserModel = await userDBInteractions.find(userId);
                await codeforces.updateUserProblems(user);
                user ? res.status(statusCodes.SUCCESS).send(user) : res.status(statusCodes.NOT_FOUND).send({ status: statusCodes.NOT_FOUND, message: "User not found" });
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    create: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else if (!req.body.platformData || !req.body.platformData.codeforces || !req.body.platformData.codeforces.username) {
            res.status(statusCodes.MISSING_PARAMS).json({ status: statusCodes.MISSING_PARAMS, message: "body[platformData.codeforces.username]: Invalid or missing 'platformData.codeforces.username'" });
        } else {
            try {
                const foundUser: IUserModel = await userDBInteractions.findByEmail(req.body.email);
                if (foundUser) res.status(statusCodes.BAD_REQUEST).send({ status: statusCodes.BAD_REQUEST, message: "User already exists" });
                else {
                    const userData: IUser = {
                        ...req.body,
                        password: bcryptPassword.generateHash(req.body.password)
                    };
                    let newUser: IUserModel = await userDBInteractions.create(new User(userData));
                    newUser = newUser.toJSON();
                    delete newUser.password;
                    res.status(statusCodes.SUCCESS).send(newUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    update: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { userId } = req.params;
                const user: IUserModel = await userDBInteractions.find(userId, "+password");
                if (!user)
                    res.status(statusCodes.NOT_FOUND).send({ status: statusCodes.NOT_FOUND, message: "User not found" });
                else {
                    const updatedUserBody: IUser = {
                        ...req.body,
                    };

                    if (req.body.password) updatedUserBody["password"] = bcryptPassword.generateHash(req.body.password);

                    const updatedUser: IUserModel = await userDBInteractions.update(userId, updatedUserBody);
                    res.status(statusCodes.SUCCESS).send(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    addProblem: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { userId } = req.params;
                const { problemId, isComplete, status } = req.body;
                const user: IUserModel = await userDBInteractions.find(userId, "+password");
                if (!user)
                    res.status(statusCodes.NOT_FOUND).send({ status: statusCodes.NOT_FOUND, message: "User not found" });
                else {
                    const problemIndex = user.problems.findIndex((problem) => problem.problemId === problemId);
                    const updatedProblem = {
                        problemId,
                        isComplete,
                        status
                    };

                    if (problemIndex == -1) user.problems.push(updatedProblem);
                    else user.problems[problemIndex] = updatedProblem;

                    const updatedUser: IUserModel = await userDBInteractions.update(userId, user);
                    res.status(statusCodes.SUCCESS).send(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    addProblemSet: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { userId } = req.params;
                const { problemSetId } = req.body;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user)
                    res.status(statusCodes.NOT_FOUND).send({ status: statusCodes.NOT_FOUND, message: "User not found" });
                else {
                    const problemSetIndex = user.problemSets.findIndex((id) => id === problemSetId);
                    if (problemSetIndex == -1) user.problemSets.push(problemSetId);

                    const updatedUser: IUserModel = await userDBInteractions.update(userId, user);
                    res.status(statusCodes.SUCCESS).send(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    delete: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { userId } = req.params;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user) {
                    res.status(statusCodes.NOT_FOUND).send({ status: statusCodes.NOT_FOUND, message: "User not found" });
                } else {
                    await userDBInteractions.delete(userId);
                    res.status(statusCodes.SUCCESS).send();
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    }
};

export { userController };
