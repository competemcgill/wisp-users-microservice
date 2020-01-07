import { Router } from "express";
import { userController } from "../controllers/user";

const userRouter: Router = Router();

userRouter.get("/", userController.index);

userRouter.get("/:userId", userController.show);

userRouter.post("/", userController.create);

export { userRouter };