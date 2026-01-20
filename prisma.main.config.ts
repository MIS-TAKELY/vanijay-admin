// prisma.main.config.ts
export default {
    schema: 'prisma/schema.main.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
};
