# 🌐 Nexora OS (BITHM) — Master Project Engineering Report

> **Document Purpose:** A high-level executive dossier for Nexora OS — the
> single entry point for architects, evaluators, and reviewers who need the
> big picture before drilling into a specific area. Each section below is
> intentionally short and links out to the document that owns the full detail,
> so information lives in exactly one place across `docs/`.

---

## 📑 Executive Summary

* **Project Name:** Nexora OS (BITHM Edition)
* **Tagline:** Multi-model AI academic operating system for higher-education assignments, laboratory work, academic integrity, and coding environments.
* **Target Standards:** UK OTHM Qualifications (Level 4, 5, 7) and Pearson BTEC Higher Nationals.
* **Architecture Pattern:** npm-workspaces monorepo — Next.js 16 (React 19) frontend, Express.js 5 REST API, Python FastAPI ML/NLP microservice, and a PostgreSQL (Neon) data layer via Prisma 6.

```
+---------------------------------------------------------------------------------------------------------+
|                                        NEXORA OS ARCHITECTURE                                            |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                           |
|  [ FRONTEND — Next.js 16 & React 19 ]                                                                    |
|  ├── Academic Shield (Plagiarism, AI Stylometrics, Citation Engine, Web Scanner)                         |
|  ├── Code Lab & Monaco IDE (In-Browser Code Execution, Test Runner)                                      |
|  ├── Role-Based Dashboards (Student, Teacher, Admin, Super Admin)                                        |
|  └── Data Hub, Skill DNA, Learning Roadmap & Portfolio Builder                                           |
|                                     │                                                                    |
|                                     ▼ (REST API / JSON Web Tokens / CORS)                                |
|  [ CORE BACKEND API — Express.js 5 / Node.js 20+ ESM ]                                                   |
|  ├── Auth & RBAC Middleware (JWT, bcrypt)                                                                |
|  ├── Academic Shield Service, Admin, Ops, Data, Uploads modules                                          |
|                  │                                                  │                                    |
|                  ▼ (Prisma ORM Client v6)                           ▼ (HTTP / Internal Microservice)     |
|  [ DATABASE — PostgreSQL (Neon) ]                [ ML/NLP MICROSERVICE — Python & FastAPI ]               |
|  ├── 30+ Relational Schemas                      ├── TF-IDF, Cosine Similarity, Sentence-Transformers    |
|  └── Assignments, Submissions, Lab Tasks, Logs   └── N-Gram Shingling & Burstiness Calculators            |
|                                                                                                           |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🛠️ Tech Stack & Dependency Audit

The complete, 100%-audited dependency list (every package, every workspace,
exact versions) lives in the root **[README — Complete Dependency Audit](../README.md#-tech-stack--engineering-tools)**
to avoid maintaining the same table in two places. Layer summary:

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend API | Express.js 5, JWT auth, Helmet, rate limiting |
| Database | PostgreSQL (Neon Serverless), Prisma ORM 6 |
| ML/NLP | Python, FastAPI, scikit-learn, Sentence-Transformers |

---

## 📁 Directory Structure

The fully annotated directory map lives in **[Project Structure](project-structure.md)**
and **[Project Deliverables — Folder Structure](PROJECT_DELIVERABLES.md#️-folder-structure)**.

---

## 🔍 Feature Modules & Implementation Status

| Module | Status | Detail |
|---|---|---|
| **Academic Shield** (plagiarism, AI-writing risk, citations, web-source scan) | Implemented | [Mathematical Foundations](MATHEMATICAL_FOUNDATIONS.md) |
| **Code Lab & Monaco IDE** (in-browser execution, test runner, lab reports) | Implemented | [Piston Code Execution Engine](PISTON_CODE_EXECUTION_ENGINE.md) |
| **Role-Based Dashboards & RBAC** (Student / Teacher / Admin / Super Admin) | Implemented | [Architecture](architecture.md) |
| **Skill DNA, Learning Roadmap, Portfolio Builder, Data Hub** | Implemented core, extensible | Root [README — Platform Modules](../README.md#-platform-modules) |
| Academic Work, AI Workspace, ML & Data, Content Studio, and other roadmap sections | Frontend-only "Coming Soon" placeholders | Root [README — Roadmap](../README.md#️-roadmap) |

---

## 🗄️ Database

Nexora OS uses **PostgreSQL (Neon Serverless)** via **Prisma ORM 6**, with 30+
relational models covering users/RBAC, Academic Shield reports, courses,
assignments, lab tasks, and code workspaces. Full schema ownership and the
Docker → Neon migration history are documented in
**[Neon Database Migration](NEON_DATABASE_MIGRATION.md)**; the schema itself
is the single source of truth at [`prisma/schema.prisma`](../prisma/schema.prisma).

---

## 📐 Mathematical Foundations

Every equation behind Academic Shield's scoring — TF-IDF, Cosine Similarity,
N-Gram/Jaccard, Burstiness (CV), Shannon Entropy, and Levenshtein Distance —
is documented with full proofs and empirical validation in
**[Mathematical Foundations](MATHEMATICAL_FOUNDATIONS.md)**.

---

## 🚀 DevOps & Deployment

* **Local development:** `npm run dev` runs the web, API, and ML/NLP services concurrently — see the root [README — Getting Started](../README.md#️-getting-started).
* **Verification:** `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` — see [Development Guide](development.md#verification).
* **Production deployment:** Vercel (`vercel.json`) for the Next.js frontend; Render (`render.yaml`) for the Express API and FastAPI ML service.

---

## 🎯 Verification Status

| Check | Result |
|---|---|
| API / shared package typecheck (`npm run typecheck`) | Clean |
| Web workspace typecheck | Clean |
| Prisma schema validation | Valid |
| ESLint (web workspace) | See [Development Guide](development.md#verification) for the current run |

---

*Nexora OS — Academic Systems Engineering.*
