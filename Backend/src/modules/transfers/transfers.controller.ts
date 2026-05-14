import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/ApiResponse';
import { transfersService } from './transfers.service';
import { AuthRequest } from '../../shared/types';

export const transfersController = {
    create: asyncHandler(async (req: AuthRequest, res: Response) => {
        const transfer = await transfersService.createTransfer(
            req.user!.userId,
            req.body
        );
        sendSuccess(res, transfer, 'Transfer completed successfully', 201);
    }),

    getAll: asyncHandler(async (req: AuthRequest, res: Response) => {
        const result = await transfersService.getTransfers(
            req.user!.userId,
            req.query as any
        );
        sendSuccess(res, result, 'Transfers fetched successfully');
    }),

    getById: asyncHandler(async (req: AuthRequest, res: Response) => {
        const transfer = await transfersService.getTransferById(
            req.user!.userId,
            req.params.id as string
        );
        sendSuccess(res, transfer, 'Transfer fetched successfully');
    }),

    getStats: asyncHandler(async (req: AuthRequest, res: Response) => {
        const stats = await transfersService.getTransferStats(req.user!.userId);
        sendSuccess(res, stats, 'Transfer stats fetched successfully');
    }),
};