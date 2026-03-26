import { Router } from "express";
import categoriaRouterController from "../controllers/categoriaRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";

const categoriaRouter = Router();

// Rotas públicas
categoriaRouter.get('/', categoriaRouterController.getAll);
categoriaRouter.get('/:id', categoriaRouterController.getById);

// Rotas protegidas (apenas admin)
categoriaRouter.post('/criar', checkTokens.CheckAdminToken, categoriaRouterController.create);
categoriaRouter.put('/atualizar/:id', checkTokens.CheckAdminToken, categoriaRouterController.update);
categoriaRouter.delete('/deletar/:id', checkTokens.CheckAdminToken, categoriaRouterController.deleteById);

export default categoriaRouter;
