import { Request } from "express";

export interface JwtPayload{
    userId: String;
    email: String
};

export interface AuthRequest extends Request{ // Extends Express Request to carry the authenticated user
    user? : JwtPayload; //now we can use req.user is user exists
}