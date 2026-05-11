import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../shared/utils/ApiError';
import { sendError } from '../shared/utils/ApiResponse';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[ERROR] ${err.message}`);

  if (err instanceof ApiError) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  // Prisma unique constraint violation
  if ((err as any).code === 'P2002') {
    return sendError(res, 'A record with this value already exists', 409);
  }

  return sendError(res, 'Internal server error', 500);
};