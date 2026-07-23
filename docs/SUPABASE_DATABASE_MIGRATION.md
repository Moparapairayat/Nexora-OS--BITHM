# 🚀 Nexora OS — Production Database Migration Guide (Docker → Supabase)

Welcome to the official documentation for the **Nexora OS Database Migration** to **Supabase PostgreSQL**.

---

## 📌 1. Executive Summary

This guide outlines the production migration of Nexora OS from local Docker PostgreSQL to **Supabase PostgreSQL**.

### Key Architectural Changes:
* **Zero Docker Requirement**: Completely removed `compose.yaml`, `compose.database.yaml`, `.docker-data`, and local Postgres container dependencies.
* **Dual Connection String Strategy**:
  * **`DATABASE_URL`**: Transaction pooled connection (Port 6543 / Supabase Transaction Pooler with `pgbouncer=true`) for fast runtime application queries.
  * **`DIRECT_URL`**: Direct session connection (Port 5432) for Prisma CLI schema migrations, DDL statements, and database seeding.
* **Supabase Storage Service**: Established modular storage architecture in `apps/web/src/lib/storage/supabase-storage.service.ts`.
* **Clean Repository & Service Pattern**: Established organized database repositories under `apps/web/src/lib/database/repositories/`.

---

## 🏗️ 2. Database Architecture & Connection Pooling

```
                     +---------------------------+
                     |    Nexora OS Application  |
                     |     (Next.js / Node.js)   |
                     +-------------+-------------+
                                   |
                  +----------------+----------------+
                  |                                 |
                  v                                 v
        Prisma CLI Migrations              Runtime App Queries
         (DIRECT_URL :5432)                (DATABASE_URL :6543)
                  |                                 |
                  v                                 v
        +------------------+              +-------------------+
        | Supabase Direct  |              | Supabase Connection|
        | Session Engine   |              | Transaction Pooler|
        +--------+---------+              +---------+---------+
                 |                                  |
                 +----------------+-----------------+
                                  v
                      +------------------------+
                      | Supabase PostgreSQL DB |
                      |    (Managed Cloud)     |
                      +------------------------+
```

---

## 🔑 3. Environment Variables Configuration

Declare the following environment variables in `.env` and `apps/web/.env`:

```env
# ==============================================================================
# Supabase PostgreSQL Connection Strings
# ==============================================================================

# Transaction Pooled Connection (Port 6543) - Used for runtime app queries
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct Session Connection (Port 5432) - Used for Prisma CLI migrations & schema push
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ==============================================================================
# Supabase API & Storage Configuration
# ==============================================================================
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key-here"
```

---

## 🛠️ 4. Prisma Schema Configuration

The Prisma schema (`prisma/schema.prisma`) is configured with dual datasources for full Supabase connection pool compatibility:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 🚀 5. Database Deployment & Seeding Workflow

### Step 1: Deploy Schema Migrations to Supabase
Run the direct Prisma schema push to create all tables, indexes, cascade rules, and enums in Supabase PostgreSQL:
```bash
npm run db:push
```

### Step 2: Seed Academic Data into Supabase
Run the automated seed script to populate users, courses, assignments, lab sessions, and RBAC permissions:
```bash
npm run db:seed
```

---

## 📁 6. Database Code Structure

```
apps/web/src/lib/
├── database/
│   ├── repositories/
│   │   ├── user.repository.ts         # User CRUD & Auth RBAC queries
│   │   ├── assignment.repository.ts   # Assignment briefs & submissions
│   │   └── index.ts
│   ├── services/
│   │   ├── database-connection.service.ts # Health check & latency monitor
│   │   └── index.ts
│   ├── types/
│   │   └── database.types.ts          # Database TypeScript interfaces
│   └── index.ts                       # Public database exports
├── storage/
│   └── supabase-storage.service.ts    # Supabase Storage bucket & upload architecture
└── prisma.ts                          # Singleton Prisma client instance
```

---

## 🔒 7. Authentication & RBAC Compatibility

The database migration preserves all existing RBAC (Role-Based Access Control) permissions and relationships:
* **Roles**: `STUDENT`, `TEACHER`, `ADMIN`, `SUPER_ADMIN`
* **Cascade Rules**: Cascading deletes for user portfolio, skill scores, code snippets, and lab reports.
* **Indexes**: Indexed foreign keys on `userId`, `assignmentId`, `labSessionId`, and `task` for sub-millisecond query performance.

---
*Nexora OS — Production Database Infrastructure.*
