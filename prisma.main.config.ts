// prisma.main.config.ts
import 'dotenv/config';
export default {
    schema: 'prisma/schema.main.prisma',
    migrations: {
        path: 'prisma/migrations-main',
    },
    datasource: {
        url: process.env.DATABASE_URL,
    },
};
