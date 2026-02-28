import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { keywordSchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = keywordSchema.partial().parse(body);

        const keyword = await prismaBuyer.popular_search_keywords.update({
            where: { id },
            data: {
                name: data.name,
                href: data.href,
                target_type: data.targetType,
                is_active: data.isActive,
                is_indexed: data.isIndexed,
                is_featured: data.isFeatured,
                display_order: data.displayOrder,
                ...(data.categoryId && {
                    popular_search_categories: {
                        connect: { id: data.categoryId }
                    }
                })
            },
        });

        return NextResponse.json(keyword);
    } catch (error) {
        console.error('Error updating keyword:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prismaBuyer.popular_search_keywords.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting keyword:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
