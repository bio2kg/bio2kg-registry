
#git add .
#git commit -m "Improvements"
#git push

ssh ids2 'cd /data/deploy-services/bio2kg-registry ; git pull ; docker-compose build ; docker-compose down ; docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans'

# No cache:
# ssh ids2 'cd /data/deploy-services/bio2kg-registry ; git pull ; docker-compose build --no-cache ; docker-compose down ; docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --remove-orphans'