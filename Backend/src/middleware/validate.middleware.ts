import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError, ZodIssue } from 'zod';
import { sendError } from '../shared/utils/ApiResponse';

export const validate = // zod compares the schema with registerSchema or LoginSchema
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as ZodError<unknown>).issues.map((e: ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return sendError(res, 'Validation failed', 400, errors);
      }
      next(error);
    }
  };