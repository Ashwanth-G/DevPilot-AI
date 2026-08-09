# DevPilot AI

DevPilot AI is an AI-assisted DevOps workspace designed to help engineering teams understand and manage software-delivery incidents from one place. It combines a modern web dashboard with a secure FastAPI service, PostgreSQL persistence, and a foundation for future AI-agent and Model Context Protocol (MCP) integrations.

> **Current status:** the authentication and incident-management foundation is working today. AI investigation, third-party DevOps integrations, remediation, and MCP servers are planned capabilities; they are not presented as implemented production features.

## Table of contents

- [Project purpose](#project-purpose)
- [What works today](#what-works-today)
- [Product roadmap](#product-roadmap)
- [Architecture](#architecture)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local setup](#local-setup-windowspowershell)
- [Running the application](#running-the-application)
- [API reference](#api-reference)
- [Database and migrations](#database-and-migrations)
- [Validation and CI](#validation-and-ci)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Security, contributing, and license](#security-contributing-and-license)

## Project purpose

Modern delivery teams must move among source control, CI/CD dashboards, container platforms, cloud consoles, observability tools, terminals, and logs to diagnose even a single failed deployment. That context switching makes investigation slow, especially when the real cause is distributed across several systems.

DevPilot AI aims to become the operational layer above those tools. A developer should be able to ask a question such as:

> Why did yesterday's production deployment fail?

The long-term assistant will collect relevant evidence from approved sources, correlate signals, explain a likely root cause, recommend a fix, and require explicit approval before any operational action. The goal is to make DevOps troubleshooting faster, more understandable, and safer for teams of every experience level.

## What works today

The runnable application currently provides:

- Account registration, login, refresh, logout, and current-user checks.
- HTTP-only JWT cookies with separate access and refresh signing keys.
- PostgreSQL-backed users and incidents managed through Alembic migrations.
- Account-scoped incident creation, listing, filtering, and retrieval.
- A Next.js operations dashboard with login, registration, profile, dashboard, and incident screens.
- Health (`/health`), readiness (`/ready`), and Prometheus metrics (`/metrics`) endpoints.
- Optional Redis readiness support; Redis is disabled by default for local development.
- Frontend type checking, linting, production build checks, backend tests, Ruff checks, and Alembic schema checks in GitHub Actions.

The dashboard also contains user-interface foundations for repositories, deployments, infrastructure, monitoring, alerts, audit logs, settings, and chat. Except for authentication and incidents, these areas are not connected to a complete backend integration yet.

## Product roadmap

The intended DevPilot AI platform will add these capabilities incrementally:

| Area | Planned capability |
| --- | --- |
| AI investigation | Interpret a natural-language incident question and coordinate focused investigation tasks. |
| MCP integration layer | Discover and use authorised tool capabilities through standard MCP servers. |
| Source control and CI/CD | Inspect repositories, pull requests, commits, workflow runs, and deployment logs. |
| Runtime and cloud | Gather Docker, Kubernetes, server, and cloud-resource evidence. |
| Observability | Correlate logs, metrics, traces, alerts, and dashboards. |
| Safe remediation | Propose a rollback, restart, configuration change, or other action; execute only after approval. |
| Auditability | Record investigations, evidence, decisions, and approved actions for review. |
| Proactive operations | Detect trends, identify likely risks before deployments, and recommend cost or reliability improvements. |

The target agent model is deliberately specialised: a planner coordinates requests while domain agents focus on source control, containers, Kubernetes, cloud infrastructure, monitoring, security, and documentation. This reduces the context each agent needs and makes permissions and failures easier to isolate.

## Architecture

### Current runnable architecture

```text
Browser — Next.js web application (http://localhost:3000)
    |
    | Credentialed HTTP requests; HTTP-only session cookies
    v
FastAPI API (http://127.0.0.1:8000/api/v1)
    |
    +-- PostgreSQL 16+ — users, incidents, and Alembic migration history
    |
    +-- Redis (optional) — readiness dependency when explicitly enabled
```

The frontend reads `NEXT_PUBLIC_API_URL` and calls the versioned API. CORS permits the local frontend origin by default. In development, FastAPI exposes interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### Intended platform architecture

```text
Developer
    |
    v
DevPilot web workspace
    |
    v
API, identity, audit trail, and agent supervisor
    |
    +-- Planner agent
    |     +-- Git/CI agent
    |     +-- Container and Kubernetes agent
    |     +-- Cloud and monitoring agent
    |     +-- Security and documentation agent
    |
    v
Authorised MCP servers and DevOps systems
    |
    +-- Source control, CI/CD, containers, clusters, cloud, logs, metrics
```

All future write actions must flow through an approval step and be auditable. The current codebase does not yet execute those integrations or actions.

## Technology stack

| Layer | Technology | How it is used |
| --- | --- | --- |
| Web framework | Next.js 16, React 19, TypeScript 5 | App Router dashboard, authenticated views, and typed client code. |
| Styling and UI | Tailwind CSS 4, Radix UI, shadcn/ui patterns | Accessible reusable controls, layouts, dialogs, forms, and dashboard components. |
| Client state and data | Zustand, TanStack React Query | Client-side session state and server-data fetching foundations. |
| Forms and validation | React Hook Form, Zod, `@hookform/resolvers` | Form handling and client-side input validation. |
| Data presentation | Recharts, Lucide React, date-fns, Framer Motion | Charts, icons, dates, and interface motion. |
| API framework | FastAPI, Uvicorn | Async HTTP API, OpenAPI schema, interactive development docs, health checks. |
| Data access | SQLAlchemy 2 async, asyncpg | Async PostgreSQL ORM and database driver. |
| Schema migration | Alembic | Versioned database schema migrations and schema-consistency checks. |
| Backend validation | Pydantic 2, pydantic-settings, email-validator | Typed request models and environment-based configuration. |
| Authentication | python-jose, bcrypt | HS256 JWT creation/validation, bcrypt password hashing, HTTP-only cookies. |
| Cache/readiness | Redis with hiredis | Optional readiness dependency for local and future runtime use. |
| Observability | Loguru, Prometheus FastAPI Instrumentator | Structured production logs, rotating development logs, and metrics endpoint. |
| Testing and quality | pytest, pytest-asyncio, Ruff, Jest, ESLint, TypeScript | Backend integration tests, static analysis, frontend test foundation, linting, and type checks. |
| Automation | GitHub Actions | Validates frontend and backend changes on pushes and pull requests to `main`. |

## Project structure

```text
DevPilot-AI/
├── .github/workflows/ci.yml              # Frontend and backend CI validation
├── backend/
│   ├── app/
│   │   ├── api/v1/                       # Versioned FastAPI route modules
│   │   ├── agents/                       # Future agent orchestration foundation
│   │   ├── core/                         # Settings, database, Redis, security
│   │   ├── middleware/                   # Telemetry and rate-limit middleware
│   │   ├── models/                       # SQLAlchemy user and incident models
│   │   └── schemas/                      # Pydantic API schemas
│   ├── alembic/versions/                 # Ordered database migrations
│   ├── tests/                            # Authentication and incident integration tests
│   ├── .env.example                      # Safe backend configuration template
│   ├── pyproject.toml                    # Python dependencies and tool settings
│   └── repair_local_database_permissions.sql
├── frontend/
│   ├── src/app/                          # Next.js routes and layouts
│   ├── src/components/                   # Feature and shared UI components
│   ├── src/stores/                       # Client state stores
│   ├── src/types/                        # Shared TypeScript types
│   ├── .env.example                      # Safe frontend configuration template
│   └── package.json                      # Scripts and JavaScript dependencies
├── .editorconfig                         # Editor consistency rules
├── .gitignore                            # Local files and generated-output rules
├── Makefile                              # GNU Make development shortcuts
└── README.md                             # This self-contained project guide
```

## Prerequisites

| Tool | Supported version | Required for |
| --- | --- | --- |
| Node.js | 20 or newer | Next.js frontend and npm scripts. |
| Python | 3.11, 3.12, or 3.13 | FastAPI backend and tooling. |
| PostgreSQL | 16 or newer | Local users, incidents, and migrations. |
| PowerShell | Windows instructions below | Local command examples. |
| Redis | Optional | Only needed when `REDIS_ENABLED=true`. |

## Local setup (Windows/PowerShell)

### 1. Create a local PostgreSQL database

Open a PostgreSQL `psql` session as an administrator and run the following once:

```sql
CREATE USER devpilot WITH PASSWORD 'devpilot';
CREATE DATABASE devpilot OWNER devpilot;
```

If the user or database already exists, retain it and skip the matching command. You may choose a stronger password, but then update `DATABASE_URL` in `backend/.env` to match it.

### 2. Create environment files

From the repository root:

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

Generate two distinct secrets for the backend:

```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Run that command twice. Put one value in `JWT_SECRET_KEY` and the other in `JWT_REFRESH_SECRET_KEY` in `backend/.env`. Never commit `.env`, `.env.local`, database passwords, JWT secrets, API keys, or tokens.

### 3. Install dependencies

```powershell
py -3.11 -m venv backend\venv
.\backend\venv\Scripts\python.exe -m pip install --upgrade pip
.\backend\venv\Scripts\python.exe -m pip install -e ".\backend[dev]"

Set-Location frontend
npm.cmd install
Set-Location ..
```

`npm.cmd` avoids the PowerShell execution-policy issue that can prevent `npm.ps1` from running on Windows.

### 4. Apply database migrations

```powershell
Set-Location backend
.\venv\Scripts\python.exe -m alembic upgrade head
Set-Location ..
```

### 5. Start the backend and frontend

Follow the commands in the next section using two PowerShell terminals.

## Running the application

### Backend API

From the repository root, start the API in one terminal:

```powershell
Set-Location backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Useful service checks:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/health
Invoke-RestMethod http://127.0.0.1:8000/ready
```

Open `http://127.0.0.1:8000/docs` for the interactive API documentation while running in development mode.

### Frontend web application

In a second terminal, from the repository root:

```powershell
Set-Location frontend
npm.cmd run dev
```

Open `http://localhost:3000`, register an account, sign in, and create or view incidents. Incident records are only visible to the authenticated account that created them.

### GNU Make shortcuts

On a system with GNU Make, these root-level shortcuts are also available:

```text
make setup       # Install backend and frontend dependencies
make frontend    # Start the Next.js development server
make backend     # Start the FastAPI development server
make db-migrate  # Apply Alembic migrations
make db-check    # Validate migration/schema consistency
make check       # Run static checks
make test        # Run backend tests
make build       # Create a production frontend build
```

Use the PowerShell commands above when GNU Make is not installed.

## API reference

The API prefix is `/api/v1`. The following endpoints are implemented and persisted:

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/api/v1/auth/register` | No | Creates an account and starts a cookie-based session. |
| `POST` | `/api/v1/auth/login` | No | Verifies credentials and sets access and refresh cookies. |
| `POST` | `/api/v1/auth/refresh` | Refresh cookie | Rotates the cookie pair. |
| `GET` | `/api/v1/auth/me` | Access cookie | Returns the current account. |
| `POST` | `/api/v1/auth/logout` | No | Clears session cookies. |
| `GET` | `/api/v1/incidents` | Access cookie | Lists incidents belonging to the signed-in account; supports `limit` and `status`. |
| `POST` | `/api/v1/incidents` | Access cookie | Creates an incident with a title, optional description, and severity. |
| `GET` | `/api/v1/incidents/{incident_id}` | Access cookie | Retrieves one incident only when it belongs to the signed-in account. |
| `GET` | `/health` | No | Liveness response with the API version. |
| `GET` | `/ready` | No | Readiness response covering PostgreSQL and enabled Redis. |
| `GET` | `/metrics` | No | Prometheus-formatted application metrics. |

Route modules also exist for chat, repositories, deployments, infrastructure, monitoring, alerts, audit, approvals, and MCP registration. They are scaffolding only and must not be treated as completed integrations or production APIs.

## Database and migrations

Alembic owns the PostgreSQL schema. After changing SQLAlchemy models, generate, review, and apply a migration from `backend`:

```powershell
.\venv\Scripts\python.exe -m alembic revision --autogenerate -m "describe change"
.\venv\Scripts\python.exe -m alembic upgrade head
```

Review every generated migration before applying it. To inspect generated SQL without changing a database:

```powershell
.\venv\Scripts\python.exe -m alembic upgrade head --sql
```

### Repairing local database permissions

If a local database was initially migrated by an administrator but the application connects as `devpilot`, requests may fail with `permission denied for table users` (or another public table). Run this once as a PostgreSQL administrator:

```powershell
psql -U postgres -d devpilot -f backend\repair_local_database_permissions.sql
```

The repair script assigns the local public tables and sequences to the `devpilot` role. It does not delete user data. Replace `postgres` with the actual administrator role if necessary.

### Adopting a verified legacy local schema

Older versions created `users` and `incidents` directly on application startup. Only after inspecting or backing up that exact old schema, mark its baseline before upgrading:

```powershell
Set-Location backend
.\venv\Scripts\python.exe -m alembic stamp 20260809_01
.\venv\Scripts\python.exe -m alembic upgrade head
```

For a new database, always run `alembic upgrade head` directly; do not use `stamp`.

## Validation and CI

Run these commands from the repository root after configuring PostgreSQL and both local environment files:

```powershell
Set-Location frontend
npm.cmd run type-check
npm.cmd run lint
npm.cmd run build
npm.cmd test
Set-Location ..

Set-Location backend
.\venv\Scripts\python.exe -m pytest -q
.\venv\Scripts\python.exe -m ruff check .
.\venv\Scripts\python.exe -m alembic check
Set-Location ..
```

The backend tests are PostgreSQL integration tests. They create and clean up temporary users and incidents in the configured database, so use a disposable local development database rather than a shared environment.

GitHub Actions runs the frontend type check, lint, and production build, along with backend migrations, tests, Ruff, and Alembic checks against a temporary PostgreSQL 16 service on pushes and pull requests to `main`.

## Configuration

Start from the supplied environment templates. The safe defaults support the local commands above.

| File | Setting | Purpose |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | PostgreSQL connection string. It must use `postgresql+asyncpg://`. |
| `backend/.env` | `JWT_SECRET_KEY` | Non-empty secret for short-lived access-token signing. |
| `backend/.env` | `JWT_REFRESH_SECRET_KEY` | Different non-empty secret for refresh-token signing. |
| `backend/.env` | `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API. |
| `backend/.env` | `REDIS_ENABLED` | Set to `true` only when a reachable Redis instance is configured. |
| `backend/.env` | `REDIS_URL` | Redis connection URL when Redis is enabled. |
| `backend/.env` | `ENVIRONMENT` | `development`, `test`, `staging`, or `production`; production enables stricter defaults. |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | API origin used by the web application; locally `http://localhost:8000`. |

Production deployment needs HTTPS, restrictive CORS origins and trusted hosts, unique managed secrets, a production PostgreSQL database, and a review of every integration and permission before enabling it.

## Troubleshooting

### The browser reports a CORS error

Confirm the backend is running on port 8000 and that `backend/.env` contains:

```text
CORS_ORIGINS=http://localhost:3000
```

The API includes CORS headers even for server errors, so also inspect the backend terminal output for the underlying exception.

### `permission denied for table users`

The existing tables are owned by a PostgreSQL role other than the role in `DATABASE_URL`. Run the local permission repair once as an administrator:

```powershell
psql -U postgres -d devpilot -f backend\repair_local_database_permissions.sql
```

### `Authentication token signing is not configured`

Set non-empty, distinct `JWT_SECRET_KEY` and `JWT_REFRESH_SECRET_KEY` values in `backend/.env`, then restart the API.

### `/ready` returns `503`

PostgreSQL is unavailable or `DATABASE_URL` is incorrect. If `REDIS_ENABLED=true`, also ensure `REDIS_URL` is reachable. `/health` checks only whether the API process responds; `/ready` checks dependencies.

### Alembic migration errors

For a new database, run `alembic upgrade head`. Only use the legacy `alembic stamp 20260809_01` procedure when adopting the previously verified schema described in the database section above.

### PowerShell blocks `npm`

Use `npm.cmd install` and `npm.cmd run dev` rather than `npm` if PowerShell execution policy blocks `npm.ps1`.

## Security, contributing, and license

- Keep secrets, tokens, database credentials, private service URLs, and local environment files out of Git.
- Use a different strong value for each JWT secret; do not reuse the development examples in production.
- Review database migrations before applying them, and run validation relevant to each change.
- Treat the planned AI, MCP, and remediation features as privileged operations: integrate them only with scoped permissions, explicit approval, and an audit record.
- Contributions should preserve account-level incident isolation, avoid adding generated files or local configuration, and keep the documented current/roadmap distinction accurate.

This project is licensed under the [MIT License](LICENSE).
