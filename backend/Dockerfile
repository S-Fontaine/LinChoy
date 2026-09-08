FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER node

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]