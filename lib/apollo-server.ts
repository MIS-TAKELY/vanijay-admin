import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Server-side Apollo Client for use in Server Components
export function getServerClient() {
    let uri = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    if (!uri.endsWith('/api/graphql')) {
        uri = `${uri.replace(/\/$/, '')}/api/graphql`;
    }

    return new ApolloClient({
        link: new HttpLink({
            uri,
            fetch,
        }),
        cache: new InMemoryCache(),
    });
}
