import {Request, Response} from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../shared/utils/ApiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

export const authController = {
    register: asyncHandler(async(req: Request,res: Response)=>{
        const result = await authService.register(req.body);
        sendSuccess(res, result, "Account created successfully", 201);
    }),

    login: asyncHandler(async(req: Request, res: Response)=>{
        const result = await authService.login(req.body);
        sendSuccess(res, result, "Login successful", 200);
    }),

    refresh: asyncHandler(async(req: Request, res: Response)=>{
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token required' });
        }
        const tokens = await authService.refreshToken(refreshToken);
        sendSuccess(res, tokens, 'Tokens refreshed');
    }),
};