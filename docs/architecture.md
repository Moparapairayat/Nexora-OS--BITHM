# Architecture

Nexora OS is organized as a small set of deployable applications backed by
shared contracts and configuration. Runtime code belongs to an application or
service; reusable, side-effect-free code belongs to a package.

## System boundaries

| Area              | Responsibility                                                                  | Depends on                        |
| ----------------- | ------------------------------------------------------------------------------- | --------------------------------- |
| `apps/web`        | Next.js user experience and browser-side API clients                            | `@nexora/config`, `@nexora/types` |
| `apps/api`        | Authentication, administration, Developer Tools, AcademicShield, and operations | Prisma and shared packages        |
| `services/ml-nlp` | Isolated plagiarism, writing-risk, and ML operations                            | FastAPI and Python ML libraries   |
| `packages/config` | Shared catalogs and runtime-safe configuration                                  | `@nexora/types`                   |
| `packages/types`  | Cross-workspace TypeScript contracts                                            | No application code               |
| `packages/ui`     | Reusable presentation primitives                                                | No feature or server code         |
| `prisma`          | Database schema, migrations, and seed ownership                                 | PostgreSQL                        |

The web application communicates with the API over HTTP. The API is the trust
boundary for authorization and data access; browser input must never bypass its
validation. The API calls the ML/NLP service over HTTP so Python dependencies
remain isolated from the Node.js workspaces.

Academic Work, AI Workspace, ML & Data, Content Studio, Feedback, Activity,
Notifications, ERD to Code, API Tester, GitHub Analyzer, and Deployment
Assistant are roadmap-only frontend sections. Their routes render a shared
Coming Soon page and intentionally have no feature API handlers, simulation
layer, or database persistence.

## Runtime topology

```text
Browser :3000
    |
    +---------------------------------------+
    v                                       v
Express API :8311 --> FastAPI ML/NLP :8010  apps/web /api/* route handlers
    |                                       |
    +-------------------+-------------------+
                        v
        PostgreSQL (Neon Serverless) — single shared database
```

`apps/api` is the trust boundary for institutional/admin concerns
(authentication, RBAC, Academic Shield, operations). Code execution and
AI-assisted features are served directly by `apps/web`'s own Next.js route
handlers, which authenticate against the same Neon database rather than
proxying through `apps/api` — see [Neon Database Migration](NEON_DATABASE_MIGRATION.md).

Code execution is a separate security boundary. Supported Code Lab workloads
run in short-lived Docker containers with network access disabled and explicit
CPU, memory, process, and timeout limits.

## Dependency rules

- Applications may import shared packages; shared packages must not import an
  application.
- Web features should not import API implementation files. Share only contracts
  that are stable across the HTTP boundary.
- Feature-specific components, hooks, schemas, and services stay together under
  their feature folder. Promote code to a shared package only after it has a
  genuine cross-workspace consumer.
- Database access stays behind API data-access boundaries. The web and ML/NLP
  services do not connect directly to PostgreSQL.
- Environment-specific values come from environment variables, never committed
  secrets or source constants.

## Local state

There is no local PostgreSQL container — every environment (local
development included) connects to the same Neon Serverless PostgreSQL
database via `DATABASE_URL`/`DIRECT_URL`, configured identically in the root
`.env` and `apps/web/.env`. Generated output, caches, logs, uploads, and local
environment files are intentionally excluded from Git.
