import { NextResponse } from 'next/server';
import { prismaMain } from '@/lib/prisma';
import { categorySchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const data = categorySchema.partial().parse(body);

        const category = await prismaMain.popularSearchCategory.update({
            where: { id },
            data: {
                title: data.title,
                slug: data.slug,
                icon: data.icon,
                displayOrder: data.displayOrder,
                isActive: data.isActive,
                isIndexed: data.isIndexed,
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
        await prismaMain.popularSearchCategory.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
