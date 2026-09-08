FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache build-base git \
    && git clone https://github.com/Tiiffi/mcrcon.git /tmp/mcrcon \
    && cd /tmp/mcrcon \
    && gcc -O3 mcrcon.c -o /usr/local/bin/mcrcon \
    && chmod +x /usr/local/bin/mcrcon \
    && apk del build-base git \
    && rm -rf /tmp/mcrcon

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER node

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]