FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept DATABASE_URL as build arg with a dummy default for build-time
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

CMD ["sh", "-c", "until pg_isready -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\"; do echo 'Waiting for Postgres...'; sleep 2; done && npx prisma migrate deploy && npm run start:dev"]