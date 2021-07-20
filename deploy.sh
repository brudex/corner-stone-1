#!/usr/bin/env bash
PROJECT_FOLDER=/var/www/cornestone
cd ${PROJECT_FOLDER}
echo "Bringing down with docker-compose down"
docker-compose down
echo "Bring up with docker-compose up"
docker-compose up --build -d