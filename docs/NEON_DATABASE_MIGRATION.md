# 🚀 Nexora OS — Production Database Migration Guide (Docker → Neon PostgreSQL)

Welcome to the official documentation for the **Nexora OS Database Migration** to **Neon Serverless PostgreSQL**.

---

## 📌 1. Executive Summary

This guide outlines the production migration of Nexora OS from local Docker PostgreSQL to **Neon Serverless PostgreSQL**.

### Key Architectural Changes:
* **Zero Docker Requirement**: Completely removed `compose.yaml`, `compose.database.yaml`, `.docker-data`, and local Postgres container dependencies.
* **Dual Connection String Strategy**:
  * **`DATABASE_URL`**: Transaction pooled connection (Neon Connection Pooler with `sslmode=require`) for fast runtime application queries.
  * **`DIRECT_URL`**: Direct session connection for Prisma CLI schema migrations, DDL statements, and database seeding.
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
          (DIRECT_URL)                      (DATABASE_URL)
                  |                                 |
                  v                                 v
        +------------------+              +-------------------+
        |   Neon Direct    |              |  Neon Connection  |
        | Session Compute  |              |      Pooler       |
        +--------+---------+              +---------+---------+
                 |                                  |
                 +----------------+-----------------+
                                  v
                      +------------------------+
                      |   Neon PostgreSQL DB   |
                      | (Serverless AWS Cloud) |
                      +------------------------+
```

---

## 🔑 3. Environment Variables Configuration

Declare the following environment variables in `.env`:

```env
# ==============================================================================
# Neon PostgreSQL Connection Strings
# ==============================================================================

# Transaction Pooled Connection - Used for runtime app queries
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]-pooler.[REGION].aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct Session Connection - Used for Prisma CLI migrations & schema push
DIRECT_URL="postgresql://neondb_owner:[PASSWORD]@[HOST].[REGION].aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

---

## 🛠️ 4. Prisma Schema Configuration

The Prisma schema (`prisma/schema.prisma`) is configured with dual datasources for full connection pool compatibility:

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

### Step 1: Deploy Schema Migrations to Neon
Run the direct Prisma schema push to create all tables, indexes, cascade rules, and enums in Neon PostgreSQL:
```bash
npm run db:push
```

### Step 2: Seed Academic Data into Neon
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
