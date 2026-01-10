# Convenience Makefile for common Docker Compose commands
ENV_FILE=backend/.env.local

up:
	docker compose --env-file $(ENV_FILE) up --build -d

logs:
	docker compose --env-file $(ENV_FILE) logs -f backend

ps:
	docker compose --env-file $(ENV_FILE) ps

migrate:
	docker compose --env-file $(ENV_FILE) run --rm backend npx prisma migrate deploy

down:
	docker compose --env-file $(ENV_FILE) down --remove-orphans

restart:
	docker compose --env-file $(ENV_FILE) restart backend
