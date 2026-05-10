import {z} from "zod";

export const registerSchema= z.object({
    body: z.object({
        name: z.string().min(2,"Name must be atleast two characters"),
        email: z.string().email("Invalid email address"),
        password: z.string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
            .regex(/[0-9]/, 'Must contain at least one number'),

    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];

/** 
 * z.infer "steals" the TypeScript type directly from the Zod schema 
 * this keeps the zod rules and ts code types perfectly synced
 * if I change a rule in the schema like password length from 8 to 10, this type updates automatically
 * I added ['body'] at the end to only grab the type for the request body data
 */