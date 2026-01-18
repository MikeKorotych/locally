FROM node:20

RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["sh", "-c", "\
  npx prisma generate && \
  npx prisma migrate deploy && \
  node dist/src/main.js \
"]
