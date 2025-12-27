import { PrismaClient } from './generated/prisma-buyer';

const globalForPrismaBuyer = globalThis as unknown as {
    prismaBuyer: PrismaClient | undefined;
};

export const prismaBuyer = globalForPrismaBuyer.prismaBuyer ?? new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrismaBuyer.prismaBuyer = prismaBuyer;
