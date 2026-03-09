import { NextResponse } from 'next/server';
import { prismaMain } from '@/lib/prisma';
import { keywordSchema } from '@/utils/schemas/popular-searches';
import { z } from 'zod';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const data = keywordSchema.parse(body);

        if (!data.categoryId) {
            return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
        }

        const keyword = await prismaMain.popularSearchKeyword.create({
            data: {
                id: crypto.randomUUID(),
                name: data.name,
                href: data.href,
                targetType: data.targetType,
                isActive: data.isActive,
                isIndexed: data.isIndexed,
                isFeatured: data.isFeatured,
                displayOrder: data.displayOrder,
                category: { connect: { id: data.categoryId } }
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

        const keyword = await prismaMain.popularSearchKeyword.update({
            where: { id },
            data: {
                name: validatedData.name,
                href: validatedData.href,
                targetType: validatedData.targetType,
                isActive: validatedData.isActive,
                isIndexed: validatedData.isIndexed,
                isFeatured: validatedData.isFeatured,
                displayOrder: validatedData.displayOrder,
                ...(validatedData.categoryId && {
                    category: { connect: { id: validatedData.categoryId } }
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
