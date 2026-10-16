import { Router } from "express";
import orderRouterController from "../controllers/orderRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";

const orderRouter = Router();

orderRouter.post("/checkout", checkTokens.CheckUserToken, orderRouterController.checkout);
orderRouter.get("/", checkTokens.CheckUserToken, orderRouterController.list);
orderRouter.get("/:id", checkTokens.CheckUserToken, orderRouterController.getById);

export default orderRouter;
