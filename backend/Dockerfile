FROM node:20-alpine

# Install dependencies for building native modules
RUN apk add --no-cache postgresql-client python3 make g++

WORKDIR /app

# Copy only package.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 8080

# Start container after DB is ready
CMD ["sh", "-c", "\
  until PGPASSWORD=$DB_PASSWORD pg_isready -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\"; do \
    echo 'Waiting for Postgres...'; \
    sleep 2; \
  done && \
  npx prisma generate && \
  npx prisma migrate deploy && \
  npm run start:prod \
"]
