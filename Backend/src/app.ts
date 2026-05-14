import "dotenv/config";
import './config/env';
import express, {Request, Response, NextFunction} from "express";
import { createServer } from "http";
import cors from "cors";
import { prisma } from "./config/database"
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleware } from "./middleware/error.middleware";
import { initSocket } from "./config/socket";
import authRouter from "./modules/auth/auth.router";
import accountsRouter from './modules/accounts/accounts.router';
import transactionsRouter from "./modules/transactions/transactions.router"
import foldersRouter from "./modules/folders/folders.router";
import transfersRouter from "./modules/transfers/transfers.router";


const app = express();
const httpServer = createServer(app);
const PORT= process.env.PORT || 3000;

// middlewares
app.use(helmet()); //  to protect from XSS or clickjacking
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
})); // to allow frontend enter into the backend 
app.use(morgan("dev")); // logger
app.use(express.json()); // to use json

// routers
app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/folders", foldersRouter);
app.use("/api/transfers", transfersRouter);

app.get("/health", async(req: Request, res: Response)=>{
  try{
    await prisma.$queryRaw`SELECT 1`; //$queryRaw tells prisma to stop writing sql yourself and write my code instead
    res.json({status:"ok",database:"connected"});
  }catch(error){
    res.status(500).json({status:"bad",database:"not connected"});
  }
});


app.use(errorMiddleware); // error handler
initSocket(httpServer); 


httpServer.listen(PORT,()=>{
  console.log(`Server running on http://localhost:${PORT}`);
})