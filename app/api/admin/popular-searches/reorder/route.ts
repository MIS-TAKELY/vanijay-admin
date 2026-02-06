import { NextResponse } from 'next/server';
import { prismaBuyer } from '@/lib/prisma';
import { reorderSchema } from '@/utils/schemas/popular-searches';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, items } = reorderSchema.parse(body);

        await prismaBuyer.$transaction(async (tx) => {
            for (const item of items) {
                if (type === 'category') {
                    await tx.popularSearchCategory.update({
                        where: { id: item.id },
                        data: { displayOrder: item.order },
                    });
                } else {
                    await tx.popularSearchKeyword.update({
                        where: { id: item.id },
                        data: { displayOrder: item.order },
                    });
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error reordering:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
