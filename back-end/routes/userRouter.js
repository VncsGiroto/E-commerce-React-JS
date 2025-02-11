import { Router } from "express";
import userRouterController from "../controllers/userRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";

const userRouter = Router();

    userRouter.get('/', userRouterController.getAll);
    userRouter.post('/create', validateMiddleware.UserValidate, userRouterController.create);
    userRouter.post('/login', userRouterController.login);
    userRouter.get('/me', checkTokens.CheckUserToken, userRouterController.getMe);
    userRouter.get('/logout', checkTokens.CheckUserToken, userRouterController.logout);

export default userRouter;