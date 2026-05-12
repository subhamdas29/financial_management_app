import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/ApiResponse';
import { accountsService } from './accounts.service';
import { AuthRequest } from '../../shared/types';


export const accountsController = {
    create: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const account = await accountsService.createAccount(req.user!.userId, req.body);
        sendSuccess(res, account, "Account created successfully", 201);
    }),

    getAll: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const accounts = await accountsService.getUserAccounts(req.user!.userId);
        sendSuccess(res, accounts, "Accounts fetched successfully");
    }),

    getById: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const account = await accountsService.getAccountById(req.user!.userId, req.params.id as string);
        sendSuccess(res, account, "Account fetched successfully");
    }),

    update: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const account = await accountsService.updateAccount(req.user!.userId, req.params.id as string, req.body);
        sendSuccess(res, account, "Account updated successfully");
    }),

    delete: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const result = await accountsService.deleteAccount(req.user!.userId, req.params.id as string);
        sendSuccess(res, result, result.message);
    }),

    getSummary: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const summary = await accountsService.getAccountsSummary(req.user!.userId);
        sendSuccess(res,summary, "Summary fetched successfully");
    }),
};