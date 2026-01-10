DEV_COMPOSE=-f docker-compose.dev.yml
ENV_FILE=backend/.env

up:
	docker compose $(DEV_COMPOSE) --env-file $(ENV_FILE) up --build -d

dev-up:
	$(MAKE) up

dev-build:
	docker compose $(DEV_COMPOSE) build backend

dev-logs:
	docker compose $(DEV_COMPOSE) logs -f backend

dev-migrate:
	docker compose $(DEV_COMPOSE) --env-file $(ENV_FILE) run --rm backend npx prisma migrate deploy

dev-down:
	docker compose $(DEV_COMPOSE) down --remove-orphans