#!/bin/bash

ssh ids2 'cd /data/deploy-ids-tests/bio2kg-registry ; git pull ; docker-compose run update-pipeline'
