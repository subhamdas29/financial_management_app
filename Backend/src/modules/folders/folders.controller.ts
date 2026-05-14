import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/ApiResponse';
import { foldersService } from './folders.service';
import { AuthRequest } from '../../shared/types';

export const foldersController = {
    create: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const folder = await foldersService.createFolder(req.user!.userId, req.body);
        sendSuccess(res, folder, "Folder created Successfully", 201);
    }),

    getAll: asyncHandler(async( req: AuthRequest, res: Response)=>{
        const folders = await foldersService.getUserFolders(req.user!.userId);
        sendSuccess(res, folders, "Folders fetched successfully");
    }),

    getById: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const folder = await foldersService.getFolderById(
            req.user!.userId, req.params.id as string
        );
        sendSuccess(res, folder, "Folder fetched successfully");
    }),

    getSummary: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const summary = await foldersService.getFolderSummary(
            req.user!.userId, req.params.id as string, req.query.month as string | undefined 
        );
        sendSuccess(res, summary, "Fetched summary of the folder successfully");
    }),

    getAllSummary: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const summary = await foldersService.getAllFolderSummary(req.user!.userId);
        sendSuccess(res, summary, "All summary fetched successfully");
    }),

    update: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const folder = await foldersService.updateFolder(
            req.user!.userId, req.params.id as string, req.body
        );
        sendSuccess(res, folder, "Folder updated successfully");
    }),

    delete: asyncHandler(async(req: AuthRequest, res: Response)=>{
        const folder = await foldersService.deleteFolder(
            req.user!.userId, req.params.id as string
        );
        sendSuccess(res, folder, folder.message);
    })
}