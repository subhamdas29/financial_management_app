import {z} from "zod";
import { TransactionType,TransactionStatus } from "@prisma/client";

export const createTransactionSchema = z.object({
    body: z.object({
        accountId: z.string().min(1,"Account ID is required"),
        folderId: z.string().optional(),
        amount: z.number().positive("Amount must be greater than 0"),
        type: z.nativeEnum(TransactionType),
        description: z.string().min(1,"Description is required"),
        merchant: z.string().optional(),
        transactedAt: z.string().datetime().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
    }),
});

export const updateTransactionSchema = z.object({
    body: z.object({
        folderId: z.string().nullable().optional(),
        description: z.string().min(1,"Description is required").optional(),
        merchant: z.string().optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    accountId: z.string().optional(),
    folderId: z.string().optional(),
    type: z.nativeEnum(TransactionType).optional(),
    status: z.nativeEnum(TransactionStatus).optional(),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
    page: z.string().default('1'),
    limit: z.string().default('20'),
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>['body'];
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>['body'];
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>['query'];