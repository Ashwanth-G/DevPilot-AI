-- DevPilot AI
-- Local PostgreSQL permission repair
--
-- Purpose:
-- Grants the application role `devpilot` the permissions required
-- to access the `public` schema, existing tables/sequences, and
-- future tables/sequences created by the `postgres` role.
--
-- Run as a PostgreSQL administrator:
-- psql -U postgres -d devpilot -f backend/repair_local_database_permissions.sql

GRANT USAGE ON SCHEMA public TO devpilot;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO devpilot;

GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO devpilot;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL PRIVILEGES ON TABLES TO devpilot;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
GRANT ALL PRIVILEGES ON SEQUENCES TO devpilot;