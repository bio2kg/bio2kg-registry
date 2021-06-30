# Bio2KG prefixes resolver API

An API to resolve prefixes and identifiers for biomedical concepts based on the Life Science Registry.

1. Extract data from the [Life Science Registry spreadsheet on Google docs](https://docs.google.com/spreadsheets/d/1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg/edit#gid=0)
2. Load to ElasticSearch (deployed with the `docker-compose.yml` file)

Access the Bio2KG prefix resolver:

* Search website: https://prefixes.bio2kg.137.120.31.102.nip.io

* GraphQL API: https://prefixes.bio2kg.137.120.31.102.nip.io/api/graphql

* ElasticSearch API (authentication): https://elastic.prefixes.bio2kg.137.120.31.102.nip.io/_search

Search with cURL:

```bash
curl -XGET --header 'Content-Type: application/json' https://bio2kg-prefixes.137.120.31.102.nip.io/prefixes/_search -d '{
      "query" : {
        "match" : { "Preferred Prefix": "bio" }
    }
}'
```

##  Update the Life Science Registry 🐍

The process to prepare the ElasticSearch index for the Life Science Registry runs as a GitHub Actions workflow, check it in the `.github/workflows` folder.

To run locally:

1. Install dependencies:

```bash
pip install -r etl/requirements.txt
```

2. Define the ElasticSearch password as environment variable, for example with Bash:

```bash
export ELASTIC_PASSWORD=mypassword
```

3. Run the python script:

```bash
python3 etl/lsr_csv_to_elastic.py
```

## Deploy with docker 🐳

Make sure you use the same password in the GitHub Actions secrets and for the docker compose deployment.

1. Add the ElasticSearch password to a `.env` file alongside the `docker-compose.yml`, for example with Bash:

```bash
echo "ELASTIC_PASSWORD=mypassword" > .env
```

2. Prepare the permission for the shared volume to keep ElasticSearch data persistent:

```bash
mkdir -p /data/bio2kg/prefixes/elasticsearch
sudo chmod g+rwx -R /data/bio2kg/prefixes/elasticsearch
sudo chgrp 1000 -R /data/bio2kg/prefixes/elasticsearch
sudo chown 1000 -R /data/bio2kg/prefixes/elasticsearch
```

3. Start the docker-compose:

```bash
docker-compose up
```

It deploys:

* An ElasticSearch instance
* A NodeJS website using Searchkit and NextJS
  * Web interface to search for prefixes
  * GraphQL API to query the ElasticSearch with Apollo on http://localhost:3000/api/graphql

Try the GraphQL API with this query:

```gql
{
  results {
    hits {
      items {
        ... on ResultHit {
          id
          fields {
            preferredprefix
            title
            type
            keywords
          }
        }
      }
    }
  }
}
```

### Add authentication

With a Nginx container using `nginx.conf`

1. Generate the `.htpasswd` file with users/password

```bash
htpasswd -Bbn elastic testpassword > elasticsearch/nginx.htpasswd
```

2. 
