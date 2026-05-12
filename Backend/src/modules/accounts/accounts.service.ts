import { prisma } from "../../config/database";
import { ApiError } from "../../shared/utils/ApiError";
import { CreateAccountInput,UpdateAccountInput,updateAccountSchema } from "./accounts.schema";


export const accountsService = {
    async createAccount(userId: string, input: CreateAccountInput)
        {
            const existing = await prisma.account.findUnique({
                where : {accountNumber: input.accountNumber},
            });

            if (existing){throw new ApiError(401,"Account number already exists");}

            const account = await prisma.account.create({
                data: {
                    userId,
                    name: input.name,
                    accountNumber: input.accountNumber,
                    accountType: input.accountType,
                    balance: input.balance,
                    currency: input.currency,
                },
            });

            return account;
        },

    async getUserAccounts(userId: string) {
        const accounts = await prisma.account.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { transactions: true },
                    },
            },
            orderBy: { createdAt: 'desc' },
            });

        return accounts;
    },

    async getAccountById(userId: string, accountId: string){
        const account = await prisma.account.findFirst({
            where: { id: accountId, userId},
            include: { transactions:{
                orderBy: {transactedAt: ("desc")},
                take: 10,
            },
          },
        });

        if(!account){throw new ApiError(404,"Account not found");}
        return account;
    },

    async updateAccount( userId: string, accountId: string, input: UpdateAccountInput){
        const account= await prisma.account.findFirst({
            where: {id:accountId, userId},
        });
        if(!account){throw new ApiError(404,"Account not found");}

        const updated = await prisma.account.update({
            where:{id:accountId},
            data: input as any,
        });

        return updated;
    },

    async deleteAccount( userId: string, accountId: string){
        const account = await prisma.account.findFirst({
            where: {id:accountId,userId},
        });
        if(!account){throw new ApiError(404,"Account not found");}


        // Check if account has transactions — soft delete instead
        const transactionCount = await prisma.transaction.count({
            where: { accountId },
        });

        if (transactionCount > 0) {
            // Don't hard delete — just deactivate
            await prisma.account.update({
                where: { id: accountId },
                data: { isActive: false },
            });
            return { message: 'Account deactivated (has existing transactions)' };
        }

        await prisma.account.delete({ where: { id: accountId } });
        return { message: 'Account deleted successfully' };
    },

    async getAccountsSummary(userId: string){
        const accounts = await prisma.account.findMany({
        where: { userId, isActive: true },
        select: { balance: true, currency: true, accountType: true },
        });

        const totalBalance = accounts.reduce(
        (sum, acc) => sum + Number(acc.balance),0
        );

        return {
        totalBalance,
        totalAccounts: accounts.length,
        accounts,
        };
    },
};