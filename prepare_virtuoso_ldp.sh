
export DBA_PASSWORD=$(cat .env | sed 's/ELASTIC_PASSWORD=//g')

# wget not installed in virtuoso container
docker-compose exec virtuoso apt-get update
docker-compose exec virtuoso apt-get install -y wget
docker-compose exec virtuoso wget -N http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_framework_dav.vad
docker-compose exec virtuoso wget -N http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_briefcase_dav.vad

# docker cp ods_framework_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database
# docker cp ods_briefcase_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database

# http://docs.openlinksw.com/virtuoso/dbadm/
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_framework_dav.vad', 0);"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_briefcase_dav.vad', 0);"

# Make DAV publicly readable: http://docs.openlinksw.com/virtuoso/fn_dav_api_change/
# https://github.com/openlink/virtuoso-opensource/issues/490
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_PROP_SET('/DAV/home/dav/', ':virtpermissions', '110110100R','dav','$DBA_PASSWORD');"

# Create ldp user via dav not working
# http://docs.openlinksw.com/virtuoso/fn_dav_api_user/
# docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_GROUP ('ldp', 'ldp', 'ldp');"
# docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_USER ('ldp', '${DBA_PASSWORD}', 'ldp', '110100000', 0, NULL, 'LDP user', 'vincent.emonet@maastrichtuniversity.nl', 'ldp', 'ldp');"


# Create user working
# http://docs.openlinksw.com/virtuoso/fn_user_create/
# docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="USER_CREATE ('ldp', '${DBA_PASSWORD}', vector ('SQL_ENABLE', '1', 'DAV_ENABLE', '1','HOME', '/DAV/home/ldp') );"

# Create folder: http://docs.openlinksw.com/virtuoso/fn_dav_api_add/
# docker-compose exec virtuoso isql -U ldp -P $DBA_PASSWORD exec="select DB.DBA.DAV_COL_CREATE ('/DAV/home/ldp/registry','110100000R', 'ldp','ldp','ldp','ldp');"

# Test the LDP
# echo "<http://subject.org> <http://pred.org> <http://object.org> ." > test-rdf.ttl
# curl -u davs:$DBA_PASSWORD --data-binary @test-rdf.ttl -H "Accept: text/turtle" -H "Content-type: text/turtle" -H "Slug: test-rdf" https://data.registry.bio2kg.org/DAV/home/dav
