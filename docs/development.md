# Development guide

## Prerequisites

- Node.js 22 or later and npm
- Docker Desktop with Compose v2
- Python 3.12 or later for `services/ml-nlp`

Install JavaScript dependencies once at the repository root with `npm ci`. npm
workspaces link the applications and shared packages; do not install separate
dependency trees inside `apps/*`.

## Environment setup

Copy `.env.example` to `.env` and replace `JWT_SECRET` plus any bootstrap
credentials. Real `.env` files are local-only.

For host-based development, start the persistent database and prepare Prisma:

```bash
npm run db:generate
docker compose -f compose.database.yaml up -d
npm run db:push
npm run db:seed
```

The database-only stack uses `.docker-data/postgres`. Stop it without deleting
data by running:

```bash
docker compose -f compose.database.yaml down
```

Do not add `--volumes` or delete `.docker-data` unless a database reset is
intentional.

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

Run the complete containerized stack with `docker compose up --build`. Compose
automatically reads `compose.yaml`.

## Verification

Run these checks from the repository root before handing off a structural or
cross-workspace change:

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
docker compose config --quiet
docker compose -f compose.database.yaml config --quiet
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
