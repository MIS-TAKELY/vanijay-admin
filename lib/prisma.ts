import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientMain } from './generated/client-main';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const prismaClientSingleton = () => {
    const connectionString = process.env.ADMIN_DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
};

const prismaMainClientSingleton = () => {
    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
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
