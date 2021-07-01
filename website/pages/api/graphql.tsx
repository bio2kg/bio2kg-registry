import { ApolloServer, gql } from 'apollo-server-micro'
import cors from 'micro-cors'

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
    fields: ['preferredprefix','alt-prefix','providerbaseuri','alternativebaseuri','miriam','biodbcoreid','bioportalontologyid','thedatahub','abbreviation','title','description','pubmedid','organization','type','keywords','homepage','homepagestillavailable','sub-namespaceindataset','partofcollection','licenseurl','licensetext','rights','idregex','exampleid','providerhtmlurl','miriamchecked','miriamcuratornotes','miriamcoverage','updates']
    // fields: ['Preferred Prefix','Alt-prefix','Provider Base URI','Alternative Base URI','MIRIAM','BiodbcoreID','BioPortal Ontology ID','thedatahub','Abbreviation','Title','Description','PubMed ID','Organization','Type (warehouse, dataset or terminology)','Keywords','Homepage','homepage still available?','sub-namespace in dataset','part of collection','License URL','License Text','Rights','ID regex','ExampleID','Provider HTML URL','MIRIAM checked','MIRIAM curator notes','MIRIAM coverage','updates']
    // fields: ['type','title','year','rated','released','genres','directors','writers','actors','countries','plot','poster','id']
  },
  sortOptions: [
    // { id: 'preferredprefix', label: "Preferred Prefix", field: [{"preferredprefix": "desc"}], defaultOption: true},
    { id: 'relevance', label: "Relevance", field: [{"_score": "desc"}], defaultOption: true},
    // { id: 'released', label: "Released", field: [{"released": "desc"}]},
  ],
  // Check example: https://github.com/searchkit/searchkit/issues/788
  // cf. https://searchkit.co/docs/reference/schema search for wildcard
  query: new CustomQuery({ 
    queryFn: (query, qm) => {
      return {
        bool: {
          must: [{
        // query: {
            query_string: {
                query: '*' + query + '*',
                fields: ["title", "description","preferredprefix", "providerbaseuri", "organization"]
            }
          }]
        }
      }
    }
  }),

  // query: new MultiMatchQuery({ 
  //   fields: ['preferredprefix^3','alt-prefix','providerbaseuri','alternativebaseuri','abbreviation','title^2','description','pubmedid','organization','homepage', 'keywords'],
  //   // 'preferredPrefix^4', 'alternatePrefix^3', 'title^2', '_all^1'
  // }),
  facets: [
    new RefinementSelectFacet({
      field: 'type.keyword',
      identifier: 'type',
      label: 'Type',
      size: 5,
      multipleSelect: true
    }),

    new RefinementSelectFacet({
      field: 'keywords.keyword',
      identifier: 'keywords',
      label: 'Keywords',
      size: 8,
      multipleSelect: true
    }),

    new RefinementSelectFacet({
      field: 'organization.keyword',
      identifier: 'organization',
      label: 'Organization',
      size: 8,
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
    // }),
    // new RangeFacet({
    //   field: 'imdbrating',
    //   identifier: 'imdbrating',
    //   label: 'IMDB Rating',
    //   range: {
    //     interval: 1,
    //     max: 10,
    //     min: 1
    //   }
    // })
  ]
}

const { typeDefs, withSearchkitResolvers, context } = SearchkitSchema({
  config: searchkitConfig,
  typeName: 'ResultSet',
  hitTypeName: 'ResultHit',
  addToQueryType: true
})

export const config = {
  api: {
    bodyParser: false
  }
}

const server = new ApolloServer({
  typeDefs: [
    gql`
    type Query {
      root: String
    }

    type HitFields {
      preferredprefix: String
      title: String
      description: String
      type: String
      organization: String
      keywords: [String]
      # updates: String
    }

    type ResultHit implements SKHit {
      id: ID!
      fields: HitFields
      customField: String
    }

  `, ...typeDefs
  ],
  resolvers: withSearchkitResolvers({
    ResultHit: {
      customField: (parent) => `parent id ${parent.id}`
    }
  }),
  introspection: true,
  playground: true,
  context: {
    ...context
  }
})

const handler = server.createHandler({ path: '/api/graphql' })

export default cors()((req, res) => req.method === 'OPTIONS' ? res.end() : handler(req, res))
