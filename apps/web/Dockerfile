FROM node:22-alpine AS deps

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm install --install-strategy=hoisted \
  && npm install --no-save \
    lightningcss-linux-x64-musl@1.32.0 \
    @tailwindcss/oxide-linux-x64-musl@4.3.1

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN rm -rf node_modules/@nexora/types node_modules/@nexora/config \
  && mkdir -p node_modules/@nexora \
  && ln -s ../../packages/types node_modules/@nexora/types \
  && ln -s ../../packages/config node_modules/@nexora/config
RUN npm run build --workspace @nexora/types
RUN npm run build --workspace @nexora/config
RUN npm run build --workspace @nexora/web

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/packages ./packages
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "@nexora/web"]
