import os
import pandas as pd
from elasticsearch import Elasticsearch, helpers
import json

# PHP script: https://github.com/prefixcommons/data-ingest/blob/master/code/LSR2json.php

# https://docs.google.com/spreadsheets/d/1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg/edit#gid=0
googledocs_id = '1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg'
sheet = 'resource'

es = Elasticsearch(
    # ['https://elastic.prefixes.bio2kg.137.120.31.102.nip.io'],
    # ['https://elastic:' + os.getenv('ELASTIC_PASSWORD') + '@elastic.prefixes.bio2kg.137.120.31.102.nip.io'],
    # ['https://elastic.prefixcommons.org'],
    # ['http://localhost:9200'],
    http_auth=('elastic', os.getenv('ELASTIC_PASSWORD')),
    port=443,
)

# Build URL to download CSV from google docs
googledocs_url = 'https://docs.google.com/spreadsheets/d/' + googledocs_id + '/gviz/tq?tqx=out:csv&sheet=' + sheet
print('Downloading ' + googledocs_url)

## Load csv to a pandas dataframe from the URL
# df = pd.read_csv(googledocs_url)
## Read from local to dev faster:
df = pd.read_csv('data/data.csv')

## Optional: check for duplicate values in 1st col, use .any() for boolean
# print(df['Preferred Prefix'].duplicated().sort_values())

# Remove space and lowercase the columns names
for column in df:
    df.rename({
        column: column.lower()
            .replace(' ', '')
            .replace('type(warehouse,datasetorterminology)', 'type')
            .replace('?', '')
            .replace('-', '')
    }, axis=1, inplace=True)

# Convert to JSON and drop null values
lsr_json = df.apply(lambda x: [x.dropna()], axis=1).to_json()
lsr_dict = json.loads(lsr_json)

elastic_json = []
for key, entry in lsr_dict.items():
    entry = entry[0]
    if 'pubmedid' in entry.keys(): 
        entry['pubmedid'] = str(entry['pubmedid']).split(',')
        for i in range(len(entry['pubmedid'])):
            entry['pubmedid'][i] = entry['pubmedid'][i].strip()
    if 'keywords' in entry.keys(): 
        entry['keywords'] = str(entry['keywords']).split(',')
        for i in range(len(entry['keywords'])):
            entry['keywords'][i] = entry['keywords'][i].strip()

    elastic_json.append({
        "_index": "prefixes",
        "_type": "item",
        "_id": entry['preferredprefix'],
        "_source": entry
    })

# print(elastic_json)

print('Loading ' + str(len(elastic_json)) + ' prefixes in ElasticSearch')

load_results = helpers.bulk(es, elastic_json)
print(load_results)


