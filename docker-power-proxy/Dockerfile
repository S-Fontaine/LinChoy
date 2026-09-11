FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY server.js ./

EXPOSE 3001
CMD ["node", "server.js"]
