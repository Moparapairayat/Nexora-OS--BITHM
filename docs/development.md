# Development guide

## Prerequisites

- Node.js 22 or later and npm
- Docker Desktop (used only to run the sandboxed Code Lab execution containers)
- Python 3.11 or later for `services/ml-nlp`

Install JavaScript dependencies once at the repository root with `npm ci`. npm
workspaces link the applications and shared packages; do not install separate
dependency trees inside `apps/*`.

## Environment setup

Copy `.env.example` to `.env` at the repository root **and** to
`apps/web/.env`, then fill in `DATABASE_URL` / `DIRECT_URL` (Neon PostgreSQL —
must be identical in both files, since `apps/web` runs its own Prisma queries),
a strong `JWT_SECRET` (also identical in both files), and your AI provider
keys. Never prefix a secret key with `NEXT_PUBLIC_`. Real `.env` files are
local-only.

The project uses **Neon Serverless PostgreSQL** in every environment — see
[Neon Database Migration](NEON_DATABASE_MIGRATION.md). There is no local
Docker database; prepare the schema directly against Neon:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Docker is only needed for Code Lab's sandboxed code execution containers
(`--network none`, memory/CPU/PID limits) — pull the configured runtime images
once with `docker pull python:3.12-alpine` and `docker pull node:22-alpine`.

Create the Python environment outside the service package so it remains shared
and ignored:

```bash
python -m venv .venv
# Activate .venv for your shell, then run:
python -m pip install -r services/ml-nlp/requirements.txt
```

Activate that environment before `npm run dev:ml` or `npm run dev`.

## Development commands

```bash
npm run dev:web   # http://localhost:3000
npm run dev:api   # http://localhost:8311
npm run dev:ml    # http://localhost:8010
```

Or start all three together with `npm run dev`.

## Verification

Run these checks from the repository root before handing off a structural or
cross-workspace change:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
npx prisma validate --schema prisma/schema.prisma
python -c "from pathlib import Path; import ast; p=Path('services/ml-nlp/app/main.py'); ast.parse(p.read_text(encoding='utf-8'), filename=str(p)); print('ML syntax OK')"
```

The repository does not yet expose a unified automated test command. Add tests
alongside new behavior and document the runner when the first suite is adopted.

## Conventions

- Use `kebab-case` for TypeScript/React source filenames and feature folders.
- Use `PascalCase` for React components and exported types; use `camelCase` for
  functions and values.
- Keep Next.js reserved filenames (`page.tsx`, `layout.tsx`) and dynamic segment
  syntax unchanged.
- Keep Python modules and packages in `snake_case`.
- Prefer feature-local modules over broad `utils` files. Split components and
  route handlers when they begin owning multiple unrelated responsibilities.
- Never commit generated output, local databases, logs, caches, uploads, or real
  environment files.

Formatting defaults are defined in `.editorconfig`; Prettier exclusions are in
`.prettierignore`.
