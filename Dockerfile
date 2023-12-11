FROM node:19.6-alpine

WORKDIR /home/app/ 

COPY package*.json ./

RUN npm ci

USER node

COPY --chown=node:node . .

EXPOSE 3000

CMD [ "node", "./src/index.js" ]