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
                    await tx.popular_search_categories.update({
                        where: { id: item.id },
                        data: { display_order: item.order },
                    });
                } else {
                    await tx.popular_search_keywords.update({
                        where: { id: item.id },
                        data: { display_order: item.order },
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
