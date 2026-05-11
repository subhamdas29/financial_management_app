import { Request } from "express";

export interface JwtPayload{
    userId: string;
    email: string
};

export interface AuthRequest extends Request{ // Extends Express Request to carry the authenticated user
    user? : JwtPayload; //now we can use req.user if user exists
}