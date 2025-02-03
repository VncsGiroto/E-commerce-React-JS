import express from "express";
import cors from "cors";

//db
import connectDataBase from "./db/connection.js";

//rotas
import userRouter from "./routes/userRouter.js";
import produtosRouter from "./routes/produtosRouter.js";
import adminRouter from "./routes/adminRouter.js";

//server
const app = express();
const PORT = 4000;

//settings
app.use(cors());
app.use(express.json({limit: '8mb'}));

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