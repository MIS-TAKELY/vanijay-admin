'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';

const client = new ApolloClient({
    link: new HttpLink({ uri: '/api/graphql' }),
    cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
