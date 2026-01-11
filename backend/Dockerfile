# Use official Node.js 20 image (Debian-based)
FROM node:20

# Install Postgres client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and lockfile first for caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Expose backend port
EXPOSE 8080

# Wait for Postgres and start the app
CMD ["sh", "-c", "\
  until PGPASSWORD=$DB_PASSWORD pg_isready -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\"; do \
    echo 'Waiting for Postgres...'; sleep 2; \
  done && \
  npx prisma migrate deploy && \
  npm run start:prod \
"]
