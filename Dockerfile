FROM node:16-alpine3.11
LABEL author="brudex:Penrose Akoto"

ENV NODE_ENV=production
ENV PORT=3000
ENV DBHOST=mysql
ENV DBNAME=cornerstone
ENV DBUSER=admin
ENV DBPASS=pass

COPY      . /var/www
WORKDIR   /var/www/
RUN       npm install

EXPOSE $PORT
ENTRYPOINT ["npm", "start"]