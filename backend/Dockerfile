# Use official Node.js 20 image
FROM node:20

# Install Postgres client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Expose backend port
EXPOSE 8080

# Wait for Postgres and start the app
CMD ["sh", "-c", "\
  npx prisma generate && \
  npx prisma migrate deploy && \
  node dist/src/main.js \
"]
