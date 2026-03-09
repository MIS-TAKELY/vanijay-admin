import { NextResponse } from 'next/server';
import { prismaMain } from '@/lib/prisma';
import { z } from 'zod';

// CSV Columns: category,keyword,url,target
// Simple implementation: Create category if not exists, add keyword

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const rows = body.rows as string[][];

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        let importedCount = 0;
        const startIdx = (rows[0] && rows[0][0]?.toLowerCase() === 'category') ? 1 : 0;

        await prismaMain.$transaction(async (tx: any) => {
            for (let i = startIdx; i < rows.length; i++) {
                const row = rows[i];
                if (row.length < 3) continue;

                const [categoryTitle, keywordName, url, target] = row;
                if (!categoryTitle || !keywordName || !url) continue;

                let category = await tx.popularSearchCategory.findFirst({
                    where: { title: categoryTitle }
                });

                if (!category) {
                    const slug = categoryTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    const existingSlug = await tx.popularSearchCategory.findUnique({ where: { slug } });
                    if (existingSlug) continue;

                    category = await tx.popularSearchCategory.create({
                        data: {
                            id: crypto.randomUUID(),
                            title: categoryTitle,
                            slug,
                            displayOrder: 99
                        }
                    });
                }

                await tx.popularSearchKeyword.create({
                    data: {
                        id: crypto.randomUUID(),
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
        const categories = await prismaMain.popularSearchCategory.findMany({
            include: { keywords: true },
            orderBy: { displayOrder: 'asc' }
        });

        const csvRows = [['category', 'keyword', 'url', 'target', 'clicks']];
        categories.forEach((cat: any) => {
            cat.keywords.forEach((kw: any) => {
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
