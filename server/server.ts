import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-express';
import {
  MultiMatchQuery,
  SearchkitSchema,
  RefinementSelectFacet
} from '@searchkit/schema';
import path from "path";
import * as swaggerUi from 'swagger-ui-express';
import { useSofa, OpenAPI } from 'sofa-api';
import { Client } from '@elastic/elasticsearch'

// Create new types in the GraphQL query: https://www.searchkit.co/docs/customisations/changing-graphql-types
// PrefixCommons API: https://github.com/prefixcommons/prefixcommons-api/blob/master/slim-server/SwaggerServer/index.php

const ELASTIC_URL = process.env.ELASTIC_URL || 'https://elastic.registry.bio2kg.org'

const searchkitConfig = {
  host: ELASTIC_URL,
  index: 'registry',
  hits: {
    fields: ["preferredPrefix" , "altPrefix" , "providerBaseUri" , "alternativeBaseUri" , 
      "miriam" , "identifiersPrefix" , "bioportalOntologyId" , "thedatahub" , "abbreviation" , 
      "title" , "description" , "pubmedId" , "organization" , "type" , "keywords" , 
      "homepage" , "homepageStillAvailable" , "subNamespaceInDataset" , "partOfCollection" , 
      "licenseUrl" , "licenseText" , "rights" , "regex" , "exampleId" , "providerHtmlUrl" , 
      "miriamChecked" , "miriamCuratorNotes" , "miriamCoverage" , "updates", "yearLastAccessible", "waybackUrl", "@type", "@context"],
    highlightedFields: [
      'title',
      {
        field: 'description',
        config: { 
          number_of_fragments: 0,
          pre_tags: ['<b>'], 
          post_tags: ['</b>'] 
        }
      }
    ]
  },
  sortOptions: [
    { id: 'relevance', label: "Relevance", field: [{"_score": "desc"}], defaultOption: true},
  ],
  query: new MultiMatchQuery({
    fields: ['preferredPrefix^5', 'altPrefix^4', 'abbreviation^4', 'title^3', 'organization^2', 
      'description', 'keywords', 'providerBaseUri', 'alternativeBaseURI']
  }),
  // For a CustomQuery check: https://github.com/bio2kg/bio2kg-registry/blob/265c44806ad45b0d202fdd505a7c9cba8f2a8437/website/pages/api/graphql.tsx#L30
  facets: [
    new RefinementSelectFacet({
      field: 'type.keyword',
      identifier: 'type',
      label: 'Type',
      size: 10,
      multipleSelect: true
    }),
    new RefinementSelectFacet({
      field: 'keywords.keyword',
      identifier: 'keywords',
      label: 'Keywords',
      size: 10
    }),
    new RefinementSelectFacet({
      field: 'organization.keyword',
      identifier: 'organization',
      label: 'Organization',
      size: 10,
      multipleSelect: true
    })
  ]
}

// Multiple schemas: https://www.searchkit.co/docs/customisations/multiple-searchkit-configurations
// const customSearchConfig = {
//   host: ELASTIC_URL,
//   index: 'registry',
//   hits: {
//     fields: ["preferredPrefix" , "altPrefix" , "providerBaseUri" , "alternativeBaseUri" , 
//       "miriam" , "biodbCoreId" , "bioportalOntologyId" , "thedatahub" , "abbreviation" , 
//       "title" , "description" , "pubmedId" , "organization" , "type" , "keywords" , 
//       "homepage" , "homepageStillAvailable" , "subNamespaceInDataset" , "partOfCollection" , 
//       "licenseUrl" , "licenseText" , "rights" , "regex" , "exampleId" , "providerHtmlUrl" , 
//       "miriamChecked" , "miriamCuratorNotes" , "miriamCoverage" , "updates", "@type", "@context"],
//   },
//   query: new MultiMatchQuery({
//     fields: ['alternativeBaseUri^5', 'providerBaseUri^4']
//   }),
// }

let { typeDefs, withSearchkitResolvers, context } = SearchkitSchema([{
  config: searchkitConfig, // searchkit configuration
  typeName: 'ResultSet', // base typename
  hitTypeName: 'RegistryEntry',
  addToQueryType: true // When true, adds a field called results to Query type
},
// { 
//   config: customSearchConfig,
//   typeName: 'UserResultSet', 
//   hitTypeName: "SearchResult"
// }
])

