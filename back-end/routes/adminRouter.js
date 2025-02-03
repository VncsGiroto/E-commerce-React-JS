import { Router } from "express";
import adminRouterController from "../controllers/adminRouterController.js";

const adminRouter = Router();

    adminRouter.get('/get', adminRouterController.getAll)
    adminRouter.post('/criar', adminRouterController.create)
    adminRouter.post('/login', adminRouterController.login)

export default adminRouter