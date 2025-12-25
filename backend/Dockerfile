FROM node:20-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

CMD ["sh", "-c", "until pg_isready -h postgres -p 5432 -U user; do echo 'Waiting for Postgres...'; sleep 2; done && npx prisma migrate deploy && npm run start:dev"]