import express, {Request, Response, NextFunction} from "express";
import cors from "cors"



const app = express();
const PORT= 5500;
app.use(cors());
app.use(express.json());



app.get("/",(req: Request, res: Response)=>{
  res.json({message: "The app is running."});
})











app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({message:"Something is wrong."});
})


app.listen(PORT,()=>{
  console.log("The app is listening.");
})