import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as PrismaClientMain } from '../lib/generated/client-main';

// Slugification logic matching the frontend safeguard
function slugifyPath(input: string): string {
    if (!input) return '/';
    // Ensure it starts with a slash, then lowercase and replace spaces/special chars with dashes
    const raw = input.startsWith('/') ? input.slice(1) : input;
    const slug = raw
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')   // remove special chars except spaces and dashes
        .replace(/\s+/g, '-')            // spaces to dashes
        .replace(/-+/g, '-')             // collapse multiple dashes
        .replace(/^-|-$/g, '');          // trim leading/trailing dashes
    return slug ? `/${slug}` : '/';
}

async function main() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL environment variable is not set');
        process.exit(1);
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClientMain({ adapter });

    try {
        console.log('--- SEO Path Cleanup Script ---');
        console.log('Fetching all SEO pages...');
        const pages = await prisma.seoPage.findMany();
        console.log(`Found ${pages.length} pages to check.`);

        let updatedCount = 0;
        for (const page of pages) {
            const currentPath = page.urlPath;
            const correctPath = slugifyPath(currentPath);

            if (currentPath !== correctPath) {
                console.log(`[FIX] ID: ${page.id}`);
                console.log(`      Old: "${currentPath}"`);
                console.log(`      New: "${correctPath}"`);

                await prisma.seoPage.update({
                    where: { id: page.id },
                    data: { urlPath: correctPath }
                });
                updatedCount++;
            }
        }

        console.log('------------------------------');
        console.log(`Cleanup complete. Updated ${updatedCount} pages.`);

    } catch (error) {
        console.error('An error occurred during cleanup:', error);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
