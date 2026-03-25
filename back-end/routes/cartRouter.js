import { Router } from "express";
import cartRouterController from "../controllers/cartRouterController.js"
import checkTokens from "../middlewares/checkTokens.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";

const cartRouter = Router();

// POST /cart/criar - Criar novo carrinho (usuário autenticado)
cartRouter.post('/criar', checkTokens.CheckUserToken, validateMiddleware.CartValidate, cartRouterController.create);

// GET /cart/:userId - Obter carrinho de um usuário (usuário autenticado)
cartRouter.get('/:userId', checkTokens.CheckUserToken, cartRouterController.getByUserId);

// PUT /cart/atualizar/:cartId - Atualizar carrinho recalculando preços (usuário autenticado)
cartRouter.put('/atualizar/:cartId', checkTokens.CheckUserToken, cartRouterController.updateCart);

// DELETE /cart/:cartId/item/:itemId - Remover um item do carrinho (usuário autenticado)
cartRouter.delete('/:cartId/item/:itemId', checkTokens.CheckUserToken, cartRouterController.removeItem);

// POST /cart/recalcular/:cartId - Recalcular carrinho com preços atuais (usuário autenticado)
cartRouter.post('/recalcular/:cartId', checkTokens.CheckUserToken, cartRouterController.recalculateCart);

// DELETE /cart/:cartId - Deletar carrinho completamente (usuário autenticado)
cartRouter.delete('/:cartId', checkTokens.CheckUserToken, cartRouterController.deleteCart);

// GET /cart/ - Listar todos os carrinhos (apenas admin)
cartRouter.get('/', checkTokens.CheckAdminToken, cartRouterController.getAll);

export default cartRouter;