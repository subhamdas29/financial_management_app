import "dotenv/config";
import './config/env';
import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import { prisma } from "./config/database"
import helmet from "helmet";
import morgan from "morgan";
import { errorMiddleware } from "./middleware/error.middleware";
import authRouter from "./modules/auth/auth.router";

const app = express();
const PORT= process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());


app.use("/api/auth", authRouter);


app.get("/",(req: Request, res: Response)=>{
  res.json({message: "The app is running."});
});


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