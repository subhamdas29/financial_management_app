import { Response } from 'express';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/ApiResponse';
import { usersService } from './users.service';
import { AuthRequest } from '../../shared/types';

export const usersController = {
  searchByEmail: asyncHandler(async (req: AuthRequest, res: Response) => {
    const email = req.query.email as string;
    const result = await usersService.searchByEmail(email, req.user!.userId);
    sendSuccess(res, result, 'Users found');
  }),
};