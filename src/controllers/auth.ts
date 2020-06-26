import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { validationResult } from "express-validator/check";
import { errorMessage } from "../config/errorFormatter";
import { userDBInteractions } from "../database/interactions/user";
import { IUserModel } from "../database/models/user";
import { bcryptPassword } from "../config/bcrypt";
import { statusCodes } from "../config/statusCodes";
import { codeforces } from "../util/codeforces";
import { auth } from "../util/auth";

const authController = {
    login: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { email, password } = req.body;
                const user: IUserModel = await userDBInteractions.findByEmail(
                    email,
                    "+password"
                );
                if (!user) {
                    res.status(statusCodes.BAD_REQUEST).json({
                        status: statusCodes.BAD_REQUEST,
                        message: "Invalid email or password"
                    });
                } else {
                    if (!bcryptPassword.validate(password, user.password)) {
                        res.status(statusCodes.BAD_REQUEST).json({
                            status: statusCodes.BAD_REQUEST,
                            message: "Invalid email or password"
                        });
                    } else {
                        if (user.platformData.codeforces.username)
                            await codeforces.updateUserProblems(user);
                        const token = jwt.sign(
                            {
                                id: user._id,
                                email: user.email,
                                role: user.role
                            },
                            process.env.SECRET
                        );
                        const userJSON = user.toJSON();
                        delete userJSON.password;
                        res.status(statusCodes.SUCCESS).json({
                            token: token,
                            user: userJSON
                        });
                    }
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).json(error);
            }
        }
    },

    introspect: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(
                errors.formatWith(errorMessage).array()[0]
            );
        } else {
            try {
                const { token, uri, method } = req.query;
                if (!uri || !method) {
                    res.status(statusCodes.UNAUTHORIZED).json({
                        status: statusCodes.UNAUTHORIZED,
                        message: "Unauthorized",
                        active: false
                    });
                    return;
                }

                const { route, id } = auth.parseUri(decodeURI(uri));
                if (!route) {
                    res.status(statusCodes.NOT_FOUND).send({
                        status: statusCodes.NOT_FOUND,
                        message: "Invalid route"
                    });
                    return;
                }

                const payload = jwt.verify(token, process.env.SECRET);
                const isAuthorized = auth.authorize(
                    route,
                    method.toLowerCase(),
                    payload["role"],
                    payload["id"],
                    id
                );

                if (isAuthorized) {
                    res.status(statusCodes.SUCCESS).json({
                        active: true,
                        user: payload
                    });
                } else {
                    res.status(statusCodes.FORBIDDEN).json({
                        status: statusCodes.FORBIDDEN,
                        message: "Forbidden",
                        active: false
                    });
                }
            } catch (error) {
                res.status(statusCodes.UNAUTHORIZED).json({
                    status: statusCodes.UNAUTHORIZED,
                    message: "Unauthorized",
                    active: false
                });
            }
        }
    }
};

export { authController };
