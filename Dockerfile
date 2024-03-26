FROM node:14.15.0-alpine

WORKDIR /app

ADD package.json yarn.lock .npmrc /app/

RUN yarn

ADD . .

RUN yarn build

FROM nginx:stable

COPY --from=0 /app/dist/ /var/www/

RUN rm -rf /var/www/index.html

ADD nginx.conf /etc/nginx/conf.d/default.conf

