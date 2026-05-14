import { z } from "zod";
import { FolderType } from "@prisma/client";

export const createFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1,"Folder name is required"),
        type: z.nativeEnum(FolderType),
        color: z.string().optional(), //colour code
        icon: z.string().optional(), //emoji
        description: z.string().optional(),
        budgetLimit: z.number().positive().optional()
    }),
});

export const updateFolderSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
        description: z.string().optional(),
        budgetLimit: z.number().positive().optional()
    }),
    params: z.object({
        id: z.string().min(1)
    }),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>["body"];
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>["body"];