import {z} from "zod";

const envSchema = z.object({ //this is a schema for my .env variables 
    DATABASE_URL: z.string().min(1),
    PORT: z.string().default("3000"),
    JWT_SECRET: z.string().min(32),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    NODE_ENV: z.enum(['development','production','test']).default('development')
});

const parsed = envSchema.safeParse(process.env);

if(!parsed.success){ //if env variables have wrong values, error shows up
    console.log("Invalid Environmental Variables");
    console.log("parsed.error.flatten().fieldErrors");
    process.exit(1);
}

export const env= parsed.data;