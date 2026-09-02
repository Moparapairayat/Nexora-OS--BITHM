# 🌐 Nexora OS (BITHM) - Master Project Engineering Report & Exhaustive Technical Dossier
> **Document Purpose:** Complete, production-grade technical report detailing the entire Nexora OS architecture, full-stack tech stack with 100% dependency audit, complete annotated directory map, implemented vs. planned modules, mathematical models, database schemas, and DevOps workflows for ingestion by LLMs (Claude AI / GPT-4), senior architects, and academic evaluators.

---

## 📑 Executive Summary
* **Project Name:** Nexora OS (BITHM Edition)
* **Tagline:** Multi-Model AI Academic Operating System for Higher-Education Assignments, Laboratory Work, Academic Integrity, and Coding Environments.
* **Target Standards:** UK OTHM Qualifications (Level 4, 5, 7), Pearson BTEC Higher Nationals, and International Academic Integrity Standards.
* **Architecture Pattern:** Monorepo with npm Workspaces, Next.js 16 App Router Frontend, Express.js 5 RESTful Backend, Python 3.11 FastAPI NLP Microservice, and PostgreSQL ORM Layer via Prisma 6.

```
+---------------------------------------------------------------------------------------------------------+
|                                        NEXORA OS ARCHITECTURE                                           |
+---------------------------------------------------------------------------------------------------------+
|                                                                                                         |
|  [ FRONTEND - Next.js 16.2 & React 19.2 ]                                                               |
|  ├── Academic Shield (Plagiarism, AI Stylometrics Heatmap, Citation Engine, Web Scanner)               |
|  ├── Coding Lab & Monaco IDE (In-Browser Code Execution, Test Runner, Lab Evidence Generator)            |
|  ├── Role-Based Dashboards (Student, Teacher, Admin, Super Admin)                                      |
|  └── Data Hub, Skill DNA, Interactive Learning Roadmap & Portfolio Builder                             |
|                                     │                                                                   |
|                                     ▼ (REST API / JSON Web Tokens / CORS)                               |
|  [ CORE BACKEND API - Express.js 5 / Node.js 20+ ESM ]                                                  |
|  ├── Auth & RBAC Middleware (JWT, BCrypt)                                                               |
|  ├── Academic Shield Service (Plagiarism Engine, Stylometric AI Engine, Citation Engine)                |
|  ├── Code Lab Engine & File Upload Pipeline                                                             |
|  └── Admin, Metrics, Audit Logs, and User Management Modules                                            |
|                  │                                                  │                                   |
|                  ▼ (Prisma ORM Client v6)                           ▼ (HTTP / Internal Microservice)    |
|  [ DATABASE - PostgreSQL ]                       [ ML/NLP MICROSERVICE - Python 3.11 & FastAPI ]        |
|  ├── 30+ Relational Schemas                      ├── Scikit-Learn TF-IDF & Cosine Similarity Matrix     |
|  ├── Assignments, Submissions & Plagiarism Logs  ├── N-Gram Sliding Window Shingle Tokenizer            |
|  └── Lab Tasks, Test Cases & Audit Logs          └── Burstiness (CV) & Lexical Entropy Calculators      |
|                                                                                                         |
+---------------------------------------------------------------------------------------------------------+
```

---

## 🛠️ Complete 100% Tools & Technology Stack Audit

Below is the exhaustive, un-omitted list of **every single library, compiler, runtime, engine, and devtool** used across the Nexora OS monorepo:

