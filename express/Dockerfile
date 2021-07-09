# Install dependencies only when needed
FROM node:alpine AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
# RUN apk add --no-cache libc6-compat

# Install Express server dependencies
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Install searchkit-react app dependencies
WORKDIR /app/searchkit-react
COPY searchkit-react/package.json searchkit-react/yarn.lock ./
RUN yarn install --frozen-lockfile


# Build and run
FROM node:alpine AS runner
ENV NODE_ENV production

WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/searchkit-react/node_modules ./searchkit-react/node_modules
# RUN yarn build && yarn install --production --ignore-scripts --prefer-offline
RUN yarn install && yarn build
RUN yarn install ts-node

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app

USER nodejs

ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 4000
CMD ["yarn", "serve"]
