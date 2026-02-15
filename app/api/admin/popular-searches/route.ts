import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { categorySchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};
        if (status === 'active') where.isActive = true;
        if (status === 'inactive') where.isActive = false;

        const categories = await prismaBuyer.popular_search_categories.findMany({
            where,
            orderBy: { display_order: 'asc' },
            include: {
                popular_search_keywords: {
                    orderBy: { display_order: 'asc' },
                },
            },
        });

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = categorySchema.parse(body);

        // Check slug uniqueness
        const existing = await prismaBuyer.popular_search_categories.findUnique({
            where: { slug: data.slug },
        });
        if (existing) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
        }

        const category = await prismaBuyer.popular_search_categories.create({
            data: {
                id: crypto.randomUUID(),
                title: data.title,
                slug: data.slug,
                icon: data.icon,
                display_order: data.displayOrder,
                is_active: data.isActive,
                is_indexed: data.isIndexed,
            },
        });

        return NextResponse.json(category);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
