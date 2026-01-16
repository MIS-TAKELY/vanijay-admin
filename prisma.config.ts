// prisma.config.ts
export default {
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env.ADMIN_DATABASE_URL,
    },
};
