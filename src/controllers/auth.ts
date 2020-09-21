import * as jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { validationResult } from "express-validator/check";
import { errorMessage } from "../config/errorFormatter";
import { userDBInteractions } from "../database/interactions/user";
import { IUserModel } from "../database/models/user";
import { bcryptPassword } from "../config/bcrypt";
import { statusCodes } from "../config/statusCodes";
import { codeforces } from "../util/codeforces";

const authController = {

    login: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { email, password } = req.body;
                const user: IUserModel = await userDBInteractions.findByEmail(email, "+password");
                if (!user) {
                    res.status(statusCodes.BAD_REQUEST).send({ status: statusCodes.BAD_REQUEST, message: "Invalid email or password" });
                } else {
                    if (!user.confirmation.isConfirmed) {
                        res.status(statusCodes.UNAUTHORIZED).send({ status: statusCodes.UNAUTHORIZED, message: "Please confirm your email address before logging in (check the email linked to your account)." })
                    } else if (!bcryptPassword.validate(password, user.password)) {
                        res.status(statusCodes.BAD_REQUEST).send({ status: statusCodes.BAD_REQUEST, message: "Invalid email or password" });
                    } else {
                        if (user.platformData.codeforces.username) await codeforces.updateUserProblems(user);
                        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.SECRET);
                        const userJSON = user.toJSON();
                        delete userJSON.password;
                        res.status(statusCodes.SUCCESS).send({ token: token, user: userJSON });
                    }
                }
            } catch (error) {
                res.status(statusCodes.SERVER_ERROR).send(error);
            }
        }
    },

    introspect: async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(statusCodes.MISSING_PARAMS).json(errors.formatWith(errorMessage).array()[0]);
        } else {
            try {
                const { token } = req.query;
                const payload = jwt.verify(token, process.env.SECRET);
                res.status(statusCodes.SUCCESS).send({ active: true, user: payload });
            } catch (error) {
                res.status(statusCodes.UNAUTHORIZED).send({ status: statusCodes.UNAUTHORIZED, message: "Unauthorized", active: false });
            }
        }
    }
};

export { authController };