### 🖥️ 1. Frontend & UI Engineering (`apps/web`)
| Package / Technology | Exact Version | Architectural Role & Purpose |
| :--- | :--- | :--- |
| **Next.js** | `16.2.9` | Core App Router framework, React Server Components (RSC), SSR, and edge route handlers. |
| **React** | `19.2.4` | React 19 core UI library with concurrent transitions, Server Actions, and hooks. |
| **React DOM** | `19.2.4` | Virtual DOM rendering and browser event delegation. |
| **TypeScript** | `5.9.3` | Full-stack strict static typing and compile-time contract enforcement. |
| **Tailwind CSS** | `^4.0.0` | Next-generation utility-first styling engine with native CSS variables and dark mode. |
| **@tailwindcss/postcss** | `^4.0.0` | PostCSS integration plugin for compiling Tailwind v4 directives. |
| **LightningCSS** | `1.32.0` | Ultra-fast Rust-based CSS transformer and minifier (`lightningcss-linux-x64-musl`). |
| **Tailwind Oxide** | `4.3.1` | Native Rust-powered parser for high-speed stylesheet generation. |
| **Babel React Compiler** | `1.0.0` | Automatic memoization of components and hooks (`babel-plugin-react-compiler`). |
| **Framer Motion** | `12.23.24` | Animation engine for fluid UI transitions, layout animations, and spring physics. |
| **Monaco Editor React** | `4.7.0` | React wrapper for the embedded VS Code editor (`@monaco-editor/react`). |
| **Monaco Editor Core** | `0.55.1` | In-browser multi-language IDE engine with syntax trees and autocompletion. |
| **Recharts** | `3.5.0` | Composable D3-based charting library for originality gauges, radar charts, and stats. |
| **Lucide React** | `0.555.0` | Comprehensive SVG iconography suite optimized for tree-shaking. |
| **TanStack React Query** | `5.90.11` | Asynchronous server-state management, cache invalidation, and optimistic UI updates. |
| **Zustand** | `5.0.8` | Minimalist, unopinionated client-side global state store. |
| **React Hook Form** | `7.67.0` | High-performance uncontrolled form state management with minimal re-renders. |
| **@hookform/resolvers** | `5.2.2` | Bridge integrating Zod validation schemas into React Hook Form. |
| **Zod** | `4.1.13` | Universal schema declaration and runtime data parsing engine. |
| **Class Variance Authority**| `0.7.1` | Type-safe declarative component variant management (`class-variance-authority`). |
| **clsx** | `2.1.1` | High-speed utility for constructing conditional `className` strings. |
| **tailwind-merge** | `3.4.0` | Intelligent resolution of conflicting Tailwind CSS utility classes. |
| **@alloc/quick-lru** | `5.2.0` | In-memory Least Recently Used (LRU) cache for fast keyword indexing. |
| **Next Font (Google)** | Built-in | Zero-layout-shift font optimization (Inter and JetBrains Mono). |
| **Next Image** | Built-in | Automated WebP/AVIF compression and responsive image sizing. |
| **ESLint & Next Config** | `^9.0`, `16.2.9` | Static code analysis and Next.js best-practice linting rules. |

---

### ⚙️ 2. Core Backend API (`apps/api`)
| Package / Technology | Exact Version | Architectural Role & Purpose |
| :--- | :--- | :--- |
| **Node.js Runtime** | `v20+ (ESM)` | Native ES Modules JavaScript runtime environment. |
| **Express.js** | `5.1.0` | High-performance RESTful web framework with async error handling. |
| **TSX** | `4.20.6` | TypeScript Execute & Watch engine for lightning-fast hot reloading. |
| **JSON Web Token (JWT)**| `9.0.2` | Cryptographic stateless token signing and verification (`jsonwebtoken`). |
| **BCrypt.js** | `3.0.2` | Blowfish cipher salt generation and secure password hashing. |
| **CORS** | `2.8.5` | Cross-Origin Resource Sharing middleware for API security. |
| **Dotenv** | `17.2.3` | Secure environment variable injection from `.env` configurations. |
| **Zod (API Schemas)** | `4.1.13` | Runtime HTTP request body, query param, and payload validation. |

---

