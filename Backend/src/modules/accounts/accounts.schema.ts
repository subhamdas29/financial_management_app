import {z} from "zod";
import { AccountType } from "@prisma/client";

export const createAccountSchema = z.object({
    body: z.object({
        name: z.string().min(2,"Account name must be atleast two charcters"),
        accountNumber: z.string().min(8,"Account number must be atleast 8 digits"),
        accountType: z.nativeEnum(AccountType),
        balance: z.union([z.string(), z.number()]).transform((val) => val.toString()),
        currency: z.string().default("INR"),
    }),
});

export const updateAccountSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        isActive: z.boolean().optional(),
    }),
    params: z.object({
        id: z.string().min(1),
    }),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>['body'];
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>['body'];