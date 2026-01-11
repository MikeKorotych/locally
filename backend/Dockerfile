# Builder stage
FROM node:20 AS builder
WORKDIR /app

# install dependencies (use npm install to support repo without lockfile)
COPY package*.json ./
RUN npm install --no-audit --no-fund

# copy everything and set DATABASE_URL for prisma generate
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# generate prisma client and build the project
RUN npx prisma generate
RUN npm run build

# prune dev dependencies before copying to runner stage
RUN npm prune --production

# Production stage
FROM node:20-slim AS runner

# create system user with a home directory
RUN useradd -r -m -d /home/app -s /sbin/nologin app

WORKDIR /app

# set HOME and npm cache to a writable location inside the home
ENV HOME=/home/app
ENV NPM_CONFIG_CACHE=/home/app/.npm

# copy only what's needed from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ensure home and app dirs exist and are writable by the app user
RUN mkdir -p /home/app/.npm \
  && chown -R app:app /home/app /app \
  && chmod -R 700 /home/app

ENV NODE_ENV=production
EXPOSE 3000

USER app
CMD ["node", "dist/main"]