### 🗄️ 3. Database, ORM & Seeding Layer (`prisma/`)
| Technology | Exact Version | Architectural Role & Purpose |
| :--- | :--- | :--- |
| **PostgreSQL** | `v16+` | ACID-compliant enterprise relational database with connection pooling. |
| **Prisma CLI** | `6.19.0` | Database schema migrations, introspection, and client generation. |
| **@prisma/client** | `6.19.0` | Type-safe auto-generated database query builder. |
| **Prisma Migrate** | Built-in | Declarative database migration tracking and deployment. |
| **Prisma Seed Runner** | `tsx` script | Automated mock data and production course syllabus seeding (`prisma/seed.ts`). |

---

### 🤖 4. Machine Learning & NLP Microservice (`services/ml-nlp/`)
| Technology | Exact Version | Architectural Role & Purpose |
| :--- | :--- | :--- |
| **Python** | `3.11+` | Core machine learning and statistical computing runtime. |
| **FastAPI** | `0.122.0` | High-performance asynchronous REST API framework for Python. |
| **Uvicorn** | `0.38.0` | Production-grade ASGI web server for asynchronous request handling. |
| **Scikit-Learn** | `1.7.2` | Machine learning vectorization, TF-IDF calculation, and Cosine similarity. |
| **NumPy** | `2.3.5` | High-performance multi-dimensional matrix operations and Euclidean norms. |
| **Pandas** | `2.3.3` | Structured data frames for shingle frequency and distribution analysis. |
| **Pydantic** | `2.12.5` | Data validation and settings management using Python type annotations. |

---

### 📦 5. Monorepo, DevTools, Presentation & DevOps
| Technology | Exact Version | Architectural Role & Purpose |
| :--- | :--- | :--- |
| **Concurrently** | `9.2.4` | Parallel multi-process manager for simultaneous Web, API, and ML dev runs. |
| **Prettier** | `3.6.2` | Opinionated code formatting across TS, TSX, CSS, JSON, and Markdown. |
| **Python-PPTX** | `1.0.2` | Automated PowerPoint slide deck generation (`.pptx`). |
| **XlsxWriter** | `3.2.9` | Excel spreadsheet export and reporting generation. |
| **LXML** | `6.1.2` | High-performance XML/HTML processing library for web scraping. |
| **Pillow (PIL)** | `12.2.0` | Imaging library for image processing and logo rasterization. |
| **Docker** | Engine `24+` | Containerization of the Python ML/NLP service (`Dockerfile`). |
| **Vercel** | Edge Platform | Automated CI/CD deployment configuration (`vercel.json`). |
| **Render** | Cloud Platform | Multi-service orchestration config for API and ML (`render.yaml`). |

---

## 📁 Complete Annotated Directory Structure

