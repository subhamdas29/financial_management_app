import express, {Request, Response, NextFunction} from "express";
import cors from "cors";
import "dotenv/config";
import { prisma } from "./config/database"

const app = express();
const PORT= process.env.PORT || 3000;

app.use(cors());
app.use(express.json());



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








app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({message:"Something is wrong."});
})


app.listen(PORT,()=>{
  console.log("The app is listening.");
})