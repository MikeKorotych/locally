FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "\
  until PGPASSWORD=$DB_PASSWORD pg_isready -h \"$DB_HOST\" -p \"$DB_PORT\" -U \"$DB_USER\"; do \
    echo 'Waiting for Postgres...'; \
    sleep 2; \
  done && \
  npx prisma generate && \
  npx prisma migrate deploy && \
  npm run start:prod \
"]