```text
Nexora OS- BITHM/
├── .env                              # Global environment variables
├── .env.example                      # Sample configuration keys
├── package.json                      # Root workspace configuration & scripts
├── package-lock.json                 # Lockfile for reproducible dependency tree
├── tsconfig.base.json                # Shared compiler configurations
├── render.yaml                       # Cloud deployment specification for Render
├── vercel.json                       # Edge deployment configuration for Vercel
│
├── apps/
│   ├── web/                          # Next.js 16 Frontend Web Application
│   │   ├── package.json              # Web dependencies
│   │   ├── tsconfig.json             # Web TypeScript configuration
│   │   ├── public/                   # Static assets & brand media
│   │   │   ├── brand/                # Nexora OS logo, 3D emblem, and favicon
│   │   │   └── landing/              # Marketing & university partner logos
│   │   └── src/
│   │       ├── app/                  # Next.js App Router (Layouts & Routes)
│   │       │   ├── layout.tsx        # Global Root Shell layout
│   │       │   ├── page.tsx          # Public Landing & Showcase
│   │       │   ├── globals.css       # Tailwind v4 directives & fluid keyframes
│   │       │   └── (features)/...    # Feature-specific page routes
│   │       ├── components/           # Reusable UI component library
│   │       │   ├── ui/               # Buttons, Badges, Modals, Cards, Inputs
│   │       │   ├── layout/           # AppShell, Navigation, Sidebar, Headers
│   │       │   └── brand/            # NexoraLogo and 3D Icon components
│   │       ├── features/             # Modular feature domains
│   │       │   ├── academic-shield/  # Plagiarism, AI Heatmap, Citations, Web Scan
│   │       │   ├── code-lab/         # Monaco IDE, Task Runners & Lab Reports
│   │       │   ├── dashboard/        # Multi-Role Dashboard views
│   │       │   ├── admin/            # User governance, courses & audit logs
│   │       │   ├── auth/             # Login, Register & Session management
│   │       │   ├── learning-roadmap/ # Curriculum paths & milestone tracks
│   │       │   ├── portfolio/        # Student project showcase builder
│   │       │   ├── skill-dna/        # Competency matrix & gap analysis
│   │       │   └── data-hub/         # Institutional analytics & reports
│   │       ├── services/             # API client & HTTP fetch wrappers
│   │       └── lib/                  # Utilities (clsx, tailwind-merge, cn)
│   │
│   └── api/                          # Express.js 5 RESTful Backend API
│       ├── package.json              # API dependencies (ESM modules)
│       ├── tsconfig.json             # API TypeScript configuration
│       └── src/
│           ├── server.ts             # Express application entry & port binding
│           ├── middleware/           # Auth (JWT), RBAC, Error & Upload middlewares
│           └── modules/              # Domain-driven backend modules
│               ├── academic-shield/  # Routes & Engines (Plagiarism, AI, Citations)
│               │   ├── services/     # Deterministic Math & Stylometric Services
│               │   └── academic-shield.routes.ts
│               ├── code-lab/         # Code compilation & test suite evaluation
│               ├── auth/             # Authentication & user profile endpoints
│               ├── dashboard/        # Role metrics & live telemetry
│               ├── admin/            # Institutional governance & user controls
│               └── data/             # Batch ingestion & export services
│
├── services/
│   └── ml-nlp/                       # Python 3.11 FastAPI NLP Microservice
│       ├── requirements.txt          # Python dependencies (FastAPI, Scikit, Pandas)
│       ├── Dockerfile                # Container definition
│       └── app/
│           └── main.py               # TF-IDF, Cosine Matrix & Shingling endpoints
│
├── packages/
│   ├── types/                        # Monorepo Shared TypeScript Definitions
│   │   ├── package.json
│   │   └── src/index.ts              # AcademicShieldReport, SourceMatch, UserRole, etc.
│   │
│   └── config/                       # Monorepo Shared Business Configurations
│       ├── package.json
│       └── src/index.ts              # Assessment rules, mock seeds & system defaults
│
├── prisma/                           # PostgreSQL Database Layer
│   ├── schema.prisma                 # 30+ Relational database schemas & enums
│   └── seed.ts                       # Database seeding runner (TSX)
│
└── docs/                             # Engineering & Academic Documentation
    ├── MATHEMATICAL_FOUNDATIONS.md   # Mathematical equations & proofs
    ├── MATHEMATICAL_PRESENTATION_SLIDES.md # Slide deck with presenter notes
    ├── NEXORA_OS_MASTER_PROJECT_REPORT.md  # Master engineering audit dossier
    └── Nexora_OS_Mathematical_Architecture.pptx # 16:9 Widescreen PowerPoint Deck
```

---

## 🔍 Deep Dive: Feature Modules & Implemented vs. Roadmap Status