typeDefs = [
  gql`
    type Query {
      Entry(query: String): Entry
      getPreferredURI(uri: String): String
      root: String
    }

    type HitFields {
      preferredPrefix: String
      altPrefix: [String]
      identifiersPrefix: String
      providerBaseUri: String
      alternativeBaseUri: [String]
      title: String
      description: String
      type: String
      organization: String
      homepage: String
      providerHtmlUrl: String
      exampleId: String
      keywords: [String]
      regex: String
      yearLastAccessible: String
      waybackUrl: String
    }

    type RegistryEntry implements SKHit {
      id: ID!
      fields: HitFields
      exampleUrl: String
      identifiersUrl: String
      rdfType: String
      context: Context
      highlight: Highlight
    }

    type Highlight {
      title: [String]
      description: [String] 
    }

    type Context {
      preferredPrefix: String
      title: String
      description: String
      organization: String
      homepage: String
      licenseUrl: String
      abbreviation: String
    }
    type Entry {
      preferredPrefix: String
      altPrefix: [String]
      identifiersPrefix: String
      providerBaseUri: String
      alternativeBaseUri: [String]
      title: String
      description: String
      type: String
      organization: String
      homepage: String
      providerHtmlUrl: String
      exampleId: String
      keywords: [String]
      regex: String
      yearLastAccessible: String
      waybackUrl: String      
      # type: String
    }
  `,
  ...typeDefs
]


// ElasticSearch client for custom functions
const client = new Client({
  node: ELASTIC_URL
})
interface Source {
  providerBaseUri: string,
  alternativeBaseURI: string
}

// GraphQL resolvers
const resolvers = withSearchkitResolvers({
  RegistryEntry: {
    highlight: (hit: any) => {
      //var t = hit.highlight.description.join('')
      return hit.highlight
    },
    exampleUrl: (parent: any) => {
      if (parent.fields.providerHtmlUrl && parent.fields.exampleId) {
        return parent.fields.providerHtmlUrl.replace('$id', parent.fields.exampleId)
      }
    },
    identifiersUrl: (parent: any) => {
      if(parent.fields.identifiersPrefix) {
        return "https://identifiers.org/" + parent.fields.identifiersPrefix
      }
    },
    rdfType: (parent: any) => {
      if (parent.fields['@type']) {
        return parent.fields['@type']
      }
    },
    context: (parent: any) => {
      if (parent.fields['@context']) {
        // return JSON.stringify(parent.fields['@context'])
        return parent.fields['@context']
      }
    }
  },
  Query: {
    Entry: async (_: any, args: any) => {
      return {
        preferredPrefix: 'pref ' + args.query,
        providerBaseUri: 'baseuri'
      }
    },
    getPreferredURI: async (_: any, args: any) =>  {
      // Resolve pref URI by querying directly the ElasticSearch endpoint
      // Replace for elastic query_string query
      const uri = args.uri.replace(/(\+|\-|\=|&&|\|\||\>|\<|\!|\(|\)|\{|\}|\[|\]|\^|"|~|\*|\?|\:|\\|\/)/g, '\\\\$&');
      console.log(uri)
      const response: any = await client.search<Source>({
        index: 'registry',
        body: {
          _source: ["providerBaseUri", "alternativeBaseURI"],
          // Trying with uri: http://identifiers.org/obo.aero/
          query: {
            multi_match: {
              query: args.uri,
              fields: [ "providerBaseUri", "alternativeBaseURI^5" ],
              // type: "phrase"
              // type: "best_fields",
              // tie_breaker: 0.7
            }
          }
          // query: {
          //   bool: {
          //     must: [{
          //       query_string: {
          //           // query: '*' + uri + '*',
          //           query: uri,
          //           fields: ["providerBaseUri", "alternativeBaseURI"],
          //           // analyzer: "keyword",
          //           // escape: true
          //       }
          //     }]
          //   }
          // }
          // "query": {
          //   "bool": {
          //     "must": [
          //       {
          //         "term": {
          //           "alternativeBaseURI": args.uri
          //         }
          //       }
          //     ]
          //   }
          // }
        }
      });
      console.log(response)
      console.log(response.body.hits.hits)
      if (response.body.hits.hits.length > 0) {
        // Take the first hit in the list (highest score)
        return response.body.hits.hits[0]._source.providerBaseUri
      } else {
        return null
      }
    }
  }
})

// Define GraphQL schema and Apollo server
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
const server = new ApolloServer({
  schema,
  context: {
    ...context
  },
  playground: true,
  introspection: true,
});

// Now we define the Express server:
export const app = express();
// For production (cf. https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment)
app.use(compression());
app.use(cors());
// Security: https://github.com/helmetjs/helmet
app.use(helmet({
  contentSecurityPolicy: false,
}));

// Add Apollo GraphQL endpoint at /graphql
server.applyMiddleware({ app, path: '/graphql' });

// Add RESTful API endpoint with Sofa at /api
const openApi = OpenAPI({
  schema,
  info: {
    title: 'Bio2KG Registry API',
    version: '3.0.0',
  },
});
app.use(
  useSofa({
      basePath: '/api',
      schema,
      onRoute(info) {
          openApi.addRoute(info, {
            basePath: '/api',
          });
        },
  })
);
// Add OpenAPI docs at /apidocs
openApi.save('./swagger.yml');
app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(openApi.get()));

// Serve searchkit-react at /
app.use(express.static(path.join(__dirname, ".", "public")));


app.listen({ port: 4000 }, () =>
  console.log(`🚀 GraphQL ready at http://localhost:4000${server.graphqlPath}
📖 OpenAPI docs ready at http://localhost:4000/apidocs`)
);
