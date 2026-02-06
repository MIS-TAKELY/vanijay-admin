import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { PrismaClient as PrismaClientMain } from './generated/client-main';

import { PrismaClient as PrismaClientBuyer } from './generated/prisma-buyer';

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

const prismaBuyerClientSingleton = () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClientBuyer({ adapter });
};

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
    var prismaMainGlobal: undefined | ReturnType<typeof prismaMainClientSingleton>;
    var prismaBuyerGlobal: undefined | ReturnType<typeof prismaBuyerClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();
export const prismaMain = globalThis.prismaMainGlobal ?? prismaMainClientSingleton();
export const prismaBuyer = globalThis.prismaBuyerGlobal ?? prismaBuyerClientSingleton();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = prisma;
    globalThis.prismaMainGlobal = prismaMain;
    globalThis.prismaBuyerGlobal = prismaBuyer;
}
