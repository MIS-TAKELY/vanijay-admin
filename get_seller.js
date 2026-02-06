const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const seller = await prisma.user.findFirst({
        where: { role: 'SELLER' }
    });
    console.log('SELLER_ID:', seller?.id);
    await prisma.$disconnect();
}

main().catch(console.error);
