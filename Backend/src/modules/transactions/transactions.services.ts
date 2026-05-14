import { getIO } from '../../config/socket';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/ApiError';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  GetTransactionsQuery,
} from './transactions.schema';
import { string } from 'zod';

export const transactionsService = {
    async createTranssactions(userId: string, input: CreateTransactionInput){

        const account = await prisma.account.findFirst({
            where: {id: input.accountId, userId, isActive: true},
        });

        if(!account){
            throw new ApiError(404, "Account not found or inactive");
        }

        if(input.folderId){
            const folder = await prisma.folder.findFirst({
                where: {id: input.folderId, userId},
            });
            if(!folder){throw new ApiError(404,"Folder not found");}
        }

        if(input.type==="DEBIT"){
            if(new Decimal(account.balance).lessThan(input.amount)){
                throw new ApiError(400,"Insufficient balance");
            }
        }

        const result = await prisma.$transaction(async(tx)=>{ // $ means all the db operations is treated as one, if async(tx) succeed it will commit or else it will rollback
            const transaction = await tx.transaction.create({ // tx is a buffer so that changes doesn't appear in the db directly
                data: {
                    accountId: input.accountId,
                    folderId: input.folderId ?? null,
                    amount: input.amount,
                    type: input.type,
                    description: input.description,
                    merchant: input.merchant ?? null,
                    status: 'COMPLETED',
                    transactedAt: input.transactedAt ? new Date(input.transactedAt) : new Date(),
                    metadata: input.metadata ?? {},
                },
                include: {
                    folder: { select: { id: true, name: true, type: true } },
                    account: { select: { id: true, name: true, currency: true } },
                },
            });
            
            await tx.account.update({ //updating the account balance
                where: {id: input.accountId},
                data:{
                    balance:{
                        increment: input.type==="CREDIT" ? input.amount : -input.amount,
                    },
                },
            });
            return transaction;
        }); // $transaction will consider all the operations till this point as one block

        try {
            getIO().to(`user:${userId}`).emit('transaction:new', {
                transaction: result,
                accountId: input.accountId,
            });
        }catch {
            // socket not critical — don't fail the request if emit fails
        }

return result;
    },

    async getTransactions(userId: string, query: GetTransactionsQuery) {
        const page = parseInt(query.page);
        const limit = parseInt(query.limit);
        const skip = (page - 1) * limit;

        // Build dynamic where clause
        const where: any = {
            account: { userId }, // only user's transactions
        };

        if (query.accountId) where.accountId = query.accountId;
        if (query.folderId) where.folderId = query.folderId;
        if (query.type) where.type = query.type;
        if (query.status) where.status = query.status;
        if (query.from || query.to) {
            where.transactedAt = {};
            if (query.from) where.transactedAt.gte = new Date(query.from);
            if (query.to) where.transactedAt.lte = new Date(query.to);
        }

        const [transactions, total] = await prisma.$transaction([
            prisma.transaction.findMany({
                where,
                include: {
                    folder: { select: { id: true, name: true, type: true, color: true } },
                    account: { select: { id: true, name: true, currency: true } },
                },
                orderBy: { transactedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.transaction.count({ where }),
        ]);

        return {
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1,
            },
        };
    },

    async getTransactionById(userId: string, transactionId: string) {
        const transaction = await prisma.transaction.findFirst({
            where: {
                id: transactionId,
                account: { userId },
            },
            include: {
                folder: true,
                account: { select: { id: true, name: true, currency: true } },
                },
            });

        if (!transaction) throw new ApiError(404, 'Transaction not found');
        return transaction;
    },

    async updateTransaction(userId: string, transactionId: string, input: UpdateTransactionInput) {
        const transaction = await prisma.transaction.findFirst({
            where: { id: transactionId, account: { userId } },
        });

        if (!transaction) throw new ApiError(404, 'Transaction not found');

        // Verify new folder belongs to user if being changed
        if (input.folderId) {
            const folder = await prisma.folder.findFirst({
                where: { id: input.folderId, userId },
            });
        if (!folder) throw new ApiError(404, 'Folder not found');
        }

        const updated = await prisma.transaction.update({
            where: { id: transactionId },
            data: {
                folderId: input.folderId ?? null,
                description: input.description as string,
                merchant: input.merchant ?? null,
            },
            include: {
                folder: { select: { id: true, name: true, type: true } },
                account: { select: { id: true, name: true } },
            },
        });

        return updated;
    },

    async getTransactionStats(userId: string, accountId?: string) {
        const where: any = { account: { userId } };
        if (accountId) where.accountId = accountId;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalCredit, totalDebit, monthlyCredit, monthlyDebit] =
        await prisma.$transaction([
        prisma.transaction.aggregate({
            where: { ...where, type: 'CREDIT', status: 'COMPLETED' },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: { ...where, type: 'DEBIT', status: 'COMPLETED' },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: {
                ...where,
                type: 'CREDIT',
                status: 'COMPLETED',
                transactedAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
        prisma.transaction.aggregate({
            where: {
                ...where,
                type: 'DEBIT',
                status: 'COMPLETED',
                transactedAt: { gte: startOfMonth },
            },
            _sum: { amount: true },
        }),
        ]);

        return {
            allTime: {
                totalCredit: totalCredit._sum.amount ?? 0,
                totalDebit: totalDebit._sum.amount ?? 0,
            },
            thisMonth: {
                totalCredit: monthlyCredit._sum.amount ?? 0,
                totalDebit: monthlyDebit._sum.amount ?? 0,
            },
        };
    },
};

