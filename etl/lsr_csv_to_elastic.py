import os
import pandas as pd
from elasticsearch import Elasticsearch, helpers
import json

# PHP script: https://github.com/prefixcommons/data-ingest/blob/master/code/LSR2json.php

# https://docs.google.com/spreadsheets/d/1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg/edit#gid=0
googledocs_id = '1c4DmQqTGS4ZvJU_Oq2MFnLk-3UUND6pWhuMoP8jgZhg'
sheet = 'resource'

es = Elasticsearch(
    ['http://elasticsearch:9200'],
    # ['https://elastic.registry.bio2kg.org'],
    # ['https://elastic:' + os.getenv('ELASTIC_PASSWORD') + '@elastic.registry.bio2kg.org'],
    # ['https://elastic.prefixcommons.org'],
    # http_auth=('elastic', os.getenv('ELASTIC_PASSWORD')),
    # port=443,
)

# Build URL to download CSV from google docs
googledocs_url = 'https://docs.google.com/spreadsheets/d/' + googledocs_id + '/gviz/tq?tqx=out:csv&sheet=' + sheet
print('Downloading ' + googledocs_url)

## Load csv to a pandas dataframe from the URL
df = pd.read_csv(googledocs_url)
## Read from local to dev faster:
# df = pd.read_csv('data/data.csv')

## Optional: check for duplicate values in 1st col, use .any() for boolean
# print(df['Preferred Prefix'].duplicated().sort_values())

col_mapping = {
    'Preferred Prefix': 'preferredPrefix',
    'Alt-prefix': 'altPrefix',
    'Provider Base URI': 'providerBaseUri',
    'Alternative Base URI': 'alternativeBaseUri',
    'MIRIAM': 'miriam',
    'BiodbcoreID': 'biodbCoreId',
    'BioPortal Ontology ID': 'bioportalOntologyId',
    'thedatahub': 'thedatahub',
    'Abbreviation': 'abbreviation',
    'Title': 'title',
    'Description': 'description',
    'PubMed ID': 'pubmedId',
    'Organization': 'organization',
    'Type (warehouse, dataset or terminology)': 'type',
    'Keywords': 'keywords',
    'Homepage': 'homepage',
    'homepage still available?': 'homepageStillAvailable',
    'sub-namespace in dataset': 'subNamespaceInDataset',
    'part of collection': 'partOfCollection',
    'License URL': 'licenseUrl',
    'License Text': 'licenseText',
    'Rights': 'rights',
    'ID regex': 'regex',
    'ExampleID': 'exampleId',
    'Provider HTML URL': 'providerHtmlUrl',
    'MIRIAM checked': 'miriamChecked',
    'MIRIAM curator notes': 'miriamCuratorNotes',
    'MIRIAM coverage': 'miriamCoverage',
    'updates': 'updates',
}
# Preferred Prefix
# Alt-prefix	Provider Base URI	Alternative Base URI	MIRIAM	BiodbcoreID	BioPortal Ontology ID	thedatahub	Abbreviation	Title	Description	PubMed ID	Organization	Type (warehouse, dataset or terminology)	Keywords	Homepage	homepage still available?	sub-namespace in dataset	part of collection	License URL	License Text	Rights	ID regex	ExampleID	Provider HTML URL		MIRIAM checked	MIRIAM curator notes	MIRIAM coverage	updates

for key, value in col_mapping.items():
    df.rename({
        key: value
    }, axis=1, inplace=True)

## Check the list of columns:
# print('" , "'.join(list(col_mapping.values())))

# for column in df:
#     # Clean up col labels, then camelcase
#     clean_column = column.replace(' (warehouse, dataset or terminology)', '').replace('?', '').replace('-', ' ')
#     split_col = clean_column.split(' ')
#     camelcase_col = "".join(word[0].upper() + word[1:].lower() for word in split_col)
#     camelcase_col = camelcase_col[0].lower() + camelcase_col[1:]
#     print(camelcase_col)

#     df.rename({
#         column: camelcase_col
#     }, axis=1, inplace=True)

# Convert to JSON and drop null values
lsr_json = df.apply(lambda x: [x.dropna()], axis=1).to_json()
lsr_dict = json.loads(lsr_json)

# Prepare JSON for ElasticSearch ingestion
elastic_json = []
for key, entry in lsr_dict.items():
    entry = entry[0]
    if 'pubmedId' in entry.keys(): 
        entry['pubmedId'] = str(entry['pubmedId']).split(',')
        for i in range(len(entry['pubmedId'])):
            entry['pubmedId'][i] = entry['pubmedId'][i].strip()
    if 'keywords' in entry.keys(): 
        entry['keywords'] = str(entry['keywords']).split(',')
        for i in range(len(entry['keywords'])):
            entry['keywords'][i] = entry['keywords'][i].strip()

    elastic_json.append({
        "_index": "prefixes",
        "_type": "item",
        "_id": entry['preferredPrefix'],
        "_source": entry
    })

# print(elastic_json)

print('Loading ' + str(len(elastic_json)) + ' prefixes in ElasticSearch')

load_results = helpers.bulk(es, elastic_json)
print(load_results)


