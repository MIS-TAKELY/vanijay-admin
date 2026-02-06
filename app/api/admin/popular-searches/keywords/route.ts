import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { keywordSchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = keywordSchema.parse(body);

        if (!data.categoryId) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const keyword = await prismaBuyer.popularSearchKeyword.create({
            data: {
                name: data.name,
                href: data.href,
                targetType: data.targetType,
                isActive: data.isActive,
                isIndexed: data.isIndexed,
                isFeatured: data.isFeatured,
                displayOrder: data.displayOrder,
                category: {
                    connect: { id: data.categoryId }
                }
            },
        });

        return NextResponse.json(keyword);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        console.error('Error creating keyword:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
