import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path"

//db
import connectDataBase from "./db/connection.js";

//rotas
import userRouter from "./routes/userRouter.js";
import produtosRouter from "./routes/produtosRouter.js";
import adminRouter from "./routes/adminRouter.js";

//server
const app = express();
const __dirname = path.resolve();
const PORT = 4000;

//settings
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(cookieParser());
app.use(express.json({limit: '10mb'}));
app.use('/static', express.static(path.join(__dirname, 'static')));


//db
await connectDataBase();

//rotes
app.use("/user/", userRouter);
app.use("/", produtosRouter);
app.use("/admin/", adminRouter);

//open server
app.listen(PORT, ()=>{
    console.log(`Server ON || Hosted on: http://localhost:${PORT}`)
});

