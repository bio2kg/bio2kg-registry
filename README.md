# Bio2KG Registry and APIs

The Bio2KG Registry is a repository of dataset descriptions, including preferred CURIE prefixes, base URIs, identifier regex patterns and HTML resolvers for biomedical datasets.

The registry is constructed from a manually curated spreadsheet.

1. Extract data from the [Life Science Registry spreadsheet on Google docs](https://docs.google.com/spreadsheets/d/1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg/edit#gid=0)
2. Load to ElasticSearch (deployed with the `docker-compose.yml` file)

Access the Bio2KG registry web application and API endpoints:

* Search website: https://registry.bio2kg.org

* GraphQL API: https://registry.bio2kg.org/graphql

* ElasticSearch API: https://elastic.registry.bio2kg.org/_search

Search with cURL:

```bash
curl -XGET --header 'Content-Type: application/json' https://elastic.registry.bio2kg.org/prefixes/_search -d '{
      "query" : {
        "match" : { "Preferred Prefix": "bio" }
    }
}'
```

##  Update the Life Science Registry 🐍

The process to prepare the ElasticSearch index for the Life Science Registry runs in a docker container defined in the `etl` folder.

To update a running `docker-compose` stack:

```bash
docker-compose run update-pipeline
```

## Deploy with docker 🐳

### Locally for development

1. Prepare the permission for the shared volume to keep ElasticSearch data persistent:

```bash
sudo mkdir -p /data/bio2kg/registry/elasticsearch
sudo chmod g+rwx -R /data/bio2kg/registry/elasticsearch
sudo chgrp 1000 -R /data/bio2kg/registry/elasticsearch
sudo chown 1000 -R /data/bio2kg/registry/elasticsearch
```

2. Start the stack with docker-compose:

```bash
docker-compose up -d
```

* Search UI frontend on http://localhost:3000
* GraphQL server on http://localhost:4000/graphql
* ElasticSearch on http://localhost:9200

🔁 If you want to update the ElasticSearch endpoint data without stopping the stack, you can run this:

```bash
docker-compose run update-pipeline
```

The stack deploys:

* An ElasticSearch instance with a nginx proxy to allow anyone to access the `/_search` endpoint, but prevents editing, configuration defined in the `elasticsearch` folder on http://localhost:9200
* A NodeJS server using Searchkit and NextJS defined in the `website` folder on http://localhost:3000
  * Apollo GraphQL endpoint serving data from ElasticSearch on `/graphql`
  * A React website using SearchKit to search the data on the base URL (`/`)
  * 🚧 In development: a Sofa API to publish an OpenAPI endpoint based on the GraphQL endpoint
    * API on `/api`
    * Swagger UI on `/apidocs`

You can also start just the website using `yarn` without of docker, it will get the data from the ElasticSearch in production:

```bash
cd website
yarn
yarn dev
```

### Deploy in production

Start the stack with production config, using nginx-proxy to route the services:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

Install the Linked Data Platform in the Virtuoso triplestore (running via `docker-compose`)

```bash
./prepare_virtuoso_ldp.sh
```

🔁 If you want to update the ElasticSearch endpoint data without stopping the stack, you can run this:

```bash
docker-compose run update-pipeline
```

## Add a field in the registry

To add a new field to the Bio2KG registry, check the following files:

1. In the `etl` folder python script: get the field from the spreadsheet, process it, and add the field value to ElasticSearch
2. In `website/pages/api/graphql.tsx`: add the field in the entry fields to register this field in the GraphQL server query
3. In `website/components/index.tsx`: add the field to the GraphQL query used by the UI to retrieve data. 
3. In `website/components/searchkit/Hits.tsx`: add the field to the UI 

⚠️ Make sure the id you are using for the field is the same everywhere! (it is case sensitive)
