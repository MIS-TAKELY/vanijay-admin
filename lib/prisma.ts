import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientMain } from './generated/client-main';

const prismaClientSingleton = () => {
    const pool = new Pool({ connectionString: process.env.ADMIN_DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const prismaMainClientSingleton = () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClientMain({ adapter });
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
