import { Router } from "express";
import produtosRouterController from "../controllers/produtosRouterController.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import checkTokens from "../middlewares/checkTokens.js";

const produtosRouter = Router();

    produtosRouter.get('/', produtosRouterController.getAll);
    produtosRouter.get('/:categoria', produtosRouterController.getCategoria);
    produtosRouter.post('/criar', checkTokens.CheckAdminToken, validateMiddleware.ProdutoValidate, produtosRouterController.create);
    produtosRouter.delete('/delete/:id', checkTokens.CheckAdminToken, produtosRouterController.deleteId);
    produtosRouter.put('/update', checkTokens.CheckAdminToken, validateMiddleware.ProdutoValidate, produtosRouterController.update);

export default produtosRouter;