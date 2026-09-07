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
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --chown=appuser:appgroup entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh
USER appuser

EXPOSE 4000
ENTRYPOINT ["./entrypoint.sh"]