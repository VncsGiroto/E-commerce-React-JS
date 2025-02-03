import { Router } from "express";
import produtosRouterController from "../controllers/produtosRouterController.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";

const produtosRouter = Router();

    produtosRouter.get('/', produtosRouterController.getAll);
    produtosRouter.get('/:categoria', produtosRouterController.getCategoria);
    produtosRouter.post('/criar', validateMiddleware.ProdutoValidate, produtosRouterController.create);
    produtosRouter.delete('/delete/:nome', produtosRouterController.deleteNome);
    produtosRouter.put('/update', validateMiddleware.ProdutoValidate, produtosRouterController.update);

export default produtosRouter;