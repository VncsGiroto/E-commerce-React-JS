import { Router } from "express";
import userRouterController from "../controllers/userRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import { loginLimiter } from "../middlewares/rateLimit.js";

const userRouter = Router();

    userRouter.get('/', checkTokens.CheckAdminToken,userRouterController.getAll);
    userRouter.post('/create', validateMiddleware.UserCreateValidate, userRouterController.create);
    userRouter.post('/login', loginLimiter, validateMiddleware.UserLoginValidate, userRouterController.login);
    userRouter.get('/me', checkTokens.CheckUserToken, userRouterController.getMe);
    userRouter.get('/logout', userRouterController.logout);

export default userRouter;