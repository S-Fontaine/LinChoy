FROM node:24-alpine AS builder

WORKDIR /app

# Active Yarn via Corepack (déjà inclus dans l'image Node)
RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# --- Étape finale, image allégée pour la production ---
FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/server.js"]
