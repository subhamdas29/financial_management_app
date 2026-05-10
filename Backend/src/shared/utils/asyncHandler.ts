//To stop your server from crashing when an async database call fails

import { Request, Response, NextFunction } from "express";

type asyncFn = (
    req: Request,
    res: Response,
    next: NextFunction
)=>Promise<any>;

export const asyncHandler = (fn: asyncFn)=> // this saves you from writing try/catch thousands of times
    (req: Request, res: Response, next: NextFunction)=>{
    Promise.resolve(fn(req,res,next)).catch(next);
};

