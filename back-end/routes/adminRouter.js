import { Router } from "express";
import adminRouterController from "../controllers/adminRouterController.js";
import checkTokens from "../middlewares/checkTokens.js";
import { loginLimiter } from "../middlewares/rateLimit.js";


const adminRouter = Router();

    // POST /criar é público (bootstrap do primeiro admin), com validação básica de body
    adminRouter.post('/criar', (req, res, next) => {
        const { usuario, senha } = req.body || {};
        if (!usuario || typeof usuario !== 'string' || !usuario.trim()) {
            return res.status(400).json({ message: "Campo 'usuario' é obrigatório" });
        }
        if (!senha || typeof senha !== 'string' || senha.length < 6) {
            return res.status(400).json({ message: "Campo 'senha' é obrigatório e deve ter no mínimo 6 caracteres" });
        }
        next();
    }, adminRouterController.create);
    adminRouter.post('/login', loginLimiter, adminRouterController.login);
    adminRouter.get('/getme',  checkTokens.CheckAdminToken ,adminRouterController.getMe);
    adminRouter.post('/logout', adminRouterController.logout);

export default adminRouter;