### 🛡️ 1. Academic Shield Suite (100% Implemented & Production Ready)
* **Plagiarism Checker Page (`/academic-shield`):**
  - Real document canvas with dual interactive modes (`Highlighted View` vs `Edit Text`).
  - Unified sentence-level marker pen rendering:
    - **AI Writing Flags:** Soft Rose Pastel (`bg-[#fee2e2] text-[#991b1b]`).
    - **Plagiarism Overlaps:** Soft Amber Pastel (`bg-[#fef3c7] text-[#92400e]`).
    - **Organic Human Text:** Clean, unhighlighted body text.
  - Turnitin-grade Diff Inspection Drawer on sentence click.
  - Interactive Filter Pills: `[✨ All Highlights]`, `[🔴 AI Risk]`, `[🟡 Plagiarism]`.
  - 1-Click `[⚡ Auto-Fix]` Citation generator integrated into source match cards.
  - Exact Copyleaks / QuillBot style floating liquid squircle processing badge with Nexora "N" emblem and animated fluid wave mechanics.
* **Citation Generator Page (`/academic-shield/citations`):**
  - Harvard, APA 7th, IEEE, and MLA auto-formatting engines.
  - DOI / URL / Title metadata extraction.
  - Dynamic Reference Library with 1-click Copy & Markdown Export.
  - Clean empty state with sample source loaders.
* **Academic Rewrite Studio (`/academic-shield/rewrite`):**
  - Stylistic academic paraphrasing engine (Formal, Academic Tone, Concise, Critical Analysis).
  - Side-by-side split comparison with inline additions (green) and deletions (red).
* **Web-Source Deep Scanner (`/academic-shield/web-scan`):**
  - Target URL live scraper with HTML tag elimination.
  - Cosine semantic similarity matrix between URL content and student submission.

### 💻 2. Coding Lab & Monaco IDE (100% Implemented)
* **In-Browser Multi-Language IDE:** Monaco Editor integration supporting TypeScript, JavaScript, Python, C++, and SQL.
* **Automated Unit Test Evaluation:** Public and hidden test case runner with execution time, memory benchmarks, and stack trace logs.
* **Lab Report Generator:** Converts passed code execution benchmarks into formatted OTHM evidence reports.

### 📊 3. Role-Based Dashboards & RBAC (100% Implemented)
* **Student Dashboard:** Track pending assignments, plagiarism pre-check scores, lab completions, and feedback.
* **Teacher / Assessor Dashboard:** Grade submissions with Pass/Refer rubric decisions, inline annotations, and similarity threshold alerts.
* **Institutional Admin Dashboard:** User provisioning, faculty assignment, course syllabus management, and systemic integrity metrics.

### 📈 4. Institutional Analytics, Roadmap & Skill DNA (Implemented Core + Extensible)
* **Learning Roadmap:** Interactive hierarchical curriculum tree with prerequisite dependencies.
* **Skill DNA:** Radar chart competency mapping across academic, coding, and analytical domains.
* **Portfolio Builder:** Public showcase generator for student project repositories.

---

## 🗄️ Database Architecture & Prisma Relational Schema

Nexora OS utilizes **PostgreSQL** via **Prisma ORM v6** with strict relational integrity. Key schemas include:

1. **User & Authentication Models:**
   - `User` (`id`, `email`, `passwordHash`, `role: UserRole`, `status: UserStatus`, `createdAt`).
   - `Profile` (`userId`, `fullName`, `studentId`, `institution`, `avatarUrl`, `bio`).
2. **Academic Shield & Plagiarism Models:**
   - `PlagiarismCheck` (`id`, `userId`, `submissionId`, `overallSimilarity`, `aiRiskScore`, `verdict`, `scanDurationMs`).
   - `SourceMatch` (`checkId`, `sourceTitle`, `sourceUrl`, `similarityPercentage`, `matchedPhrases[]`, `citationStatus`).
   - `SentenceEvaluation` (`checkId`, `sentenceIndex`, `text`, `aiProbability`, `riskLevel`, `flaggedFeatures[]`).
   - `Citation` (`userId`, `style: CitationStyle`, `authors[]`, `title`, `year`, `publisher`, `doi`, `formattedText`).
