import React from 'react'
import withApollo from 'next-with-apollo'
import { InMemoryCache, ApolloProvider, ApolloClient, createHttpLink, gql } from '@apollo/client'

export default withApollo(
  ({ initialState, headers }) => {
    const cache = new InMemoryCache({}).restore(initialState || {})

    // const defaultQuery = gql`
    // {
    //   results {
    //     hits {
    //       items {
    //         ... on RegistryEntry {
    //           id
    //           fields {
    //             preferredPrefix
    //             title
    //             type
    //             keywords
    //           }
    //         }
    //       }
    //     }
    //   }
    // }
    // `

    // @ts-ignore
    if (typeof window !== 'undefined') window.cache = cache

    return new ApolloClient({
      ssrMode: true,
      link: createHttpLink({
        uri: '/api/graphql',
        // uri: 'http://localhost:3000/api/graphql',
        credentials: 'same-origin',
        headers: {
          cookie: headers?.cookie
        }
      }),
      cache,
      // defaultOptions: {query: defaultQuery}
    })
  },
  {
    render: ({ Page, props }) => (
      <ApolloProvider client={props.apollo}>
        <Page {...props} />
      </ApolloProvider>
    )
  }
)
