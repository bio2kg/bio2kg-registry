
# docker-compose exec virtuoso isql-v -U dba -P dba exec="ld_dir('/data/dumps', '*.nq', 'http://bio2rdf.org'); rdf_loader_run();"

# docker exec -it bio2rdf5-virtuoso isql-v -U dba -P dba exec="ld_dir('/data/dumps', '*.nq', 'http://bio2rdf.org'); rdf_loader_run();"

wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_framework_dav.vad
wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_briefcase_dav.vad

docker cp ods_framework_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database
docker cp ods_briefcase_dav.vad bio2kg-registry-virtuoso:/opt/virtuoso-opensource/database

# docker-compose exec virtuoso wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_framework_dav.vad
# docker-compose exec virtuoso wget http://download3.openlinksw.com/uda/vad-vos-packages/7.2/ods_briefcase_dav.vad

docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_framework_dav.vad', 0);"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="vad_install ('ods_briefcase_dav.vad', 0);"

# USER_CREATE ('dav', 'password', vector ('SQL_ENABLE', 'DAV_ENABLE', 'HOME', '/DAV/home/ldp') );
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_GROUP ('dav', 'dav', 'dav');"
docker-compose exec virtuoso isql -U dba -P $DBA_PASSWORD exec="DB.DBA.DAV_ADD_USER ('dav', 'secret', 'dav', '110100000', 0, NULL, 'Test User Account', 'nobody@foo.bar', 'dav', 'dav');"

docker-compose exec virtuoso isql -U dav -P $DAV_PASSWORD exec="select DB.DBA.DAV_COL_CREATE ('/DAV/home/ldp/registry','110100000R', 'dav','dav','dav','dav');"

# http://docs.openlinksw.com/virtuoso/dbadm/
# http://docs.openlinksw.com/virtuoso/fn_user_create/
# http://docs.openlinksw.com/virtuoso/fn_dav_api_user/
# http://docs.openlinksw.com/virtuoso/fn_dav_api_change/
# http://docs.openlinksw.com/virtuoso/fn_dav_api_add/

# Create folders: http://docs.openlinksw.com/virtuoso/fn_dav_api_add/