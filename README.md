# DevPilot AI

DevPilot AI is a DevOps-platform foundation built with Next.js, FastAPI, PostgreSQL, and optional Redis. It currently provides secure, cookie-based authentication and account-scoped incident management in a polished operations workspace.

The broader product vision is an AI-assisted DevOps workspace that can investigate failures across developer tools. That vision is documented in [ProjectIdea.md](./ProjectIdea.md); integrations, AI investigation, streaming chat, and MCP functionality are planned work, not simulated production features.

## Current capabilities

- Register, sign in, refresh, and sign out using HTTP-only JWT cookies.
- Create, list, and retrieve incidents scoped to the signed-in account.
- Run PostgreSQL schema migrations with Alembic.
- Use Redis optionally for local development readiness checks.

The dashboard also contains UI foundations for repositories, deployments, infrastructure, monitoring, alerts, audit logs, settings, and chat. Their backend integrations are intentionally not implemented yet.

## Technology stack

| Area | Technology |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Backend | FastAPI, SQLAlchemy 2 async, Pydantic 2, Alembic |
| Persistence | PostgreSQL via asyncpg |
| Authentication | JWTs in HTTP-only browser cookies |
| Cache | Redis, optional during local development |
| Automation | GitHub Actions validation workflow |

## Architecture

```text
Browser (Next.js, localhost:3000)
        |
        | credentialed HTTP requests
        v
FastAPI API (localhost:8000)
        |
        +--> PostgreSQL (users and incidents)
        |
        +--> Redis (optional readiness dependency)
```

The frontend calls `/api/v1/auth/*` for session management and `/api/v1/incidents` for the persisted feature set. FastAPI exposes interactive API documentation at `/docs` in development.

## Quick start

Follow the full Windows/PowerShell guide in [RUNNING.md](./RUNNING.md), or use the focused guides below:

- [Setup](./commands/setup.md)
- [Development](./commands/development.md)
- [Validation](./commands/validation.md)
- [Troubleshooting](./commands/troubleshooting.md)

At minimum, configure both local environment files, start PostgreSQL, apply migrations, then run the backend and frontend in separate terminals.

## Repository layout

```text
backend/     FastAPI application, Alembic migrations, and integration tests
frontend/    Next.js application and UI components
commands/    Developer setup, operating, validation, and troubleshooting guides
.github/     Continuous-integration workflow
RUNNING.md   Complete local Windows setup guide
```

## Available commands

The authoritative PowerShell commands are in [RUNNING.md](./RUNNING.md). On systems with GNU Make, the root [Makefile](./Makefile) also provides `setup`, `frontend`, `backend`, `check`, `test`, `db-migrate`, `db-check`, and `build` targets.

## Security and configuration

Local secrets belong only in `backend/.env` and `frontend/.env.local`; both are ignored by Git. Start from the corresponding `.env.example` files and never commit real JWT secrets, API tokens, database credentials, or private service URLs.

For local development, the API allows `http://localhost:3000` through CORS. Production deployment needs its own environment values, HTTPS, restrictive trusted hosts/CORS origins, and securely managed secrets. See [SECURITY.md](./SECURITY.md) for reporting and deployment guidance.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a change. In particular, keep generated files and local configuration out of commits, review Alembic migrations, and run the relevant validation commands.

## License

This project is licensed under the [MIT License](./LICENSE).
