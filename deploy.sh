#!/usr/bin/env bash
echo "Bringing down with docker-compose down"
docker-compose down
echo "Bring up with docker-compose up"300
docker-compose up --build