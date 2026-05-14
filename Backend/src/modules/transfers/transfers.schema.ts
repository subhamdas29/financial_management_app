import { z } from 'zod';

export const createTransferSchema = z.object({
    body: z.object({
        fromAccountId: z.string().min(1, 'Source account is required'),
        toAccountId: z.string().min(1, 'Destination account is required'),
        amount: z.number().positive('Amount must be greater than 0'),
        description: z.string().optional(),
    }).refine((data) => data.fromAccountId !== data.toAccountId, {
        message: 'Cannot transfer to the same account',
        path: ['toAccountId'],
    }),
});

export const getTransfersSchema = z.object({
    query: z.object({
        accountId: z.string().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
        page: z.string().default('1'),
        limit: z.string().default('20'),
    }),
});

export type CreateTransferInput = z.infer<typeof createTransferSchema>['body'];
export type GetTransfersQuery = z.infer<typeof getTransfersSchema>['query'];