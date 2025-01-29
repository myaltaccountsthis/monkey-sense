FROM node:22-alpine AS base
WORKDIR /
COPY package.json package-lock.json ./
RUN npm i
COPY . .

ENV NODE_ENV=production

EXPOSE 8080

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["npx", "tsx", "src/server.ts"]