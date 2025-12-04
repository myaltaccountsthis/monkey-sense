FROM node:24-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

RUN apk add --no-cache build-base python3 bash gcc make
RUN CXX=g++ npm rebuild argon2 --build-from-source

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server
RUN chown server:nodejs -R /app

USER server

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npx", "tsx", "src/server.ts"]