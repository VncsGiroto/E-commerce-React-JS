import { Router } from "express";
import adminRouterController from "../controllers/adminRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";
import { loginLimiter } from "../middlewares/rateLimit.js";


const adminRouter = Router();

    adminRouter.post('/login', loginLimiter, adminRouterController.login);
    adminRouter.get('/getme',  checkTokens.CheckAdminToken ,adminRouterController.getMe);
    adminRouter.post('/logout', adminRouterController.logout);

export default adminRouter;
