FROM docker.m.daocloud.io/library/node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

FROM docker.m.daocloud.io/library/node:24-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist/ ./dist/
COPY config.json ./
EXPOSE 5000
CMD ["node", "dist/server.js"]
