import { getIO } from '../../config/socket';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/ApiError';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  GetTransactionsQuery,
} from './transactions.schema';


export const transactionsService = {
  async createTranssactions(userId: string, input: CreateTransactionInput) {
    const account = await prisma.account.findFirst({
      where: { id: input.accountId, userId, isActive: true },
    });

    if (!account) {
      throw new ApiError(404, 'Account not found or inactive');
    }

    if (input.folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: input.folderId, userId },
      });
      if (!folder) { throw new ApiError(404, 'Folder not found'); }
    }

    if (input.type === 'DEBIT') {
      if (new Decimal(account.balance).lessThan(input.amount)) {
        throw new ApiError(400, 'Insufficient balance');
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
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

      await tx.account.update({
        where: { id: input.accountId },
        data: {
          balance: {
            increment: input.type === 'CREDIT' ? input.amount : -input.amount,
          },
        },
      });

      return transaction;
    });

    try {
      getIO().to(`user:${userId}`).emit('transaction:new', {
        transaction: result,
        accountId: input.accountId,
      });
    } catch {
      // socket not critical — don't fail the request if emit fails
    }

    return result;
  },

  async getTransactions(userId: string, query: GetTransactionsQuery) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all account IDs for this user first
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const where: any = {
      accountId: { in: accountIds },
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
    // Get all account IDs for this user first
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        accountId: { in: accountIds },
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
    // Get all account IDs for this user first
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        accountId: { in: accountIds },
      },
    });

    if (!transaction) throw new ApiError(404, 'Transaction not found');

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
    // Get all account IDs for this user first
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const where: any = {
      accountId: { in: accountIds },
    };

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