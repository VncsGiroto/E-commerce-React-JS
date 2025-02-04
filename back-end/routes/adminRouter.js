import { Router } from "express";
import adminRouterController from "../controllers/adminRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";


const adminRouter = Router();

    adminRouter.post('/criar', checkTokens.CheckAdminToken ,adminRouterController.create);
    adminRouter.post('/login', adminRouterController.login);
    adminRouter.get('/getMe',  checkTokens.CheckAdminToken ,adminRouterController.getMe);

export default adminRouter;