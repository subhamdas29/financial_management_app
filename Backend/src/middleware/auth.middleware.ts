import { Response, NextFunction } from "express";
import { env } from "../config/env";
import jwt from "jsonwebtoken";
import { JwtPayload, AuthRequest } from "../shared/types/index";
import { sendError } from "../shared/utils/ApiResponse";



export const protect = // protect middleware protects all the private routes, for eg=>
// /login is public so it don't need this middleware but /account is private and only authorized users can access it

    (req: AuthRequest, res: Response, next: NextFunction)=>
    {
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer ")){return sendError( res ,"No token provided",401)};

    const token = authHeader.split(" ")[1] as string;

    try{
        const payload = jwt.verify(token , env.JWT_SECRET as string) as any as JwtPayload;
        req.user = payload;
        next();
    } catch(error){
        return sendError(res, "Invalid or expired token", 401);
    }
};