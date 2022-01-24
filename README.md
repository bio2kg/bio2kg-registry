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

<!-- Password currently not used for ElasticSearch

Make sure you use the same password in the GitHub Actions secrets and for the docker compose deployment.

1. Add the ElasticSearch password to a `.env` file alongside the `docker-compose.yml`, for example with Bash:

```bash
echo "ELASTIC_PASSWORD=yourpassword" > .env
```

2. Generate the `.htpasswd` file with user/password for the nginx authentication over ElasticSearch defined in `elasticsearch/nginx.conf`:

```bash
htpasswd -Bbn elastic yourpassword > elasticsearch/.htpasswd
```

-->

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

3. If you want to update the ElasticSearch endpoint data without stopping the stack, you can run this:

```bash
docker-compose run update-pipeline
```

The stack deploys:

* An ElasticSearch instance with a nginx proxy to allow anyone to access the `/_search` endpoint, but prevents editing, configuration defined in the `elasticsearch` folder on http://localhost:9200
* A NodeJS server using Searchkit and Express defined in the `server` folder on http://localhost:4000
  * SearchKit Apollo GraphQL endpoint serving data from ElasticSearch on `/graphql`
  * Sofa API to publish an OpenAPI endpoint based on the GraphQL endpoint
    * API on `/api`
    * Swagger UI on `/apidocs`
  * A React website to search the data on the base URL (`/`) defined in the folder `searchkit-react`

Checkout the readme in the `server` folder for more details on the website the website. You can also start it with `yarn` outside of docker:

```bash
cd server/searchkit-react
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

If you want to update the ElasticSearch endpoint data without stopping the stack, you can run this:

```bash
docker-compose run update-pipeline
```

## Add a field the the registry

To add a new field to the Bio2KG registry, check the following files:

1. In the `etl` folder python script: process and add the field value to ElasticSearch
2. In `server/server.ts`: add the field in the entry fields to add this field to the GraphQL query
3. In `server/searchkit-react`: add the field to the GraphQL query used by the UI to retrieve data. 

⚠️ Make sure the id you are using for the field is the same everywhere! (it is case sensitive)
