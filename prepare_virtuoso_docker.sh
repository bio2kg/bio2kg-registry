
export DBA_PASSWORD=$(cat .env | sed 's/ELASTIC_PASSWORD=//g')


# Install wget and download VAD packages in Virtuoso container
docker-compose exec virtuoso apt-get update
docker-compose exec virtuoso apt-get install -y wget
docker-compose exec virtuoso wget -N http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_framework_dav.vad
docker-compose exec virtuoso wget -N http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_briefcase_dav.vad

# docker cp ods_framework_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database
# docker cp ods_briefcase_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database

# Install VAD packages: http://docs.openlinksw.com/virtuoso/dbadm/
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_framework_dav.vad', 0);"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_briefcase_dav.vad', 0);"

# Create /DAV/ldp folder: http://docs.openlinksw.com/virtuoso/fn_dav_api_add/
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="select DB.DBA.DAV_COL_CREATE ('/DAV/ldp/','110100100R', 'dav','dav','dav', '${DBA_PASSWORD}');"

# Run the script to process and load data to Elastic and Virtuoso
docker-compose run update-pipeline

# Test the LDP
# echo "<http://subject.org> <http://pred.org> <http://object.org> ." > test-rdf.ttl
# curl -u dav:$DBA_PASSWORD --data-binary @test-rdf.ttl -H "Accept: text/turtle" -H "Content-type: text/turtle" -H "Slug: test-rdf" https://data.registry.bio2kg.org/DAV/home/dav
