import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path"
import { generalLimiter } from "./middlewares/rateLimit.js";

//db
import connectDataBase from "./db/connection.js";

//rotas
import userRouter from "./routes/userRouter.js";
import produtosRouter from "./routes/produtosRouter.js";
import adminRouter from "./routes/adminRouter.js";
import cartRouter from "./routes/cartRouter.js"
import categoriaRouter from "./routes/categoriaRouter.js";

//server
export function createApp() {
    const app = express();
    const __dirname = path.resolve();

    //settings
    app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
    // Aceita localhost e 127.0.0.1 no dev; em produção defina CORS_ORIGIN
    // (uma origem ou lista separada por vírgula).
    const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
    const envOrigins = (process.env.CORS_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);
    app.use(cors({
        origin: envOrigins.length ? envOrigins : defaultOrigins,
        credentials: true
    }));
    app.use(cookieParser());
    app.use(express.json({limit: '1mb'}));

    // Rate-limit geral contra abuso
    app.use(generalLimiter);
    app.use('/static', express.static(path.join(__dirname, 'static')));

    //rotes
    app.use("/user/", userRouter);
    app.use("/produto/", produtosRouter);
    app.use("/admin/", adminRouter);
    app.use("/cart/", cartRouter);
    app.use("/categoria/", categoriaRouter);

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ message: "Rota não encontrada" });
    });

    // middleware global de erro
    // eslint-disable-next-line no-unused-vars
    app.use((err, req, res, next) => {
        console.error(err);
        const status = err.status || 500;
        res.status(status).json({ message: err.message || "Erro interno do servidor" });
    });

    return app;
}

const app = createApp();

export default app;
