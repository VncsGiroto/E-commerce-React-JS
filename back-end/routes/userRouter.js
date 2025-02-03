import { Router } from "express";
import userRouterController from "../controllers/userRouterController.js";

const userRouter = Router();

    userRouter.get('/', userRouterController.getAll);

export default userRouter;