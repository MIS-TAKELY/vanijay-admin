import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { z } from 'zod';

// CSV Columns: category,keyword,url,target
// Simple implementation: Create category if not exists, add keyword

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rows = body.rows as string[][]; // Array of arrays

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        let importedCount = 0;

        // header row might exist, skip if first cell is 'category'
        const startIdx = (rows[0] && rows[0][0]?.toLowerCase() === 'category') ? 1 : 0;

        await prismaBuyer.$transaction(async (tx) => {
            for (let i = startIdx; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 3) continue;

                const [categoryTitle, keywordName, url, target] = row;
                if (!categoryTitle || !keywordName || !url) continue;

                // Find or Create Category
                let category = await tx.popularSearchCategory.findFirst({
                    where: { title: categoryTitle }
                });

                if (!category) {
                    // Generate simple slug
                    const slug = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    // Ensure slug unique? simpler to just append random if needed, but for now assume clean
                    // Or try findUnique by slug
                    const existingSlug = await tx.popularSearchCategory.findUnique({ where: { slug } });
                    if (existingSlug) {
                        // Skip or append random
                        continue;
                    }

                    category = await tx.popularSearchCategory.create({
                        data: {
                            title: categoryTitle,
                            slug,
                            displayOrder: 99 // Put at end
                        }
                    });
                }

                // Create Keyword
                await tx.popularSearchKeyword.create({
                    data: {
                        name: keywordName,
                        href: url,
                        targetType: target || '_self',
                        categoryId: category.id,
                        displayOrder: 99
                    }
                });
                importedCount++;
            }
        });

        return NextResponse.json({ success: true, count: importedCount });
    } catch (error) {
        console.error('Bulk import error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const categories = await prismaBuyer.popularSearchCategory.findMany({
            include: { keywords: true },
            orderBy: { displayOrder: 'asc' }
        });

        const csvRows = [['category', 'keyword', 'url', 'target', 'clicks']];
        categories.forEach(cat => {
            cat.keywords.forEach(kw => {
                csvRows.push([
                    `"${cat.title}"`,
                    `"${kw.name}"`,
                    `"${kw.href}"`,
                    `"${kw.targetType}"`,
                    kw.clickCount.toString()
                ]);
            });
        });

        const csvString = csvRows.map(row => row.join(',')).join('\n');

        return new NextResponse(csvString, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="popular-searches.csv"',
            }
        });
    } catch (error) {
        console.error('Bulk export error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
