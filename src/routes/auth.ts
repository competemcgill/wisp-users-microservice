import { Router } from "express";
import { authController } from "../controllers/auth";
import { authValidator } from "../validators/auth";

const authRouter: Router = Router();

authRouter.post("/login", authValidator("POST /auth/login"), authController.login);

authRouter.post("/introspect", authValidator("POST /auth/introspect"), authController.introspect);

export { authRouter };