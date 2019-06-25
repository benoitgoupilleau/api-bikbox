FROM node:10-alpine

RUN mkdir -p /nodeapp

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

RUN npm i npm@latest -g

WORKDIR /nodeapp
COPY package.json ./
RUN npm install && npm cache clean --force
ENV PATH /nodeapp/node_modules/.bin:$PATH

HEALTHCHECK --interval=30s CMD node healthcheck.js

COPY . /nodeapp

CMD node /nodeapp/server/server.js