
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDb() {
    try {
        console.log("Checking User model...");
        // Try to create a user directly with Prisma to verify DB schema
        const email = `direct_test_${Date.now()}@example.com`;
        const user = await prisma.user.create({
            data: {
                email,
                username: `direct_test_${Date.now()}`,
                role: "ADMIN",
                name: "Direct Test",
                firstName: "Direct",
                lastName: "Test",
                // phone not included
            }
        });
        console.log("User created successfully via Prisma:", user);

        // Update with phone to check constraints
        await prisma.user.update({
            where: { id: user.id },
            data: { phone: "9876543210" }
        });
        console.log("User updated with phone.");

        // Clean up
        await prisma.user.delete({ where: { id: user.id } });
        console.log("User deleted.");

    } catch (error) {
        console.error("Prisma Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
