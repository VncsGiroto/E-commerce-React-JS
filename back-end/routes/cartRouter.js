import { Router } from "express";
import cartRouterController from "../controllers/cartRouterController.js"
import checkTokens from "../middlewares/checkTokens.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";

const cartRouter = Router();

cartRouter.post('/criar', checkTokens.CheckUserToken, validateMiddleware.CartValidate, cartRouterController.create)

export default cartRouter;