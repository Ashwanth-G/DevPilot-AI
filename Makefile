# DevPilot AI local development shortcuts.
# See RUNNING.md for the complete platform-specific setup instructions.

.DEFAULT_GOAL := help
.PHONY: help setup frontend backend check test db-migrate db-check build

PYTHON ?= python
NPM ?= npm

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "%-14s %s\n", $$1, $$2}'

setup: ## Install backend and frontend dependencies
	cd backend && $(PYTHON) -m pip install -e ".[dev]"
	cd frontend && $(NPM) install

frontend: ## Start the Next.js development server
	cd frontend && $(NPM) run dev

backend: ## Start the FastAPI development server
	cd backend && $(PYTHON) -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

check: ## Run static checks for both applications
	cd frontend && $(NPM) run type-check && $(NPM) run lint
	cd backend && $(PYTHON) -m ruff check . && $(PYTHON) -m alembic check

test: ## Run the backend authentication integration test
	cd backend && $(PYTHON) -m pytest -q

db-migrate: ## Apply Alembic database migrations
	cd backend && $(PYTHON) -m alembic upgrade head

db-check: ## Confirm the database schema matches the ORM models
	cd backend && $(PYTHON) -m alembic check

build: ## Build the frontend production bundle
	cd frontend && $(NPM) run build
