FROM node:24-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN yarn build

FROM node:24-alpine

WORKDIR /app

RUN corepack enable
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder --chown=appuser:appgroup /app/.next ./.next
COPY --from=builder --chown=appuser:appgroup /app/public ./public
USER appuser

EXPOSE 3000

CMD ["yarn", "start"]