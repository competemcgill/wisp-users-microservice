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
            res.status(statusCodes.SUCCESS).json(users);
        } catch (err) {
            res.status(statusCodes.SERVER_ERROR).json(err);
        }
    },

    show: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const userId: string = req.params.userId;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user)
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                else {
                    await codeforces.updateUserProblems(user);
                    user
                        ? res.status(statusCodes.SUCCESS).json(user)
                        : res.status(statusCodes.NOT_FOUND).json({
                              status: statusCodes.NOT_FOUND,
                              message: "User not found"
                          });
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    create: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const foundByEmail = await userDBInteractions.findByEmail(
                    req.body.email
                );
                const foundByUsername = await userDBInteractions.findByUsername(
                    req.body.username
                );
                if (foundByEmail) {
                    return res.status(statusCodes.CONFLICT_FOUND).json({
                        status: statusCodes.CONFLICT_FOUND,
                        message: "User with that email already exists"
                    });
                } else if (foundByUsername) {
                    return res.status(statusCodes.CONFLICT_FOUND).json({
                        status: statusCodes.CONFLICT_FOUND,
                        message: "User with that username already exists"
                    });
                } else {
                    const userData: IUser = {
                        ...req.body,
                        password: bcryptPassword.generateHash(req.body.password)
                    };
                    userData.role = "USER";
                    let newUser: IUserModel = await userDBInteractions.create(
                        new User(userData)
                    );
                    newUser = newUser.toJSON();
                    delete newUser.password;
                    res.status(statusCodes.SUCCESS).json(newUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    update: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { userId } = req.params;
                const user: IUserModel = await userDBInteractions.find(
                    userId,
                    "+password"
                );
                if (!user)
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                else {
                    const foundByEmail = await userDBInteractions.findByEmail(
                        req.body.email
                    );
                    const foundByUsername = await userDBInteractions.findByUsername(
                        req.body.username
                    );
                    if (foundByEmail && !foundByEmail._id.equals(user._id)) {
                        return res.status(statusCodes.CONFLICT_FOUND).json({
                            status: statusCodes.CONFLICT_FOUND,
                            message: "User with that email already exists"
                        });
                    } else if (
                        foundByUsername &&
                        !foundByUsername._id.equals(user._id)
                    ) {
                        return res.status(statusCodes.CONFLICT_FOUND).json({
                            status: statusCodes.CONFLICT_FOUND,
                            message: "User with that username already exists"
                        });
                    }
                    const updatedUserBody: IUser = {
                        ...req.body
                    };
                    updatedUserBody.role = "USER";
                    if (req.body.password)
                        updatedUserBody[
                            "password"
                        ] = bcryptPassword.generateHash(req.body.password);

                    const updatedUser: IUserModel = await userDBInteractions.update(
                        userId,
                        updatedUserBody
                    );
                    res.status(statusCodes.SUCCESS).json(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    addProblem: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { userId } = req.params;
                const { problemId, isComplete, status } = req.body;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user)
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                else {
                    const problemIndex = user.problems.findIndex(
                        (problem) => problem.problemId === problemId
                    );
                    const updatedProblem = {
                        problemId,
                        isComplete,
                        status
                    };

                    if (problemIndex == -1) user.problems.push(updatedProblem);
                    else user.problems[problemIndex] = updatedProblem;

                    const updatedUser: IUserModel = await userDBInteractions.update(
                        userId,
                        user
                    );
                    res.status(statusCodes.SUCCESS).json(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    addProblemSet: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { userId } = req.params;
                const { problemSetId } = req.body;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user)
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                else {
                    const problemSetIndex = user.problemSets.findIndex(
                        (id) => id === problemSetId
                    );
                    if (problemSetIndex == -1)
                        user.problemSets.push(problemSetId);

                    const updatedUser: IUserModel = await userDBInteractions.update(
                        userId,
                        user
                    );
                    res.status(statusCodes.SUCCESS).json(updatedUser);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    resetLastSubmissions: async (req: Request, res: Response) => {
        try {
            await userDBInteractions.resetLastSubmissions();
            res.status(statusCodes.SUCCESS).json();
        } catch (error) {
            res.status(statusCodes.SERVER_ERROR).json(error);
        }
    },

    updateUserProblems: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { userId } = req.params;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user)
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                else {
                    if (user.platformData.codeforces.username)
                        await codeforces.updateUserProblems(user);
                    res.status(statusCodes.SUCCESS).json(user);
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    delete: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { userId } = req.params;
                const user: IUserModel = await userDBInteractions.find(userId);
                if (!user) {
                    res.status(statusCodes.NOT_FOUND).json({
                        status: statusCodes.NOT_FOUND,
                        message: "User not found"
                    });
                } else {
                    await userDBInteractions.delete(userId);
                    res.status(statusCodes.SUCCESS).json();
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    }
};

export { userController };
