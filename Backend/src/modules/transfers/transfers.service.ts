import { getIO } from '../../config/socket';
import { Decimal } from '@prisma/client/runtime/library';
import { prisma } from '../../config/database';
import { ApiError } from '../../shared/utils/ApiError';
import { CreateTransferInput, GetTransfersQuery } from './transfers.schema';

export const transfersService = {
  async createTransfer(userId: string, input: CreateTransferInput) {
    // Verify both accounts belong to the user
    const [fromAccount, toAccount] = await prisma.$transaction([
      prisma.account.findFirst({
        where: { id: input.fromAccountId, userId, isActive: true },
      }),
      prisma.account.findFirst({
        where: { id: input.toAccountId, userId, isActive: true },
      }),
    ]);

    if (!fromAccount) {
      throw new ApiError(404, 'Source account not found or inactive');
    }

    if (!toAccount) {
      throw new ApiError(404, 'Destination account not found or inactive');
    }

    // Check sufficient balance
    if (new Decimal(fromAccount.balance).lessThan(input.amount)) {
      throw new ApiError(400, 'Insufficient balance in source account');
    }

    // Everything runs atomically — if anything fails, all rolls back
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the transfer record
      const transfer = await tx.transfer.create({
        data: {
          fromAccountId: input.fromAccountId,
          toAccountId: input.toAccountId,
          amount: input.amount,
          description: input.description ?? null,
          status: 'COMPLETED',
        },
        include: {
          fromAccount: { select: { id: true, name: true, currency: true } },
          toAccount: { select: { id: true, name: true, currency: true } },
        },
      });

      // 2. Debit source account
      await tx.account.update({
        where: { id: input.fromAccountId },
        data: { balance: { decrement: input.amount } },
      });

      // 3. Credit destination account
      await tx.account.update({
        where: { id: input.toAccountId },
        data: { balance: { increment: input.amount } },
      });

      // 4. Create DEBIT transaction record for source
      await tx.transaction.create({
        data: {
          accountId: input.fromAccountId,
          amount: input.amount,
          type: 'DEBIT',
          description: input.description ?? `Transfer to ${toAccount.name}`,
          status: 'COMPLETED',
          metadata: { transferId: transfer.id, transferType: 'OUTGOING' },
        },
      });

      // 5. Create CREDIT transaction record for destination
      await tx.transaction.create({
        data: {
          accountId: input.toAccountId,
          amount: input.amount,
          type: 'CREDIT',
          description: input.description ?? `Transfer from ${fromAccount.name}`,
          status: 'COMPLETED',
          metadata: { transferId: transfer.id, transferType: 'INCOMING' },
        },
      });

      return transfer;
    });

    try {
      getIO().to(`user:${userId}`).emit('transfer:new', {
        transfer: result,
        fromAccountId: input.fromAccountId,
        toAccountId: input.toAccountId,
      });
    }catch {
        // socket not critical
    }

return result;
  },

  async getTransfers(userId: string, query: GetTransfersQuery) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all account IDs belonging to this user first
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const where: any = {
      OR: [
        { fromAccountId: { in: accountIds } },
        { toAccountId: { in: accountIds } },
      ],
    };

    if (query.accountId) {
      where.OR = [
        { fromAccountId: query.accountId },
        { toAccountId: query.accountId },
      ];
    }

    if (query.from || query.to) {
      where.transferredAt = {};
      if (query.from) where.transferredAt.gte = new Date(query.from);
      if (query.to) where.transferredAt.lte = new Date(query.to);
    }

    const [transfers, total] = await prisma.$transaction([
      prisma.transfer.findMany({
        where,
        include: {
          fromAccount: { select: { id: true, name: true, currency: true } },
          toAccount: { select: { id: true, name: true, currency: true } },
        },
        orderBy: { transferredAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transfer.count({ where }),
    ]);

    return {
      transfers,
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

  async getTransferById(userId: string, transferId: string) {
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const transfer = await prisma.transfer.findFirst({
      where: {
        id: transferId,
        OR: [
          { fromAccountId: { in: accountIds } },
          { toAccountId: { in: accountIds } },
        ],
      },
      include: {
        fromAccount: { select: { id: true, name: true, currency: true } },
        toAccount: { select: { id: true, name: true, currency: true } },
      },
    });

    if (!transfer) throw new ApiError(404, 'Transfer not found');
    return transfer;
  },

  async getTransferStats(userId: string) {
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true },
    });

    const accountIds = userAccounts.map((a) => a.id);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allTime, thisMonth] = await prisma.$transaction([
      prisma.transfer.aggregate({
        where: {
          OR: [
            { fromAccountId: { in: accountIds } },
            { toAccountId: { in: accountIds } },
          ],
          status: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transfer.aggregate({
        where: {
          OR: [
            { fromAccountId: { in: accountIds } },
            { toAccountId: { in: accountIds } },
          ],
          status: 'COMPLETED',
          transferredAt: { gte: startOfMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      allTime: {
        totalAmount: allTime._sum.amount ?? 0,
        totalTransfers: allTime._count,
      },
      thisMonth: {
        totalAmount: thisMonth._sum.amount ?? 0,
        totalTransfers: thisMonth._count,
      },
    };
  },
};