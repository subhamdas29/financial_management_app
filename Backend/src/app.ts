import "dotenv/config";
import './config/env';
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import { prisma } from "./config/database"
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleware } from "./middleware/error.middleware";
import authRouter from "./modules/auth/auth.router";
import accountsRouter from './modules/accounts/accounts.router';
import transactionsRouter from "./modules/transactions/transactions.router"

const app = express();
const PORT= process.env.PORT || 3000;


app.use(helmet()); //  to protect from XSS or clickjacking
app.use(cors()); // to allow frontend enter into the backend 
app.use(morgan("dev")); // logger
app.use(express.json()); // to use json


app.use("/api/auth", authRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/transactions", transactionsRouter);

app.get("/health", async(req: Request, res: Response)=>{
  try{
    await prisma.$queryRaw`SELECT 1`; //$queryRaw tells prisma to stop writing sql yourself and write my code instead
    res.json({status:"ok",database:"connected"});
  }catch(error){
    res.status(500).json({status:"bad",database:"not connected"});
  }
});


app.use(errorMiddleware);


app.listen(PORT,()=>{
  console.log("The app is listening.");
})