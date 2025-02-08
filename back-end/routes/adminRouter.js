import { Router } from "express";
import adminRouterController from "../controllers/adminRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";


const adminRouter = Router();

    adminRouter.post('/criar', checkTokens.CheckAdminToken ,adminRouterController.create);
    adminRouter.post('/login', adminRouterController.login);
    adminRouter.get('/getme',  checkTokens.CheckAdminToken ,adminRouterController.getMe);
    adminRouter.post('/logout', checkTokens.CheckAdminToken, adminRouterController.logout);

export default adminRouter;