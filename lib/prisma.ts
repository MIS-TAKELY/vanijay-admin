import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientMain } from './generated/client-main';

const prismaClientSingleton = () => {
    return new PrismaClient();
};

const prismaMainClientSingleton = () => {
    return new PrismaClientMain({
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
    var prismaMainGlobal: undefined | ReturnType<typeof prismaMainClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export const prismaMain = globalThis.prismaMainGlobal ?? prismaMainClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
    globalThis.prismaMainGlobal = prismaMain;
}
