import { ApolloServer, gql, makeExecutableSchema } from 'apollo-server-micro'
import cors from 'micro-cors'
// import { makeExecutableSchema } from '@graphql-tools/schema';

import {
  MultiMatchQuery,
  CustomQuery,
  RefinementSelectFacet,
  RangeFacet,
  SearchkitSchema,
  DateRangeFacet,
  SearchkitResolver
} from '@searchkit/schema'

const searchkitConfig = {
  host: 'https://elastic.registry.bio2kg.org',
  // If enable ElasticSearch built-in security:
  // host: 'https://elastic:' + process.env.ELASTIC_PASSWORD + '@elastic.registry.bio2kg.org',
  // host: 'https://elastic:' + process.env.ELASTIC_PASSWORD + '@elasticsearch:9200',
  // host: 'https://elasticsearch:9200',
  index: 'prefixes',
  hits: {
    fields: ["preferredPrefix" , "altPrefix" , "providerBaseUri" , "alternativeBaseUri" , 
      "miriam" , "biodbCoreId" , "bioportalOntologyId" , "thedatahub" , "abbreviation" , 
      "title" , "description" , "pubmedId" , "organization" , "type" , "keywords" , 
      "homepage" , "homepageStillAvailable" , "subNamespaceInDataset" , "partOfCollection" , 
      "licenseUrl" , "licenseText" , "rights" , "regex" , "exampleId" , "providerHtmlUrl" , 
      "miriamChecked" , "miriamCuratorNotes" , "miriamCoverage" , "updates", "@type", "@context"],
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
  // Check example: https://github.com/searchkit/searchkit/issues/788
  // cf. https://searchkit.co/docs/reference/schema search for wildcard

  query: new MultiMatchQuery({
    fields: ['preferredPrefix^5', 'altPrefix^4', 'abbreviation^4', 'title^3', 'organization^2', 'description','keywords']
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
    }),

    // new RangeFacet({
    //   field: 'metascore',
    //   identifier: 'metascore',
    //   label: 'Metascore',
    //   range: {
    //     min: 0,
    //     max: 100,
    //     interval: 5
    //   }
    // }),
    // new DateRangeFacet({
    //   field: 'released',
    //   identifier: 'released',
    //   label: 'Released'
    // })
  ]
}

export let { typeDefs, withSearchkitResolvers, context } = SearchkitSchema({
  config: searchkitConfig,
  typeName: 'ResultSet',
  hitTypeName: 'ResultHit',
  addToQueryType: true
})

export const resolvers = withSearchkitResolvers({
  ResultHit: {
    highlight: (hit: any) => {
      //var t = hit.highlight.description.join('')
      return hit.highlight
    },
    exampleUrl: (parent) => {
      if (parent.fields.providerHtmlUrl && parent.fields.exampleId) {
        return parent.fields.providerHtmlUrl.replace('$id', parent.fields.exampleId)
      }
    },
    rdfType: (parent) => {
      if (parent.fields['@type']) {
        return parent.fields['@type']
      }
    },
    context: (parent) => {
      if (parent.fields['@context']) {
        return JSON.stringify(parent.fields['@context'])
      }
    }
  },
  Query: {
    getPrefPrefix(uri: string) {
      return 'pref prefix for ' + uri;
    }
  }
})

export const config = {
  api: {
    bodyParser: false
  }
}

typeDefs = [
  gql`
  type Query {
    root: String
    getPrefPrefix(id: String!): String
  }

  type HitFields {
    preferredPrefix: String
    altPrefix: [String]
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
  }

  type ResultHit implements SKHit {
    id: ID!
    fields: HitFields
    exampleUrl: String
    rdfType: String
    context: String
    highlight: Highlight
  }

  type Highlight {
    title: [String]
    description: [String] 
  }
`, ...typeDefs
]

console.log(typeDefs)

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const server = new ApolloServer({
  schema, 
  introspection: true,
  playground: true,
  context: {
    ...context
  }
})

const handler = server.createHandler({ path: '/api/graphql' })

// TODO: use SOFA for OpenAPI https://github.com/Urigo/SOFA/blob/master/example/index.ts

export default cors()((req, res) => req.method === 'OPTIONS' ? res.end() : handler(req, res))

