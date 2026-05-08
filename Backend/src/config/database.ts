import { PrismaClient } from "@prisma/client";

// Nullish Coalescing operator (??). It says:"Is there any Prisma client?"
// Yes: Use that one.
// No: Create a brand new one (and log queries/errors so I can see what's happening in my terminal).

const globalForPrisma = globalThis as unknown as { //globalthis is a global variable that stays alive as long as the application is running
    prisma: PrismaClient | undefined;              //globalthis prevents creating multiple prisma connections
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ //creates a new connection if there is no connection
    log: ['query','error','warn'],
});

if (process.env.NODE_ENV!=='production'){
    globalForPrisma.prisma = prisma;
}