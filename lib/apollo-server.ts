import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

// Server-side Apollo Client for use in Server Components
export function getServerClient() {
    return new ApolloClient({
        link: new HttpLink({
            uri: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/graphql',
            fetch,
        }),
        cache: new InMemoryCache(),
    });
}
