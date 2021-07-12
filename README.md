# Bio2KG Registry and APIs

The Bio2KG Registry is a repository of dataset descriptions, including preferred CURIE prefixes, base URIs, identifier regex patterns and HTML resolvers for biomedical datasets.

The registry is constructed from a manually curated spreadsheet.

1. Extract data from the [Life Science Registry spreadsheet on Google docs](https://docs.google.com/spreadsheets/d/1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg/edit#gid=0)
2. Load to ElasticSearch (deployed with the `docker-compose.yml` file)

Access the Bio2KG registry web application and API endpoints:

* Search website: https://registry.bio2kg.org

* GraphQL API: https://registry.bio2kg.org/api/graphql

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

The process to prepare the ElasticSearch index for the Life Science Registry runs in a docker container defined in the `docker-compose.yml` file as `update-pipeline`

To run locally:

1. Install dependencies:

```bash
pip install -r etl/requirements.txt
```

2. Define the ElasticSearch password as environment variable, for example with Bash:

```bash
export ELASTIC_PASSWORD=yourpassword
```

3. Run the python script:

```bash
python3 etl/lsr_csv_to_elastic.py
```

## Deploy with docker 🐳

Make sure you use the same password in the GitHub Actions secrets and for the docker compose deployment.

1. Add the ElasticSearch password to a `.env` file alongside the `docker-compose.yml`, for example with Bash:

```bash
echo "ELASTIC_PASSWORD=yourpassword" > .env
```

2. Generate the `.htpasswd` file with user/password for the nginx authentication over ElasticSearch defined in `elasticsearch/nginx.conf`:

```bash
htpasswd -Bbn elastic yourpassword > elasticsearch/.htpasswd
```

3. Prepare the permission for the shared volume to keep ElasticSearch data persistent:

```bash
sudo mkdir -p /data/bio2kg/registry/elasticsearch
sudo chmod g+rwx -R /data/bio2kg/registry/elasticsearch
sudo chgrp 1000 -R /data/bio2kg/registry/elasticsearch
sudo chown 1000 -R /data/bio2kg/registry/elasticsearch
```

4. Start the docker-compose:

```bash
docker-compose up -d
```

If you want to update the ElasticSearch endpoint data without stopping the stack, you can run this:

```bash
docker-compose run update-pipeline
```

It deploys:

* An ElasticSearch instance with a nginx proxy to allow anyone to access the `/_search` endpoint, but prevents editing, configuration defined in the `elasticsearch` folder
* A NodeJS server using Searchkit and Express defined in the `server` folder
  * SearchKit Apollo GraphQL endpoint serving data from ElasticSearch on `/graphql`
  * Sofa API to publish an OpenAPI endpoint based on the GraphQL endpoint
    * API on `/api`
    * Swagger UI on `/apidocs`
  * A React website to search the data on the base URL (`/`) defined in the folder `searchkit-react`

Checkout the readme in the `server` folder for more details on the website the website.