3. **Academic Assessment & Learning OS Models:**
   - `Course` (`id`, `code`, `title`, `level: OTHM_Level`, `credits`, `syllabus`).
   - `Assignment` (`courseId`, `title`, `rubricCriteria[]`, `dueDate`, `maxScore`).
   - `Submission` (`assignmentId`, `studentId`, `content`, `fileUrl`, `status: SubmissionStatus`, `grade`, `feedback`).
   - `LabTask` (`courseId`, `starterCode`, `testCases[]`, `memoryLimitMb`, `timeLimitMs`).

---

## 📐 Mathematical & Algorithmic Formulations Summary

Nexora OS executes **zero black-box heuristics**. All scores are deterministically computed via the following mathematical models:

1. **Linear Algebra — TF-IDF & Cosine Similarity:**
   $$\text{TF-IDF}(t, d, D) = \left( \frac{f_{t,d}}{\sum_{t'} f_{t',d}} \right) \times \left( \ln\frac{1 + |D|}{1 + |\{d : t \in d\}|} + 1 \right)$$
   $$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum A_i B_i}{\sqrt{\sum A_i^2} \sqrt{\sum B_i^2}}$$

2. **Set Theory — N-Gram Shingling & Jaccard Index (IoU):**
   $$S(D, n) = \{w_i, \dots, w_{i+n-1}\}, \quad J(A, B) = \frac{|A \cap B|}{|A \cup B|} \times 100\%$$

3. **Statistical Stylometrics — Sentence Length Burstiness ($CV$):**
   $$\mu = \frac{1}{N}\sum L_i, \quad \sigma = \sqrt{\frac{1}{N}\sum (L_i - \mu)^2}, \quad CV = \frac{\sigma}{\mu}$$
   *Decision Boundary:* $CV \ge 0.40 \implies \mathbf{Human}$, $CV < 0.25 \implies \mathbf{AI\ Risk}$.

4. **Dynamic Programming — Levenshtein Distance & Normalized Edit Metric:**
   $$\text{lev}_{a,b}(i, j) = \min \{ \text{lev}(i-1, j)+1, \; \text{lev}(i, j-1)+1, \; \text{lev}(i-1, j-1)+1_{(a_i \neq b_j)} \}$$
   $$\text{Fuzzy Similarity} = \left( 1 - \frac{\text{lev}(a, b)}{\max(|a|, |b|)} \right) \times 100\%$$

5. **Multi-Dimensional Weighted Originality Synthesis & Clamping:**
   $$\text{Originality} = 100 - (0.45 \cdot S_{\text{Jaccard}} + 0.25 \cdot S_{\text{Fuzzy}} + 0.30 \cdot S_{\text{Cosine}})$$
   $$f(S) = \min(100, \max(0, S))$$

---

## 🚀 DevOps, Build Pipelines & Deployment Configurations

* **Development Workflow:**
  - `npm run dev` executes `concurrently` launching Next.js (port 3000), Express API (port 5000), and FastAPI (port 8010).
* **Build Verification:**
  - Full-stack typecheck: `npm run typecheck` validates `@nexora/types`, `@nexora/config`, `@nexora/api`, and `@nexora/web`.
  - Database generation: `npm run db:generate` produces strict Prisma Client bindings.
* **Production Deployment Artifacts:**
  - **Vercel (`vercel.json`):** Edge-optimized Next.js deployment.
  - **Render (`render.yaml`):** Managed Node.js Express service + Python FastAPI container + Cloud PostgreSQL instance.

---

## 🎯 Verification & Health Status
* **API Typecheck:** `0 errors` (TypeScript strict mode).
* **Web Typecheck:** `0 errors` (Next.js 16 / React 19 clean compilation).
* **Prisma Schema:** `Valid & Synced`.
* **Mathematical Reference Files:** All formulas and slide decks saved in `/docs`.

---
*Report Compiled for Technical Audit & LLM Context Ingestion by Nexora OS Engineering Core.*
