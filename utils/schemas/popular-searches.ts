import { z } from 'zod';

export const keywordSchema = z.object({
    name: z.string().min(2).max(150),
    categoryId: z.string().uuid().optional(), // Optional for creation if passed in path or body differently
    href: z.string().url().or(z.string().startsWith('/')), // Allow internal links
    targetType: z.enum(['_self', '_blank', 'category', 'brand', 'product', 'search']),
    isActive: z.boolean().default(true),
    isIndexed: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    clickCount: z.number().default(0),
    displayOrder: z.number().default(0),
});

export const categorySchema = z.object({
    title: z.string().min(2).max(100),
    slug: z.string().min(2).max(100),
    icon: z.string().optional(),
    displayOrder: z.number().default(0),
    isActive: z.boolean().default(true),
    isIndexed: z.boolean().default(true),
});

export const reorderSchema = z.object({
    type: z.enum(['category', 'keyword']),
    items: z.array(z.object({
        id: z.string(),
        order: z.number(),
    })),
});
