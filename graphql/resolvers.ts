import { prisma, prismaMain } from '../lib/prisma';
// import { prismaBuyer } from '../lib/prisma-buyer';
import { redis } from '../lib/redis';

export const resolvers = {
    Query: {
        hello: () => 'Hello from Admin Graphql',
        seoPages: async () => {
            return await prismaMain.seoPage.findMany({
                include: { category: true },
                orderBy: { updatedAt: 'desc' }
            });
        },
        seoAnalytics: async () => {
            const allPages = await prismaMain.seoPage.findMany({
                include: { category: true }
            });

            const statsMap: Record<string, any> = {};
            let staleCount = 0;
            let indexedCount = 0;

            allPages.forEach(p => {
                if (p.isStale) staleCount++;
                if (p.isIndexed) indexedCount++;

                const catId = p.categoryId;
                if (!statsMap[catId]) {
                    statsMap[catId] = {
                        categoryId: catId,
                        categoryName: p.category?.name || "Unknown",
                        pageCount: 0,
                        staleCount: 0
                    };
                }
                statsMap[catId].pageCount++;
                if (p.isStale) statsMap[catId].staleCount++;
            });

            return {
                totalPageCount: allPages.length,
                stalePageCount: staleCount,
                indexedPageCount: indexedCount,
                categoryStats: Object.values(statsMap)
            };
        },
        user: async (_: any, { id }: { id: string }) => {
            const user = await prismaMain.user.findUnique({
                where: { id },
                include: { sellerProfile: true, roles: true }
            });
            if (!user) return null;
            return {
                ...user,
                role: user.roles?.[0]?.role || 'BUYER',
                roles: user.roles?.map((r: any) => r.role) || [],
                isSeller: !!user.sellerProfile,
                createdAt: user.createdAt.toISOString()
            };
        },
        users: async (_: any, { take = 10, skip = 0, search, role, isBanned, sortBy }: any) => {
            console.log("DEBUG: users query args:", { take, skip, search, role, isBanned, sortBy });
            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ];
            }

            if (role) {
                if (role === 'BOTH') {
                    where.AND = [
                        { roles: { some: { role: 'BUYER' } } },
                        { roles: { some: { role: 'SELLER' } } },
                    ];
                } else if (role === 'BUYER_ONLY') {
                    // This finds users who have BUYER role and NOT SELLER role
                    // But simplified request says particular role. 
                    // Let's stick to simple "has this role" or "has both".
                    where.roles = { some: { role: 'BUYER' } };
                } else if (role === 'SELLER_ONLY') {
                    where.roles = { some: { role: 'SELLER' } };
                } else {
                    where.roles = { some: { role } };
                }
            }

            if (isBanned !== undefined && isBanned !== null) {
                where.isBanned = isBanned;
            }

            let orderBy: any = { createdAt: 'desc' };
            if (sortBy === 'RECENTLY_CREATED') {
                orderBy = { createdAt: 'desc' };
            } else if (sortBy === 'OLDEST_CREATED') {
                orderBy = { createdAt: 'asc' };
            }

            const [users, totalCount] = await Promise.all([
                prismaMain.user.findMany({
                    where,
                    take,
                    skip,
                    orderBy,
                    include: {
                        sellerProfile: true,
                        roles: true,
                        products: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            select: { createdAt: true }
                        }
                    }
                }),
                prismaMain.user.count({ where })
            ]);
            // const totalCount = 0;

            const items = users.map((u: any) => ({
                ...u,
                role: u.roles?.[0]?.role || 'BUYER',
                roles: u.roles?.map((r: any) => r.role) || [],
                isSeller: !!u.sellerProfile,
                lastProductAdded: u.products?.[0]?.createdAt?.toISOString() || null,
                createdAt: u.createdAt.toISOString()
            }));

            if (sortBy === 'LAST_PRODUCT_ADDED') {
                items.sort((a, b) => {
                    const dateA = a.lastProductAdded ? new Date(a.lastProductAdded).getTime() : 0;
                    const dateB = b.lastProductAdded ? new Date(b.lastProductAdded).getTime() : 0;
                    return dateB - dateA;
                });
            }

            return {
                items,
                totalCount
            };
        },
        sellers: async (_: any, { take = 10, skip = 0 }) => {
            return await prismaMain.sellerProfile.findMany({
                take,
                skip,
                orderBy: { createdAt: 'desc' }
            });
        },
        products: async (_: any, { take = 10, skip = 0, search }: any) => {
            const where: any = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { category: { name: { contains: search, mode: 'insensitive' } } },
                    { seller: { name: { contains: search, mode: 'insensitive' } } },
                    { seller: { sellerProfile: { shopName: { contains: search, mode: 'insensitive' } } } },
                    { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } }
                ];
            }

            const [products, totalCount] = await Promise.all([
                prismaMain.product.findMany({
                    where,
                    take,
                    skip,
                    include: {
                        variants: true,
                        category: true,
                        seller: { select: { name: true, sellerProfile: { select: { shopName: true } } } }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prismaMain.product.count({ where })
            ]);

            const items = products.map((p: any) => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                description: p.description,
                price: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
                stock: p.variants?.[0]?.stock || 0,
                status: p.status,
                category: p.category?.name || 'Uncategorized',
                sellerName: p.seller?.sellerProfile?.shopName || p.seller?.name || 'Unknown Seller',
                specificationTable: JSON.stringify(p.specificationTable),
                specificationDisplayFormat: p.specificationDisplayFormat,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
                pros: p.pros,
                cons: p.cons,
                affiliateLink: p.affiliateLink,
            }));

            return {
                items,
                totalCount
            };
        },
        product: async (_: any, { id }: { id: string }) => {
            const p = await prismaMain.product.findUnique({
                where: { id },
                include: {
                    variants: {
                        include: {
                            specifications: true
                        }
                    },
                    images: true,
                    category: true,
                    deliveryOptions: true,
                    warranty: true,
                    returnPolicy: true,
                    seller: { select: { name: true, sellerProfile: { select: { shopName: true } } } }
                }
            });

            if (!p) {
                console.log("DEBUG: product not found for ID:", id);
                return null;
            }

            console.log("DEBUG: mapping product:", p.id, "seller exists:", !!p.seller);
            return {
                id: p.id,
                name: p.name,
                brand: p.brand,
                description: p.description,
                price: p.variants?.[0]?.price ? Number(p.variants[0].price) : 0,
                stock: p.variants?.[0]?.stock || 0,
                status: p.status,
                category: p.category?.name || 'Uncategorized',
                sellerName: p.seller?.sellerProfile?.shopName || p.seller?.name || 'Unknown Seller',
                specificationTable: JSON.stringify(p.specificationTable),
                specificationDisplayFormat: p.specificationDisplayFormat,
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
                pros: p.pros,
                cons: p.cons,
                affiliateLink: p.affiliateLink,
                images: p.images.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText,
                    sortOrder: img.sortOrder,
                    mediaType: img.mediaType,
                    fileType: img.fileType
                })),
                variants: p.variants.map((v: any) => ({
                    id: v.id,
                    sku: v.sku,
                    price: Number(v.price),
                    mrp: Number(v.mrp),
                    stock: v.stock,
                    soldCount: v.soldCount,
                    attributes: JSON.stringify(v.attributes),
                    specificationTable: JSON.stringify(v.specificationTable),
                    specifications: v.specifications?.map((s: any) => ({
                        id: s.id,
                        key: s.key,
                        value: s.value
                    })),
                    isDefault: v.isDefault,
                    createdAt: v.createdAt.toISOString()
                })),
                deliveryOptions: p.deliveryOptions?.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    description: d.description,
                    isDefault: d.isDefault
                })),
                warranty: p.warranty?.map((w: any) => ({
                    id: w.id,
                    type: w.type,
                    duration: w.duration,
                    unit: w.unit,
                    description: w.description
                })),
                returnPolicy: p.returnPolicy?.map((rp: any) => ({
                    id: rp.id,
                    type: rp.type,
                    duration: rp.duration,
                    unit: rp.unit,
                    conditions: rp.conditions
                }))
            };
        },
        productWithOrders: async (_: any, { productId }: { productId: string }) => {
            const product = await prismaMain.product.findUnique({
                where: { id: productId },
                include: {
                    variants: {
                        include: {
                            orderItems: {
                                include: {
                                    order: {
                                        include: {
                                            buyer: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    category: true,
                    images: true,
                }
            });

            if (!product) return null;

            const allOrderItems = product.variants.flatMap((v: any) => v.orderItems || []);

            return {
                id: product.id,
                name: product.name,
                price: product.variants?.[0]?.price ? Number(product.variants[0].price) : 0,
                stock: product.variants?.[0]?.stock || 0,
                status: product.status,
                category: (product as any).category?.name || 'Uncategorized',
                images: (product as any).images?.map((img: any) => img.url) || [],
                metadata: JSON.stringify(product.specificationTable || {}),
                orders: allOrderItems.map((oi: any) => ({
                    id: oi.id,
                    orderNumber: oi.order.orderNumber,
                    buyerName: oi.order.buyer.name,
                    quantity: oi.quantity,
                    totalPrice: Number(oi.totalPrice),
                    createdAt: oi.order.createdAt.toISOString()
                }))
            };
        },
        sellerProducts: async (_: any, { sellerId, take = 10, skip = 0 }: { sellerId: string, take?: number, skip?: number }) => {
            const products = await prismaMain.product.findMany({
                where: { sellerId },
                take,
                skip,
                include: {
                    variants: true,
                    category: true,
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
                createdAt: p.createdAt.toISOString()
            }));
        },
        sellerFullDetails: async (_: any, { userId }: { userId: string }) => {
            const profile = await prismaMain.sellerProfile.findUnique({
                where: { userId }
            });

            const orders = await prismaMain.sellerOrder.findMany({
                where: { sellerId: userId },
                include: {
                    order: {
                        include: {
                            buyer: { select: { name: true } }
                        }
                    },
                    items: {
                        include: {
                            variant: {
                                include: { product: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const payouts = await prismaMain.payout.findMany({
                where: { sellerId: userId },
                orderBy: { createdAt: 'desc' }
            });

            if (!profile) return null;

            return {
                profile: {
                    ...profile,
                    averageRating: Number(profile.averageRating),
                    createdAt: profile.createdAt.toISOString()
                },
                orders: orders.map(o => ({
                    id: o.id,
                    orderNumber: o.order.orderNumber,
                    status: o.status,
                    total: Number(o.total),
                    subtotal: Number(o.subtotal),
                    tax: Number(o.tax),
                    shippingFee: Number(o.shippingFee),
                    commission: Number(o.commission),
                    createdAt: o.createdAt.toISOString(),
                    buyerName: o.order.buyer.name,
                    items: o.items.map(oi => ({
                        id: oi.id,
                        productName: oi.variant.product.name,
                        variantName: oi.variant.sku,
                        quantity: oi.quantity,
                        unitPrice: Number(oi.unitPrice),
                        totalPrice: Number(oi.totalPrice)
                    }))
                })),
                payouts: payouts.map(p => ({
                    id: p.id,
                    amount: Number(p.amount),
                    currency: p.currency,
                    status: p.status,
                    scheduledFor: p.scheduledFor.toISOString(),
                    processedAt: p.processedAt?.toISOString(),
                    createdAt: p.createdAt.toISOString()
                }))
            };
        },
        buyerDetails: async (_: any, { userId }: { userId: string }) => {
            const user = await prismaMain.user.findUnique({
                where: { id: userId },
                include: {
                    addresses: true,
                    cartItems: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        include: { images: { take: 1 } }
                                    }
                                }
                            }
                        }
                    },
                    wishlists: {
                        include: {
                            items: {
                                include: {
                                    product: {
                                        include: {
                                            images: { take: 1 },
                                            variants: { take: 1 }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    orders: {
                        include: {
                            _count: { select: { items: true } }
                        },
                        orderBy: { createdAt: 'desc' }
                    },
                    disputes: {
                        where: { type: 'CANCEL' },
                        include: {
                            order: true
                        }
                    }
                }
            });

            if (!user) return null;

            return {
                profile: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    phone: user.phone,
                    avatarImageUrl: user.avatarImageUrl,
                    addresses: user.addresses.map(a => ({
                        id: a.id,
                        type: a.type,
                        line1: a.line1,
                        line2: a.line2,
                        city: a.city,
                        state: a.state,
                        country: a.country,
                        postalCode: a.postalCode,
                        isDefault: a.isDefault
                    })),
                    createdAt: user.createdAt.toISOString()
                },
                cartItems: user.cartItems.map(item => ({
                    id: item.id,
                    productId: item.variant.productId,
                    productName: item.variant.product.name,
                    productImage: (item.variant.product as any).images?.[0]?.url,
                    variantName: item.variant.sku, // simplified
                    price: Number(item.variant.price),
                    quantity: item.quantity
                })),
                wishlistItems: user.wishlists.flatMap(w => w.items).map(item => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    productImage: (item.product as any).images?.[0]?.url,
                    price: Number(item.product.variants?.[0]?.price || 0)
                })),
                orders: user.orders.map(o => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    status: o.status,
                    total: Number(o.total),
                    itemCount: (o as any)._count.items,
                    createdAt: o.createdAt.toISOString()
                })),
                cancelledOrders: user.disputes.map(d => ({
                    id: d.id,
                    orderNumber: d.order.orderNumber,
                    productName: "Multiple Products", // Disputes are often order-level or item-level
                    reason: d.reason,
                    description: d.description,
                    createdAt: d.createdAt.toISOString()
                }))
            };
        },
        userDetails: async (_: any, { userId }: { userId: string }) => {
            // Seller metrics
            const sellerStats = await prismaMain.sellerProfile.findUnique({
                where: { userId },
                select: { totalSales: true }
            });

            const revenue = await prismaMain.sellerOrder.aggregate({
                where: { sellerId: userId, status: 'DELIVERED' },
                _sum: { total: true }
            });

            // Products in users cart
            const products = await prismaMain.product.findMany({
                where: { sellerId: userId },
                select: { id: true }
            });
            const productIds = products.map(p => p.id);
            const variantIds = (await prismaMain.productVariant.findMany({
                where: { productId: { in: productIds } },
                select: { id: true }
            })).map(v => v.id);

            const inCartCount = await prismaMain.cartItem.count({
                where: { variantId: { in: variantIds } }
            });

            const inWishlistCount = await prismaMain.wishlistItem.count({
                where: { productId: { in: productIds } }
            });

            const returnedCount = await prismaMain.sellerOrder.count({
                where: { sellerId: userId, status: 'RETURNED' }
            });

            return {
                sales: sellerStats?.totalSales || 0,
                revenue: revenue._sum.total ? Number(revenue._sum.total) : 0,
                inCartCount,
                inWishlistCount,
                returnedCount
            };
        },
        categories: async (_: any, { search }: { search?: string }) => {
            try {
                const where = search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' as any } },
                        { slug: { contains: search, mode: 'insensitive' as any } }
                    ]
                } : {};

                const categories = await prismaMain.category.findMany({
                    where,
                    orderBy: { name: 'asc' },
                    include: { parent: true }
                });
                return categories.map((c: any) => ({
                    ...c,
                    parentName: c.parent?.name,
                }));
            } catch (error) {
                console.error("Categories Query Error:", error);
                throw new Error("Failed to fetch categories");
            }
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
        },
        // Landing Page Content Management Queries
        getLandingPageCategoryCards: async () => {
            const cards = await prismaMain.landingPageCategoryCard.findMany({
                where: { isActive: true },
                include: { category: { select: { name: true, _count: { select: { products: true } } } } },
                orderBy: { sortOrder: 'asc' }
            });

            return cards.map((card: any) => ({
                ...card,
                categoryName: card.category?.name || 'Unknown',
                count: `${card.category?._count?.products || 0}+ items`,
                createdAt: card.createdAt.toISOString(),
                updatedAt: card.updatedAt.toISOString()
            }));
        },



        getLandingPageCategorySwipers: async () => {
            const swipers = await prismaMain.landingPageCategorySwiper.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            return swipers.map((s) => ({
                ...s,
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString()
            }));
        },
        getLandingPageProductGrids: async () => {
            const grids = await prismaMain.landingPageProductGrid.findMany({
                where: { isActive: true },
                orderBy: { sortOrder: 'asc' }
            });
            return grids.map((g) => ({
                ...g,
                createdAt: g.createdAt.toISOString(),
                updatedAt: g.updatedAt.toISOString()
            }));
        },
        getLandingPageBanners: async () => {
            const banners = await prismaMain.landingPageBanner.findMany({
                orderBy: { sortOrder: 'asc' }
            });
            return banners.map((b: any) => ({
                ...b,
                createdAt: b.createdAt.toISOString(),
                updatedAt: b.updatedAt.toISOString()
            }));
        }
    },
    Mutation: {
        loginAdmin: async (_: any, { email }: { email: String }) => {
            return "mock_token";
        },
        banUser: async (_: any, { userId }: { userId: string }) => {
            const user = await prismaMain.user.update({
                where: { id: userId },
                data: { isBanned: true }
            });
            return {
                ...user,
                createdAt: user.createdAt.toISOString()
            };
        },
        unbanUser: async (_: any, { userId }: { userId: string }) => {
            const user = await prismaMain.user.update({
                where: { id: userId },
                data: { isBanned: false }
            });
            return {
                ...user,
                createdAt: user.createdAt.toISOString()
            };
        },
        bulkBanUsers: async (_: any, { userIds }: { userIds: string[] }) => {
            await prismaMain.user.updateMany({
                where: { id: { in: userIds } },
                data: { isBanned: true }
            });
            const users = await prismaMain.user.findMany({
                where: { id: { in: userIds } }
            });
            return users.map((u) => ({
                ...u,
                createdAt: u.createdAt.toISOString()
            }));
        },
        bulkUnbanUsers: async (_: any, { userIds }: { userIds: string[] }) => {
            await prismaMain.user.updateMany({
                where: { id: { in: userIds } },
                data: { isBanned: false }
            });
            const users = await prismaMain.user.findMany({
                where: { id: { in: userIds } }
            });
            return users.map((u) => ({
                ...u,
                createdAt: u.createdAt.toISOString()
            }));
        },
        deleteUser: async (_: any, { userId }: { userId: string }) => {
            // Soft delete - ban the user
            const user = await prismaMain.user.update({
                where: { id: userId },
                data: { isBanned: true }
            });
            return true;
        },
        hardDeleteUser: async (_: any, { userId }: { userId: string }) => {
            try {
                // First check if user exists
                const user = await prismaMain.user.findUnique({
                    where: { id: userId },
                    include: {
                        sellerProfile: true,
                        products: { select: { id: true } },
                        orders: { select: { id: true } }
                    }
                });

                if (!user) {
                    throw new Error("User not found");
                }

                console.log(`Attempting to delete user ${userId}:`, {
                    hasSellerProfile: !!user.sellerProfile,
                    productCount: user.products.length,
                    orderCount: user.orders.length
                });

                await prismaMain.$transaction(async (tx) => {
                    // Delete user - Prisma cascade deletes will handle related records
                    await tx.user.delete({
                        where: { id: userId }
                    });
                }, {
                    maxWait: 10000,
                    timeout: 30000
                });

                // Clear any Redis cache entries for the user
                try {
                    const keysToDelete = [
                        `user:${userId}`,
                        `user:details:${userId}`,
                        `products:all` // Invalidate product cache if user was a seller
                    ];
                    await redis.del(...keysToDelete);
                } catch (error) {
                    console.error("Failed to invalidate user cache:", error);
                }

                console.log(`Successfully deleted user ${userId}`);
                return true;
            } catch (error: any) {
                console.error("Hard delete user error:", error);
                console.error("Error details:", {
                    message: error.message,
                    code: error.code,
                    meta: error.meta
                });

                // Provide more specific error message
                if (error.code === 'P2003') {
                    throw new Error(`Cannot delete user: Foreign key constraint failed. User has related data that cannot be deleted.`);
                } else if (error.code === 'P2025') {
                    throw new Error("User not found");
                } else {
                    throw new Error(`Failed to delete user: ${error.message}`);
                }
            }
        },
        bulkDeleteUsers: async (_: any, { userIds, force }: { userIds: string[], force?: boolean }) => {
            try {
                if (force) {
                    // Hard delete - permanently remove users
                    await prismaMain.$transaction(async (tx) => {
                        await tx.user.deleteMany({
                            where: { id: { in: userIds } }
                        });
                    });

                    // Clear cache
                    try {
                        const keysToDelete = userIds.flatMap(id => [
                            `user:${id}`,
                            `user:details:${id}`
                        ]);
                        keysToDelete.push('products:all');
                        await redis.del(...keysToDelete);
                    } catch (error) {
                        console.error("Failed to invalidate cache:", error);
                    }

                    return {
                        success: true,
                        deletedCount: userIds.length,
                        message: `Successfully deleted ${userIds.length} user(s) permanently`
                    };
                } else {
                    // Soft delete - ban users
                    await prismaMain.user.updateMany({
                        where: { id: { in: userIds } },
                        data: { isBanned: true }
                    });

                    return {
                        success: true,
                        deletedCount: userIds.length,
                        message: `Successfully banned ${userIds.length} user(s)`
                    };
                }
            } catch (error) {
                console.error("Bulk delete users error:", error);
                return {
                    success: false,
                    deletedCount: 0,
                    message: "Failed to delete users"
                };
            }
        },

        updateProduct: async (_: any, { id, input }: { id: string, input: any }) => {
            const {
                name,
                brand,
                description,
                categoryId,
                status,
                specificationTable,
                specificationDisplayFormat,
                variants,
                images,
                deliveryOptions,
                warranty,
                returnPolicy
            } = input;

            const updatedProduct = await prismaMain.$transaction(async (tx) => {
                const safeParse = (str: any) => {
                    if (typeof str !== 'string' || !str) return undefined;
                    try { return JSON.parse(str); } catch (e) { return undefined; }
                };

                // Update basic fields
                await tx.product.update({
                    where: { id },
                    data: {
                        ...(name && { name }),
                        ...(brand && { brand }),
                        ...(description && { description }),
                        ...(categoryId && { categoryId }),
                        ...(status && { status: status as any }),
                        ...(specificationTable && { specificationTable: safeParse(specificationTable) }),
                        ...(specificationDisplayFormat && { specificationDisplayFormat }),
                        pros: input.pros || undefined,
                        cons: input.cons || undefined,
                        affiliateLink: input.affiliateLink || undefined,
                    }
                });

                // Update Images
                if (images) {
                    await tx.productImage.deleteMany({ where: { productId: id } });
                    await tx.productImage.createMany({
                        data: images.map((img: any) => ({
                            ...img,
                            productId: id,
                            mediaType: img.mediaType as any,
                            fileType: img.fileType as any
                        }))
                    });
                }

                // Update Delivery Options
                if (deliveryOptions) {
                    await tx.deliveryOption.deleteMany({ where: { productId: id } });
                    await tx.deliveryOption.createMany({
                        data: deliveryOptions.map((opt: any) => ({
                            ...opt,
                            productId: id
                        }))
                    });
                }

                // Update Warranty
                if (warranty) {
                    await tx.warranty.deleteMany({ where: { productId: id } });
                    await tx.warranty.createMany({
                        data: warranty.map((w: any) => ({
                            ...w,
                            productId: id,
                            type: w.type as any
                        }))
                    });
                }

                // Update Return Policy
                if (returnPolicy) {
                    await tx.returnPolicy.deleteMany({ where: { productId: id } });
                    await tx.returnPolicy.createMany({
                        data: returnPolicy.map((rp: any) => ({
                            ...rp,
                            productId: id,
                            type: rp.type as any
                        }))
                    });
                }

                // Update Variants
                if (variants) {
                    for (const v of variants) {
                        const variantData = {
                            sku: v.sku,
                            price: v.price,
                            mrp: v.mrp,
                            stock: v.stock,
                            isDefault: v.isDefault,
                            attributes: safeParse(v.attributes),
                            specificationTable: safeParse(v.specificationTable),
                        };

                        if (v.id) {
                            await tx.productVariant.update({
                                where: { id: v.id },
                                data: variantData
                            });
                        } else {
                            await tx.productVariant.create({
                                data: {
                                    ...variantData,
                                    productId: id
                                }
                            });
                        }
                    }
                }

                return await tx.product.findUnique({
                    where: { id },
                    include: {
                        variants: {
                            include: {
                                specifications: true
                            }
                        },
                        images: true,
                        category: true,
                        deliveryOptions: true,
                        warranty: true,
                        returnPolicy: true,
                        seller: { select: { name: true, sellerProfile: { select: { shopName: true } } } }
                    }
                });
            }, {
                maxWait: 5000,
                timeout: 15000
            });

            if (!updatedProduct) return null;

            // Invalidate Cache
            try {
                const keysToDelete = [
                    `products:all`,
                    (updatedProduct as any).slug ? `product:details:v2:${(updatedProduct as any).slug}` : null
                ].filter(Boolean) as string[];

                if (keysToDelete.length > 0) {
                    // console.log("Invalidating cache for keys:", keysToDelete);
                    await redis.del(...keysToDelete);
                }
            } catch (error) {
                console.error("Failed to invalidate cache:", error);
            }

            return {
                id: updatedProduct.id,
                name: updatedProduct.name,
                brand: updatedProduct.brand,
                description: updatedProduct.description,
                price: updatedProduct.variants?.[0]?.price ? Number(updatedProduct.variants[0].price) : 0,
                stock: updatedProduct.variants?.[0]?.stock || 0,
                status: updatedProduct.status,
                category: updatedProduct.category?.name || 'Uncategorized',
                sellerName: updatedProduct.seller?.sellerProfile?.shopName || updatedProduct.seller?.name || 'Unknown Seller',
                specificationTable: JSON.stringify(updatedProduct.specificationTable),
                specificationDisplayFormat: updatedProduct.specificationDisplayFormat,
                createdAt: updatedProduct.createdAt.toISOString(),
                updatedAt: updatedProduct.updatedAt.toISOString(),
                images: updatedProduct.images.map((img: any) => ({
                    id: img.id,
                    url: img.url,
                    altText: img.altText,
                    sortOrder: img.sortOrder,
                    mediaType: img.mediaType,
                    fileType: img.fileType
                })),
                variants: updatedProduct.variants.map((v: any) => ({
                    id: v.id,
                    sku: v.sku,
                    price: Number(v.price),
                    mrp: Number(v.mrp),
                    stock: v.stock,
                    soldCount: v.soldCount,
                    attributes: JSON.stringify(v.attributes),
                    specificationTable: JSON.stringify(v.specificationTable),
                    specifications: v.specifications?.map((s: any) => ({
                        id: s.id,
                        key: s.key,
                        value: s.value
                    })),
                    isDefault: v.isDefault,
                    createdAt: v.createdAt.toISOString()
                })),
                deliveryOptions: updatedProduct.deliveryOptions?.map((d: any) => ({
                    id: d.id,
                    title: d.title,
                    description: d.description,
                    isDefault: d.isDefault
                })),
                warranty: updatedProduct.warranty?.map((w: any) => ({
                    id: w.id,
                    type: w.type,
                    duration: w.duration,
                    unit: w.unit,
                    description: w.description
                })),
                returnPolicy: updatedProduct.returnPolicy?.map((rp: any) => ({
                    id: rp.id,
                    type: rp.type,
                    duration: rp.duration,
                    unit: rp.unit,
                    conditions: rp.conditions
                }))
            };
        },
        createCategory: async (_: any, { input }: { input: any }) => {
            try {
                const { parentName, __typename, ...cleanInput } = input;
                const category = await prismaMain.category.create({
                    data: {
                        ...cleanInput,
                        parentId: cleanInput.parentId === 'none' ? null : cleanInput.parentId
                    },
                    include: { parent: true }
                });

                try {
                    await redis.del('products:all');
                    await redis.del('categories:all');
                } catch (e) {
                    console.error("Cache invalidation failed (createCategory):", e);
                }

                return {
                    ...category,
                    parentName: category.parent?.name,
                    templateType: (category as any).templateType,
                    priceRanges: (category as any).priceRanges,
                    filters: (category as any).filters,
                    seoTemplates: (category as any).seoTemplates
                };
            } catch (error: any) {
                console.error("Create category error:", error);
                if (error.code === 'P2002') {
                    const target = error.meta?.target;
                    const field = Array.isArray(target) ? target.join(', ') : 'name or slug';
                    const conflictInfo = `Name: "${input.name}", Slug: "${input.slug}"`;
                    const message = `Category conflict: A category with this ${field} already exists. (${conflictInfo})`;
                    console.error(message, error);
                    throw new Error(message);
                }
                throw new Error(error.message || "Failed to create category");
            }
        },
        createCategoryTree: async (_: any, { input }: { input: any[] }) => {
            const createdCategories: any[] = [];
            let currentItemInfo = "";

            try {
                await prismaMain.$transaction(async (tx) => {
                    const createRecursive = async (item: any, parentId: string | null = null) => {
                        const { name, slug, description, isActive, children, parentId: itemParentId } = item;

                        // Sanitize inputs
                        const cleanName = name?.trim();
                        const cleanSlug = slug?.trim() || cleanName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

                        currentItemInfo = `Name: "${cleanName}", Slug: "${cleanSlug}"`;

                        const finalParentId = parentId || (itemParentId === 'none' ? null : itemParentId);

                        const category = await tx.category.create({
                            data: {
                                name: cleanName,
                                slug: cleanSlug,
                                description,
                                isActive: isActive ?? true,
                                parentId: finalParentId,
                            },
                        });
                        createdCategories.push(category);

                        if (children && children.length > 0) {
                            for (const child of children) {
                                await createRecursive(child, category.id);
                            }
                        }
                    };

                    for (const rootItem of input) {
                        await createRecursive(rootItem);
                    }
                }, {
                    maxWait: 5000,
                    timeout: 15000
                });

                // Invalidate Cache
                try {
                    await redis.del('products:all');
                } catch (e) {
                    console.error("Cache invalidation failed (createCategoryTree):", e);
                }

                return createdCategories;
            } catch (error: any) {
                console.error("Bulk create categories error:", error);
                if (error.code === 'P2002') {
                    const target = error.meta?.target;
                    const field = Array.isArray(target) ? target.join(', ') : 'name or slug';
                    const message = `Bulk creation failed: A category with this ${field} already exists in the list or database. Conflict at [${currentItemInfo}]`;
                    console.error(message, error);
                    throw new Error(message);
                }
                throw new Error(error.message || "Failed to create categories");
            }
        },
        updateCategory: async (_: any, { id, input }: { id: string, input: any }) => {
            try {
                const { parentName, __typename, ...cleanInput } = input;
                const category = await prismaMain.category.update({
                    where: { id },
                    data: {
                        ...cleanInput,
                        parentId: cleanInput.parentId === 'none' ? null : cleanInput.parentId
                    },
                    include: { parent: true }
                });

                try {
                    await redis.del('products:all');
                    await redis.del('categories:all');
                    // Also clear specific category caches
                    await redis.del(`category:${id}`);
                    await redis.del(`category:slug:${cleanInput.slug}`);
                } catch (e) {
                    console.error("Cache invalidation failed (updateCategory):", e);
                }

                return {
                    ...category,
                    parentName: category.parent?.name,
                    templateType: (category as any).templateType,
                    priceRanges: (category as any).priceRanges,
                    filters: (category as any).filters,
                    seoTemplates: (category as any).seoTemplates
                };
            } catch (error: any) {
                console.error("Update category error:", error);
                if (error.code === 'P2002') {
                    const target = error.meta?.target;
                    const field = Array.isArray(target) ? target.join(', ') : 'name or slug';
                    const conflictInfo = `Name: "${input.name}", Slug: "${input.slug}"`;
                    const message = `Update failed: A category with this ${field} already exists. (${conflictInfo})`;
                    console.error(message, error);
                    throw new Error(message);
                }
                throw new Error(error.message || "Failed to update category");
            }
        },
        deleteCategory: async (_: any, { id, force }: { id: string, force?: boolean }) => {
            try {
                const category = await prismaMain.category.findUnique({
                    where: { id },
                    include: { children: true }
                });

                if (!category) {
                    throw new Error("Category not found");
                }

                if (category.children.length > 0 && !force) {
                    throw new Error("This category has subcategories. Please move or delete them before removing this category, or use force delete.");
                }

                // Helper to get all descendant IDs
                const getCategoryTreeIds = async (catId: string): Promise<string[]> => {
                    const ids = [catId];
                    const subcats = await prismaMain.category.findMany({
                        where: { parentId: catId },
                        select: { id: true }
                    });
                    for (const sub of subcats) {
                        const subIds = await getCategoryTreeIds(sub.id);
                        ids.push(...subIds);
                    }
                    return ids;
                };

                const allIdsToDelete = force ? await getCategoryTreeIds(id) : [id];

                await prismaMain.$transaction(async (tx) => {
                    // 1. Decouple products from categories being deleted
                    await tx.product.updateMany({
                        where: { categoryId: { in: allIdsToDelete } },
                        data: { categoryId: null }
                    });

                    // 2. Clear landing page category cards (manual cleanup to be safe, though onDelete: Cascade is set)
                    await tx.landingPageCategoryCard.deleteMany({
                        where: { categoryId: { in: allIdsToDelete } }
                    });

                    // 3. Delete categories in reverse order (bottom-up) to avoid constraint issues
                    for (let i = allIdsToDelete.length - 1; i >= 0; i--) {
                        await tx.category.delete({
                            where: { id: allIdsToDelete[i] }
                        });
                    }
                }, {
                    maxWait: 5000,
                    timeout: 15000
                });

                // Invalidate Cache
                try {
                    await redis.del('products:all');
                    await redis.del('categories:all');
                } catch (e) {
                    console.error("Cache invalidation failed (deleteCategory):", e);
                }

                return true;
            } catch (error: any) {
                console.error("Delete category error:", error);
                throw new Error(error.message || "Failed to delete category");
            }
        },
        // Landing Page Content Management Mutations
        createCategoryCard: async (_: any, { input }: { input: any }) => {
            const card = await prismaMain.landingPageCategoryCard.create({
                data: input,
                include: { category: { select: { name: true, _count: { select: { products: true } } } } }
            });

            // Invalidate Cache
            try {
                await redis.del('products:all');
            } catch (e) {
                console.error("Cache invalidation failed (createCategoryCard):", e);
            }

            return {
                ...card,
                categoryName: card.category?.name || 'Unknown',
                count: `${card.category?._count?.products || 0}+ items`,
                createdAt: card.createdAt.toISOString(),
                updatedAt: card.updatedAt.toISOString()
            };
        },
        updateCategoryCard: async (_: any, { id, input }: { id: string, input: any }) => {
            const card = await prismaMain.landingPageCategoryCard.update({
                where: { id },
                data: input,
                include: { category: { select: { name: true, _count: { select: { products: true } } } } }
            });

            // Invalidate Cache
            try {
                await redis.del('products:all');
            } catch (e) {
                console.error("Cache invalidation failed (updateCategoryCard):", e);
            }

            return {
                ...card,
                categoryName: card.category?.name || 'Unknown',
                count: `${card.category?._count?.products || 0}+ items`,
                createdAt: card.createdAt.toISOString(),
                updatedAt: card.updatedAt.toISOString()
            };
        },
        deleteCategoryCard: async (_: any, { id }: { id: string }) => {
            await prismaMain.landingPageCategoryCard.delete({ where: { id } });

            // Invalidate Cache
            try {
                await redis.del('products:all');
            } catch (e) {
                console.error("Cache invalidation failed (deleteCategoryCard):", e);
            }

            return true;
        },
        createCategorySwiper: async (_: any, { input }: { input: any }) => {
            const swiper = await prismaMain.landingPageCategorySwiper.create({
                data: input
            });
            return {
                ...swiper,
                createdAt: swiper.createdAt.toISOString(),
                updatedAt: swiper.updatedAt.toISOString()
            };
        },
        updateCategorySwiper: async (_: any, { id, input }: { id: string, input: any }) => {
            const swiper = await prismaMain.landingPageCategorySwiper.update({
                where: { id },
                data: input
            });
            return {
                ...swiper,
                createdAt: swiper.createdAt.toISOString(),
                updatedAt: swiper.updatedAt.toISOString()
            };
        },
        deleteCategorySwiper: async (_: any, { id }: { id: string }) => {
            await prismaMain.landingPageCategorySwiper.delete({ where: { id } });
            return true;
        },
        createLandingPageBanner: async (_: any, { input }: { input: any }) => {
            try {
                const banner = await prismaMain.landingPageBanner.create({
                    data: input
                });
                // Invalidate Cache
                try {
                    await redis.del('products:all');
                } catch (e) {
                    console.error("Cache invalidation failed (updateLandingPageBanner):", e);
                }

                return {
                    success: true,
                    message: "Banner created successfully",
                    banner: {
                        ...banner,
                        createdAt: banner.createdAt.toISOString(),
                        updatedAt: banner.updatedAt.toISOString()
                    }
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || "Failed to create banner"
                };
            }
        },
        updateLandingPageBanner: async (_: any, { id, input }: { id: string, input: any }) => {
            try {
                const banner = await prismaMain.landingPageBanner.update({
                    where: { id },
                    data: input
                });
                return {
                    success: true,
                    message: "Banner updated successfully",
                    banner: {
                        ...banner,
                        createdAt: banner.createdAt.toISOString(),
                        updatedAt: banner.updatedAt.toISOString()
                    }
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || "Failed to update banner"
                };
            }
        },
        deleteLandingPageBanner: async (_: any, { id }: { id: string }) => {
            try {
                await prismaMain.landingPageBanner.delete({ where: { id } });
                return {
                    success: true,
                    message: "Banner deleted successfully"
                };
            } catch (error: any) {
                return {
                    success: false,
                    message: error.message || "Failed to delete banner"
                };
            }
        },
        reorderLandingPageBanners: async (_: any, { ids }: { ids: string[] }) => {
            try {
                await prismaMain.$transaction(async (tx) => {
                    for (let i = 0; i < ids.length; i++) {
                        await tx.landingPageBanner.update({
                            where: { id: ids[i] },
                            data: { sortOrder: i }
                        });
                    }
                }, {
                    maxWait: 5000,
                    timeout: 15000
                });
                return {
                    success: true,
                    message: "Banners reordered successfully"
                };
            } catch (error: any) {
                // Invalidate Cache
                try {
                    await redis.del('products:all');
                } catch (e) {
                    console.error("Cache invalidation failed (updateProductGrid):", e);
                }

                return {
                    success: false,
                    message: error.message || "Failed to reorder banners"
                };
            }
        },
        createProductGrid: async (_: any, { input }: { input: any }) => {
            const grid = await prismaMain.landingPageProductGrid.create({
                data: input
            });
            return {
                ...grid,
                createdAt: grid.createdAt.toISOString(),
                updatedAt: grid.updatedAt.toISOString()
            };
        },
        updateProductGrid: async (_: any, { id, input }: { id: string, input: any }) => {
            const grid = await prismaMain.landingPageProductGrid.update({
                where: { id },
                data: input
            });
            return {
                ...grid,
                createdAt: grid.createdAt.toISOString(),
                updatedAt: grid.updatedAt.toISOString()
            };
        },
        deleteProductGrid: async (_: any, { id }: { id: string }) => {
            await prismaMain.landingPageProductGrid.delete({ where: { id } });
            return true;
        },
        bulkUpdateCategories: async (_: any, { input }: { input: any[] }) => {
            const updatedCategories: any[] = [];
            try {
                await prismaMain.$transaction(async (tx) => {
                    for (const item of input) {
                        const { id, parentName, __typename, ...data } = item;

                        // Sanitize parentId
                        if (data.parentId === 'none') data.parentId = null;

                        const updated = await tx.category.update({
                            where: { id },
                            data,
                            include: { parent: true }
                        });

                        updatedCategories.push({
                            ...updated,
                            parentName: updated.parent?.name,
                            templateType: updated.templateType,
                            priceRanges: updated.priceRanges,
                            filters: updated.filters,
                            seoTemplates: updated.seoTemplates
                        });
                    }
                }, {
                    maxWait: 5000,
                    timeout: 15000
                });

                // Invalidate Cache
                try {
                    await redis.del('products:all');
                    await redis.del('categories:all');
                } catch (e) {
                    console.error("Cache invalidation failed (bulk operations):", e);
                }

                return updatedCategories;
            } catch (error: any) {
                console.error("Bulk update categories error:", error);
                if (error.code === 'P2002') {
                    const target = error.meta?.target;
                    const field = Array.isArray(target) ? target.join(', ') : 'name or slug';
                    throw new Error(`Bulk update failed: A category with this ${field} already exists (likely name or slug duplicate).`);
                }
                throw new Error(error.message || "Failed to bulk update categories");
            }
        },
        bulkCreateProducts: async (_: any, { input }: { input: any[] }) => {
            try {
                // Find a default seller if needed
                const defaultSeller = await prismaMain.user.findFirst({
                    where: { roles: { some: { role: 'SELLER' } } },
                    select: { id: true }
                });

                const createdProducts = await prismaMain.$transaction(async (tx) => {
                    const results = [];
                    for (const item of input) {
                        let categoryId = item.categoryId;

                        // If categoryId is missing but categoryName is provided, try to find it
                        if (!categoryId && item.categoryName) {
                            const cat = await tx.category.findFirst({
                                where: { name: { equals: item.categoryName, mode: 'insensitive' } }
                            });
                            if (cat) categoryId = cat.id;
                        }

                        const sellerId = item.sellerId || defaultSeller?.id;
                        if (!sellerId) {
                            throw new Error("No seller found to assign products to. Please provide a sellerId or ensure at least one seller exists.");
                        }

                        // Create the product
                        const product = await tx.product.create({
                            data: {
                                name: item.name,
                                slug: item.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.random().toString(36).substring(2, 7),
                                description: item.description,
                                brand: item.brand || "Generic",
                                categoryId: categoryId,
                                sellerId: sellerId,
                                status: (item.status || "DRAFT") as any,
                                pros: item.pros || [],
                                cons: item.cons || [],
                                affiliateLink: item.affiliateLink,
                                variants: {
                                    create: {
                                        sku: item.sku,
                                        price: item.price,
                                        mrp: item.mrp || item.price,
                                        stock: item.stock,
                                        isDefault: true,
                                        attributes: {},
                                    }
                                }
                            },
                            include: {
                                variants: true,
                                category: true
                            }
                        });
                        results.push(product);
                    }
                    return results;
                }, {
                    maxWait: 5000,
                    timeout: 30000
                });

                // Invalidate Cache
                try {
                    await redis.del('products:all');
                } catch (e) {
                    console.error("Cache invalidation failed (bulkCreateProducts):", e);
                }

                return createdProducts;
            } catch (error: any) {
                console.error("Bulk create products error:", error);
                throw new Error(error.message || "Failed to bulk create products");
            }
        },
        bulkDeleteCategories: async (_: any, { ids, force }: { ids: string[], force?: boolean }) => {
            try {
                const getCategoryTreeIds = async (catId: string): Promise<string[]> => {
                    const idsList = [catId];
                    const subcats = await prismaMain.category.findMany({
                        where: { parentId: catId },
                        select: { id: true }
                    });
                    for (const sub of subcats) {
                        const subIds = await getCategoryTreeIds(sub.id);
                        idsList.push(...subIds);
                    }
                    return idsList;
                };

                let allIdsToDelete: string[] = [];
                if (force) {
                    for (const id of ids) {
                        const treeIds = await getCategoryTreeIds(id);
                        allIdsToDelete.push(...treeIds);
                    }
                    allIdsToDelete = Array.from(new Set(allIdsToDelete));
                } else {
                    const categoriesWithChildren = await prismaMain.category.findMany({
                        where: { id: { in: ids } },
                        include: { children: true }
                    });
                    for (const cat of categoriesWithChildren) {
                        if (cat.children.length > 0) {
                            throw new Error(`Category "${cat.name}" has subcategories. Please move or delete them, or use force delete.`);
                        }
                    }
                    allIdsToDelete = ids;
                }

                await prismaMain.$transaction(async (tx) => {
                    await tx.product.updateMany({
                        where: { categoryId: { in: allIdsToDelete } },
                        data: { categoryId: null }
                    });

                    await tx.landingPageCategoryCard.deleteMany({
                        where: { categoryId: { in: allIdsToDelete } }
                    });

                    for (let i = allIdsToDelete.length - 1; i >= 0; i--) {
                        try {
                            await tx.category.delete({
                                where: { id: allIdsToDelete[i] }
                            });
                        } catch (e: any) {
                            if (e.code !== 'P2025') throw e;
                        }
                    }
                }, {
                    maxWait: 5000,
                    timeout: 15000
                });

                try {
                    await redis.del('products:all');
                    await redis.del('categories:all');
                } catch (e) {
                    console.error("Cache invalidation failed (bulkDeleteCategories):", e);
                }

                return true;
            } catch (error: any) {
                console.error("Bulk delete categories error:", error);
                throw new Error(error.message || "Failed to bulk delete categories");
            }
        },
        generateSeoPages: async (_: any, { categoryIds }: { categoryIds?: string[] }) => {
            try {
                const where = categoryIds ? { id: { in: categoryIds } } : { isActive: true };
                const categories = await prismaMain.category.findMany({
                    where,
                    include: { seoPages: true }
                });

                const results = [];
                for (const cat of categories) {
                    if (!cat.priceRanges || cat.priceRanges.length === 0) continue;

                    for (const price of cat.priceRanges) {
                        const urlPath = `/best-${cat.slug}-under-${price}`;

                        // Check if exists
                        let seoPage = await prismaMain.seoPage.findUnique({
                            where: { urlPath }
                        });

                        if (!seoPage) {
                            seoPage = await prismaMain.seoPage.create({
                                data: {
                                    categoryId: cat.id,
                                    priceThreshold: price,
                                    urlPath,
                                    metaTitle: `Best ${cat.name} Under ${price} in Nepal | Updated Feb 2026`,
                                    metaDescription: `Compare and buy the best ${cat.name} priced under Rs. ${price}. Detailed specs, pros, cons, and latest prices.`,
                                    isStale: false
                                },
                                include: { category: true }
                            });
                        }
                        results.push(seoPage);
                    }
                }
                return results;
            } catch (error: any) {
                console.error("Generate SEO pages error:", error);
                throw new Error(error.message || "Failed to generate SEO pages");
            }
        },
        regenerateSeoPage: async (_: any, { id }: { id: string }) => {
            const seoPage = await prismaMain.seoPage.findUnique({
                where: { id },
                include: { category: true }
            });
            if (!seoPage) throw new Error("SEO Page not found");

            return await prismaMain.seoPage.update({
                where: { id },
                data: {
                    lastGeneratedAt: new Date(),
                    isStale: false
                },
                include: { category: true }
            });
        },
        deleteSeoPage: async (_: any, { id }: { id: string }) => {
            await prismaMain.seoPage.delete({ where: { id } });
            return true;
        },
        createSeoPage: async (_: any, { input }: { input: any }) => {
            try {
                return await prismaMain.seoPage.create({
                    data: {
                        ...input,
                        isStale: false
                    },
                    include: { category: true }
                });
            } catch (error: any) {
                console.error("Create SEO page error:", error);
                throw new Error(error.message || "Failed to create SEO page");
            }
        },
    },
    Category: {
        filters: (cat: any) => cat.filters ? (typeof cat.filters === 'string' ? cat.filters : JSON.stringify(cat.filters, null, 2)) : null,
        seoTemplates: (cat: any) => cat.seoTemplates ? (typeof cat.seoTemplates === 'string' ? cat.seoTemplates : JSON.stringify(cat.seoTemplates, null, 2)) : null,
    },
    SeoPage: {
        structuredData: (page: any) => page.structuredData ? (typeof page.structuredData === 'string' ? page.structuredData : JSON.stringify(page.structuredData, null, 2)) : null,
        lastGeneratedAt: (page: any) => page.lastGeneratedAt?.toISOString() || null,
        createdAt: (page: any) => page.createdAt.toISOString(),
        updatedAt: (page: any) => page.updatedAt.toISOString(),
    }
};
