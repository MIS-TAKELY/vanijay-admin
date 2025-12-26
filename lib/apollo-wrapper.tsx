'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { useMemo } from 'react';

function createApolloClient() {
    const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
            graphQLErrors.forEach(({ message, locations, path }) =>
                console.error(
                    `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
                )
            );
        }
        if (networkError) {
            console.error(`[Network error]: ${networkError}`);
        }
    });

    const httpLink = new HttpLink({
        uri: '/api/graphql',
        credentials: 'same-origin',
        fetchOptions: {
            cache: 'no-store',
        },
    });

    return new ApolloClient({
        link: from([errorLink, httpLink]),
        cache: new InMemoryCache({
            typePolicies: {
                Query: {
                    fields: {
                        products: {
                            keyArgs: false,
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                        users: {
                            keyArgs: false,
                            merge(existing, incoming) {
                                return incoming;
                            },
                        },
                    },
                },
            },
        }),
        defaultOptions: {
            watchQuery: {
                fetchPolicy: 'network-only',
                errorPolicy: 'all',
            },
            query: {
                fetchPolicy: 'network-only',
                errorPolicy: 'all',
            },
        },
    });
}

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
    const client = useMemo(() => createApolloClient(), []);

    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}
