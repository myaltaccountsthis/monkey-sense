FROM node:22-alpine AS base
WORKDIR /
COPY package.json package-lock.json ./

RUN apk add --no-cache build-base python3 bash gcc make

RUN npm ci

COPY . .
RUN CXX=g++ npm rebuild argon2 --build-from-source

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npx", "tsx", "src/server.ts"]