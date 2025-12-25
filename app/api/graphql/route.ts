import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from '../../../graphql/schema';
import { resolvers } from '../../../graphql/resolvers';

const { handleRequest } = createYoga({
    schema: createSchema({
        typeDefs,
        resolvers,
    }),
    graphqlEndpoint: '/api/graphql',
    fetchAPI: { Response },
});

const handler = (req: Request, ctx: any) => {
    return handleRequest(req, ctx);
}

export { handler as GET, handler as POST, handler as OPTIONS };
