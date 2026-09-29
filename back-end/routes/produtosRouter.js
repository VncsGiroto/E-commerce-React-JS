import { Router } from "express";
import produtosRouterController from "../controllers/produtosRouterController.js";
import validateMiddleware from "../middlewares/validateMiddleware.js";
import checkTokens from "../middlewares/checkTokens.js";
import imageSavingMiddleware from "../middlewares/base64ToImageMiddleware.js";

const produtosRouter = Router();

// Middleware condicional para imagem - passa pelo imageSavingMiddleware apenas se tiver imagem
// (usado no update; no create o salvamento ocorre dentro do controller,
// DEPOIS das validações de categoria/duplicata, para não gerar arquivo órfão)
const conditionalImageMiddleware = (req, res, next) => {
    if (req.body.imagem && req.body.imagem.length > 200 && !req.body.imagem.match(/^[0-9a-fA-F-]{36}\.(jpg|jpeg|png|tiff|webp)$/)) {
        imageSavingMiddleware(req, res, next);
    } else {
        next();
    }
};

    produtosRouter.get('/', produtosRouterController.getAll);
    produtosRouter.get('/:categoria', produtosRouterController.getCategoria);
    produtosRouter.post('/criar', checkTokens.CheckAdminToken, validateMiddleware.ProdutoCreateValidate, produtosRouterController.create);
    produtosRouter.delete('/delete/:id', checkTokens.CheckAdminToken, produtosRouterController.deleteId);
    produtosRouter.put('/update', checkTokens.CheckAdminToken, validateMiddleware.ProdutoUpdateValidate, conditionalImageMiddleware, produtosRouterController.update);

export default produtosRouter;
