FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
RUN npm install

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -rf node_modules/@nexora/types node_modules/@nexora/config \
  && mkdir -p node_modules/@nexora \
  && ln -s ../../packages/types node_modules/@nexora/types \
  && ln -s ../../packages/config node_modules/@nexora/config
RUN npx prisma generate --schema prisma/schema.prisma
RUN npm run build --workspace @nexora/types
RUN npm run build --workspace @nexora/config
RUN npm run build --workspace @nexora/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl python3
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/prisma ./prisma
EXPOSE 8311
CMD ["sh", "-c", "npx prisma db push --schema prisma/schema.prisma && npm run db:seed && npm run start --workspace @nexora/api"]
