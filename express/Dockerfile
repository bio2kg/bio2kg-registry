# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM node:alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN yarn build && yarn install --production --ignore-scripts --prefer-offline

ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# COPY --from=builder /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 4000
CMD ["yarn", "serve"]
