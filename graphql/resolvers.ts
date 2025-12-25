import { prisma, prismaMain } from '../lib/prisma';

export const resolvers = {
    Query: {
        hello: () => 'Hello from Admin Graphql',
        users: async (_: any, { take = 10, skip = 0 }) => {
            const users = await prismaMain.user.findMany({
                take,
                skip,
                orderBy: { createdAt: 'desc' },
                include: { sellerProfile: true, roles: true }
            });
            return users.map((u: any) => ({
                ...u,
                role: u.roles?.[0]?.role || 'BUYER', // Simplified logic for demo
                isSeller: !!u.sellerProfile,
                createdAt: u.createdAt.toISOString()
            }));
        },
        sellers: async (_: any, { take = 10, skip = 0 }) => {
            return await prismaMain.sellerProfile.findMany({
                take,
                skip,
                orderBy: { createdAt: 'desc' }
            });
        },
        products: async (_: any, { take = 10, skip = 0 }) => {
            const products = await prismaMain.product.findMany({
                take,
                skip,
                include: {
                    variants: true,
                    category: true,
                    seller: { select: { name: true, sellerProfile: { select: { shopName: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            });

            return products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
                stock: p.variants?.[0]?.stock || 0,
                status: p.status,
                category: p.category?.name || 'Uncategorized',
                sellerName: p.seller.sellerProfile?.shopName || p.seller.name
            }));
        },
        categories: async () => {
            const categories = await prismaMain.category.findMany({
                orderBy: { name: 'asc' },
                include: { parent: true }
            });
            return categories.map((c: any) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                isActive: c.isActive,
                parentName: c.parent?.name
            }));
        },
        offers: async () => {
            const offers = await prismaMain.offer.findMany({
                orderBy: { startDate: 'desc' }
            });
            return offers.map((o: any) => ({
                id: o.id,
                title: o.title,
                type: o.type,
                value: Number(o.value),
                isActive: o.isActive,
                startDate: o.startDate.toISOString(),
                endDate: o.endDate.toISOString()
            }));
        },
        dashboardStats: async () => {
            const totalUsers = await prismaMain.user.count();
            const totalOrders = await prismaMain.order.count();
            const sales = await prismaMain.order.aggregate({
                _sum: { total: true }
            });
            return {
                totalUsers,
                totalOrders,
                totalSales: sales._sum.total ? Number(sales._sum.total) : 0
            };
        }
    },
    Mutation: {
        loginAdmin: async (_: any, { email }: { email: String }) => {
            // In future, check prisma.admin.findUnique({ where: { email } })
            return "mock_token";
        }
    }
};
