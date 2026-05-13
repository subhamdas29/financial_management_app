import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { transactionsService } from "./transactions.services";
import { sendSuccess } from "../../shared/utils/ApiResponse";
import { asyncHandler } from "../../shared/utils/asyncHandler";

export const transactionsController = {
    create: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const transaction = await transactionsService.createTranssactions(
            req.user!.userId,
            req.body,
        );
        sendSuccess(res, transaction, "Transaction successful", 201);
    }),

    getAll: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const result = await transactionsService.getTransactions(
            req.user!.userId,
            req.query as any,
        );
        sendSuccess(res, result, "Transactions fetched successfully");
    }),

    getById: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const result = await transactionsService.getTransactionById(
            req.user!.userId,
            req.params.id as string,
        );
        sendSuccess(res, result, " Transaction fetched successfully");
    }),

    update: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const result = await transactionsService.updateTransaction(
            req.user!.userId,
            req.params.id as string,
            req.body,
        );
        sendSuccess(res, result, "Updated transaction successfully");
    }),

    getStats: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const stats = await transactionsService.getTransactionStats(
            req.user!.userId,
            req.query.accountId as string | undefined,
        );
        sendSuccess(res, stats, "Stats fetched successfully");
    }),
};