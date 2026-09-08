FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache curl unzip \
  && curl -L -o /tmp/mcrcon.zip https://github.com/Tiiffi/mcrcon/releases/download/v0.7.2/mcrcon-0.7.2-linux-x86-64-static.zip \
  && unzip /tmp/mcrcon.zip -d /usr/local/bin \
  && chmod +x /usr/local/bin/mcrcon \
  && rm /tmp/mcrcon.zip \
  && apk del curl unzip

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER node

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]