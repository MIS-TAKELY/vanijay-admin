import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { categorySchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = categorySchema.partial().parse(body);

        const category = await prismaBuyer.popular_search_categories.update({
            where: { id },
            data: {
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
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await prismaBuyer.popular_search_categories.delete({
            where: { id },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
