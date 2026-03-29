// prisma.config.ts
import 'dotenv/config';
export default {
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: process.env.ADMIN_DATABASE_URL,
    },
};
