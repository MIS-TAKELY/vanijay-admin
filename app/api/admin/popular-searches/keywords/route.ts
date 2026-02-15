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

        const keyword = await prismaBuyer.popular_search_keywords.create({
            data: {
                id: crypto.randomUUID(),
                name: data.name,
                href: data.href,
                target_type: data.targetType,
                is_active: data.isActive,
                is_indexed: data.isIndexed,
                is_featured: data.isFeatured,
                display_order: data.displayOrder,
                popular_search_categories: {
                    connect: { id: data.categoryId }
                }
            },
        });

        return NextResponse.json(keyword);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        console.error('Error creating keyword:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { id, ...data } = body;

        if (!id) {
            return NextResponse.json({ error: 'Keyword ID is required' }, { status: 400 });
        }

        const validatedData = keywordSchema.parse(data);

        const keyword = await prismaBuyer.popular_search_keywords.update({
            where: { id },
            data: {
                name: validatedData.name,
                href: validatedData.href,
                target_type: validatedData.targetType,
                is_active: validatedData.isActive,
                is_indexed: validatedData.isIndexed,
                is_featured: validatedData.isFeatured,
                display_order: validatedData.displayOrder,
                ...(validatedData.categoryId && {
                    popular_search_categories: {
                        connect: { id: validatedData.categoryId }
                    }
                })
            },
        });

        return NextResponse.json(keyword);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        console.error('Error updating keyword:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
