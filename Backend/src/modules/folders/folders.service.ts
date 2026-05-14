import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';
import { ApiError } from '../../shared/utils/ApiError';
import { CreateFolderInput, UpdateFolderInput, updateFolderSchema } from './folders.schema';

export const foldersService = {
    async createFolder(userId: string, input: CreateFolderInput){
        const existing = await prisma.folder.findUnique({
            where: {userId_name: {userId, name: input.name}},
        });

        if(existing){throw new ApiError(409, `Folder "${input.name}" already exists`);}

        const folder = await prisma.folder.create({
            data: {userId, ...input as any},
        });

        return folder;
    },

    async getUserFolders(userId: string){
        const folders = await prisma.folder.findMany({
            where: {userId},
            include:{_count:{ select: {transactions: true}}},
            orderBy:[{type:"asc"},{createdAt:"asc"}],
        });

        return folders;
    },

    async getFolderById(userId: string, folderId: string){
        const folder = await prisma.folder.findFirst({
            where: {id:folderId, userId},
        });

        if(!folder){throw new ApiError(404, 'Folder not found');}

        return folder;
    },

    async getFolderSummary(userId: string, folderId: string, month?: string){
        const folder = await prisma.folder.findFirst({
            where: {id:folderId, userId},
        });

        if(!folder){throw new ApiError(404, 'Folder not found');}

        // Default to current month if not provided
        const targetDate = month ? new Date(month) : new Date();
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59);

        const [stats, transactions, monthlyBreakdown] = await prisma.$transaction([
        // Total all time
        prisma.transaction.aggregate({
            where: { folderId, status: 'COMPLETED' },
            _sum: { amount: true },
            _count: true,
        }),

        // Transactions this month
        prisma.transaction.findMany({
            where: {
               folderId,
                status: 'COMPLETED',
                transactedAt: { gte: startOfMonth, lte: endOfMonth },
            },
            include: {
                account: { select: { id: true, name: true, currency: true } },
            },
            orderBy: { transactedAt: 'desc' },
        }),

        // Last 6 months breakdown
        prisma.transaction.groupBy({
            by: ['transactedAt'],
            where: {
                folderId,
                status: 'COMPLETED',
                transactedAt: {
                    gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
                },
            },
            _sum: { amount: true },
        }),
    ]);

    // Check budget status
    const monthlySpent = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0
    );
    const budgetStatus = folder.budgetLimit
      ? {
          limit: Number(folder.budgetLimit),
          spent: monthlySpent,
          remaining: Number(folder.budgetLimit) - monthlySpent,
          isOverBudget: monthlySpent > Number(folder.budgetLimit),
          percentageUsed: Math.round(
            (monthlySpent / Number(folder.budgetLimit)) * 100
          ),
        }
      : null;

    return {
        folder,
        allTime: {
            totalAmount: stats._sum.amount ?? 0,
            totalTransactions: stats._count,
        },
        thisMonth: {
            transactions,
            totalSpent: monthlySpent,
        },
        budgetStatus,
    };
  },

    async updateFolder(userId: string, folderId: string, input: UpdateFolderInput){
        const folder = await prisma.folder.findFirst({
            where: {id:folderId, userId},
        });

        if(!folder){throw new ApiError(404, 'Folder not found');}

        if(input.name && input.name!==folder.name){
            const conflict = await prisma.folder.findUnique({
                where:{ userId_name :{userId, name: input.name}},
            });
            if (conflict) throw new ApiError(409, `Folder "${input.name}" already exists`);
        }
        
        const updated = await prisma.folder.update({
            where: {id: folderId},
            data: input as any,    
        });

        return updated;
    },

    async deleteFolder(userId: string, folderId: string){
        const folder = await prisma.folder.findFirst({
            where: { id: folderId, userId },
        });

        if (!folder) throw new ApiError(404, 'Folder not found');

        const transactionCount = await prisma.transaction.count({
            where: {folderId},
        });

        if(transactionCount>0){
            await prisma.$transaction([
                prisma.transaction.updateMany({
                    where: {folderId},
                    data: {folderId: null}
                }),
                prisma.folder.delete({where: {id: folderId}}),
            ]);
            return {message: "Folder deleted, transactions unassigned"};
        }
        prisma.folder.delete({where: {id: folderId}});
        return {message: "Folder deleted successfully"};
    },

    async getAllFolderSummary(userId: string){
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const folders = await prisma.folder.findMany({
            where: { userId },
            include: {
                transactions: {
                    where: {
                        status: 'COMPLETED',
                        transactedAt: { gte: startOfMonth },
                    },
                    select: { amount: true },
                },
            },
            orderBy: { type: 'asc' },
        });

        return folders.map((folder) => {
            const monthlySpent = folder.transactions.reduce(
                (sum, t) => sum + Number(t.amount),0);
            return {
                id: folder.id,
                name: folder.name,
                type: folder.type,
                color: folder.color,
                icon: folder.icon,
                budgetLimit: folder.budgetLimit,
                monthlySpent,
                isOverBudget: folder.budgetLimit
                ? monthlySpent > Number(folder.budgetLimit)
                : false,
            };
        });
    },
    
};