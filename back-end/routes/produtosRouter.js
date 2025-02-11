import { Router } from "express";
import produtosRouterController from "../controllers/produtosRouterController.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import checkTokens from "../middlewares/checkTokens.js";
import imageSavingMiddleware from "../middlewares/base64ToImageMiddleware.js";

const produtosRouter = Router();

    produtosRouter.get('/', produtosRouterController.getAll);
    produtosRouter.get('/:categoria', produtosRouterController.getCategoria);
    produtosRouter.post('/criar', checkTokens.CheckAdminToken, validateMiddleware.ProdutoValidate, imageSavingMiddleware, produtosRouterController.create);
    produtosRouter.delete('/delete/:id', checkTokens.CheckAdminToken, produtosRouterController.deleteId);
    produtosRouter.put('/update', checkTokens.CheckAdminToken, validateMiddleware.ProdutoValidate,imageSavingMiddleware, produtosRouterController.update);

export default produtosRouter;