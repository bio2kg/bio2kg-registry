
export DBA_PASSWORD=$(cat .env | sed 's/ELASTIC_PASSWORD=//g')

# wget not installed in virtuoso container
wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_framework_dav.vad
wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_briefcase_dav.vad

docker cp ods_framework_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database
docker cp ods_briefcase_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database

# http://docs.openlinksw.com/virtuoso/dbadm/
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_framework_dav.vad', 0);"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_briefcase_dav.vad', 0);"

# http://docs.openlinksw.com/virtuoso/fn_user_create/
# http://docs.openlinksw.com/virtuoso/fn_dav_api_user/
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_GROUP ('dav', 'dav', 'dav');"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_USER ('ldp', '$DBA_PASSWORD', 'dav', '110100000', 0, NULL, 'LDP user', 'vincent.emonet@maastrichtuniversity.nl', 'dav', 'dav');"
# docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_USER ('dav', '$DBA_PASSWORD', 'dav', '110100000', 0, NULL, 'Test User Account', 'nobody@foo.bar', 'dav', 'dav');"
# USER_CREATE ('dav', 'password', vector ('SQL_ENABLE', 'DAV_ENABLE', 'HOME', '/DAV/home/ldp') );

# http://docs.openlinksw.com/virtuoso/fn_dav_api_add/
docker-compose exec virtuoso isql -U ldp -P $DBA_PASSWORD exec="select DB.DBA.DAV_COL_CREATE ('/DAV/home/ldp/registry','110100000R', 'ldp','dav','dav','dav');"

# http://docs.openlinksw.com/virtuoso/fn_dav_api_change/