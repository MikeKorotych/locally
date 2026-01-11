# Builder stage
FROM node:20 AS builder
WORKDIR /app

# install dependencies (use npm ci if you have package-lock.json)
COPY package*.json ./
RUN npm ci

# copy everything and set DATABASE_URL for prisma generate
COPY . .
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# generate prisma client and build the project
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-slim AS runner
RUN useradd --system --user-group app
WORKDIR /app

# copy only what's needed from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
EXPOSE 3000

USER app
CMD ["node", "dist/main"]
