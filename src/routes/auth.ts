import { Router } from "express";
import { authController } from "../controllers/auth";
import { authValidator } from "../validators/auth";

const authRouter: Router = Router();

/**
 * @swagger
 * /auths/login:
 *  post:
 *      description: Creates a new token
 *      tags:
 *          - Sessions
 *      parameters:
 *          - in: body
 *            name: authData
 *            description: email and password
 *            schema:
 *                type: object
 *                properties:
 *                    email:
 *                        type: string
 *                    password:
 *                        type: integer
 *                example:
 *                    email: "example@gmail.com"
 *                    password: "password"
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Returns new Token
 *          400:
 *              description: Invalid email or password
 *          422:
 *              description: Validation error
 *          500:
 *              description: Internal server error
 */
authRouter.post("/login", authValidator("POST /auth/login"), authController.login);

/**
 * @swagger
 * /auths/introspect:
 *  post:
 *      description: Validates token
 *      tags:
 *          - Sessions
 *      parameters:
 *          - in: query
 *            name: token
 *            schema:
 *                 type: boolean
 *            description: ?token=JWT_TOKEN
 *      produces:
 *          - application/json
 *      responses:
 *          200:
 *              description: Returns payload and token status
 *          401:
 *              description: Returns token status
 *          422:
 *              description: Validation error
 */
authRouter.post("/introspect", authValidator("POST /auth/introspect"), authController.introspect);

export { authRouter };