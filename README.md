# Nexora OS

Nexora OS is a multi-model academic workspace for assignments, labs, reports,
coding, academic-integrity review, and institution operations. The repository is
an npm monorepo with a Next.js web app, an Express API, shared TypeScript
packages, a Prisma/PostgreSQL data layer, and a FastAPI ML/NLP service.

## Repository layout

```text
apps/
  api/                 Express API
  web/                 Next.js App Router frontend
packages/
  config/              Shared model and runtime configuration
  types/               Shared TypeScript contracts
  ui/                  Shared UI package
prisma/                Schema, migrations, and seed data
services/
  ml-nlp/
    app/               FastAPI application package
docs/
  architecture.md      System boundaries and runtime topology
  development.md       Setup, conventions, and verification
compose.yaml           Complete local stack
compose.database.yaml  Database-only development stack
```

## Quick start

Prerequisites: Node.js 22+, npm, Docker Desktop, and Python 3.12+ for the ML/NLP
service.

1. Install the JavaScript workspace from the committed lockfile:

   ```bash
   npm ci
   ```

2. Copy `.env.example` to `.env`, then replace the development secrets.

3. Prepare Prisma and start the persistent development database:

   ```bash
   npm run db:generate
   docker compose -f compose.database.yaml up -d
   npm run db:push
   npm run db:seed
   ```

4. Install the optional ML/NLP runtime in a Python virtual environment:

   ```bash
   python -m venv .venv
   # Activate .venv for your shell, then run:
   python -m pip install -r services/ml-nlp/requirements.txt
   ```

5. Start the services in separate terminals, or activate the Python environment
   and run `npm run dev` to start all three:

   ```bash
   npm run dev:web
   npm run dev:api
   npm run dev:ml
   ```

Local endpoints:

- Web: `http://localhost:3000`
- API health: `http://localhost:8311/api/health`
- ML/NLP health: `http://localhost:8010/health`
- Database-only PostgreSQL: `localhost:5433`

## Roadmap-only modules

Academic Work, AI Workspace, ML & Data, Content Studio, Feedback, Activity,
Notifications, ERD to Code, API Tester, GitHub Analyzer, and Deployment
Assistant currently render dedicated **Coming Soon** pages. These sections are
frontend-only placeholders: they do not call an API, use simulated responses,
or persist data.

The active API remains focused on authentication, administration, dashboards,
Developer Tools, AcademicShield, operations, uploads, and the Data Hub.

## Docker Compose

Start the complete containerized stack with the default `compose.yaml`:

```bash
docker compose up --build
```

The complete stack exposes PostgreSQL on `5432`; the database-only development
stack intentionally uses `5433` so it can coexist with another local PostgreSQL
instance. Its data is stored under `.docker-data/postgres` and is ignored by Git
and Docker build contexts.

## Common commands

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start web, API, and ML/NLP development servers |
| `npm run build`        | Build all buildable TypeScript workspaces      |
| `npm run lint`         | Lint the web workspace                         |
| `npm run typecheck`    | Type-check the shared packages and API         |
| `npm run format:check` | Check supported files with Prettier            |
| `npm run db:generate`  | Generate the Prisma client                     |
| `npm run db:push`      | Apply the schema to a development database     |
| `npm run db:seed`      | Seed roles and development accounts            |

## Development access

When `NEXORA_DEMO_LOGIN_ENABLED=true`, the seed includes these local-only
accounts:

- Student: `student@nexora.local` / `password123`
- Teacher: `teacher@nexora.local` / `password123`
- Admin: `admin@nexora.local` / `password123`

Never enable demo credentials in a production environment. Set a strong
`JWT_SECRET` and bootstrap administrator password before deployment.

## Documentation

- [Architecture](docs/architecture.md)
- [Development guide](docs/development.md)

Code Lab executes supported programs in constrained Docker sandboxes with no
network access and resource limits. Pre-pull the configured Python and Node
images when `CODE_RUN_DOCKER_PULL_POLICY=never`.
