# 🚀 Nexora OS — Instructor Quickstart & Execution Guide

> **Academic Coursework Evaluation Dossier**  
> • **Course / Unit:** Web & Mobile Applications  
> • **Qualification:** OTHM Level 5 in Information Technology / Computing  
> • **Student Name:** Mopara Pair Ayat  
> • **Course Instructor:** Afsana Tabassum Tamishra  
> • **Institution:** BITHM College Of Professionals  

This concise guide is provided for the academic evaluator / instructor to set up, configure environment variables, and run the **Nexora OS** full-stack multi-model platform in **under 3 minutes**.

---

## 💻 1. System Prerequisites

Ensure the following runtimes are installed on your host machine:

| Software | Required Version | Verification Command |
| :--- | :--- | :--- |
| **Node.js** | `v20.x` or `v22.x` (LTS recommended) | `node -v` |
| **npm** | `v10.x` or higher | `npm -v` |
| **Python** | `3.12` or `3.13` | `python --version` or `py -3.13 --version` |
| **Docker Desktop** *(Optional)* | Any modern version (for Code Lab sandbox) | `docker -v` |

---

## ⚙️ 2. Environment Setup (`.env`)

A fully pre-configured sample environment file (`.env.example`) is provided in the root directory.

### Windows (PowerShell):
```powershell
Copy-Item .env.example .env
```

### macOS / Linux (Bash):
```bash
cp .env.example .env
```

### Key Parameters Overview:
* `PORT=8311` ➔ Express 5 core REST API port.
* `NEXT_PUBLIC_APP_URL=http://localhost:3000` ➔ Next.js 16 frontend origin.
* `ML_NLP_URL=http://localhost:8010` ➔ Python FastAPI microservice URL.
* `DATABASE_URL` ➔ Pre-configured Neon Serverless PostgreSQL cloud database connection string.
* `NEXORA_DEMO_LOGIN_ENABLED="true"` ➔ Enables instant demo login without manual sign-up.

---

## 📦 3. Install Dependencies

Install all monorepo dependencies across `apps/*` and `packages/*`:

```bash
npm install
```

> **Note:** The `postinstall` script automatically compiles internal packages (`@nexora/types`, `@nexora/config`) and generates the Prisma client.

---

## 🗄️ 4. Database Schema Sync & Demo Seeding

Connect to the cloud Neon PostgreSQL database and populate standard academic evaluation data:

### Step 4.1: Synchronize Database Schema
```bash
npm run db:push
```
*(Confirms that all 30+ relational Prisma models are active and synchronized)*

### Step 4.2: Seed Evaluation Accounts & Coursework Data
```bash
npm run db:seed
```
*(Populates academic briefs, lab exercises, test submissions, and evaluation accounts)*

---

## 🚀 5. Start the Application (Single Command)

Launch all 3 monorepo services concurrently with one command:

```bash
npm run dev
```

### Terminal Output & Service Endpoints:
| Service | Color Badge | Local URL | Role |
| :--- | :---: | :--- | :--- |
| **Frontend Web** | 🟢 `[web]` | **`http://localhost:3000`** | Next.js 16 App Router UI |
| **Core API** | 🔵 `[api]` | **`http://localhost:8311`** | Express 5 REST API & RBAC |
| **ML Microservice**| 🟣 `[ml]` | **`http://localhost:8010`** | Python FastAPI (Academic Shield) |

---

## 🔑 6. Instructor Demo Login Credentials

You can use the **Quick Demo Login dropdown** directly on `http://localhost:3000` or manually sign in with these pre-seeded accounts:

| Role | Email | Password | Dashboard Features |
| :--- | :--- | :--- | :--- |
| **Instructor / Teacher** | `teacher@nexora.local` | `password123` | Assignment review, grading, Academic Shield audits, lab monitoring |
| **Student** | `student@nexora.local` | `password123` | Coursework briefs, Code Lab IDE, RyanCV Portfolio Studio |
| **Administrator** | `admin@nexora.local` | `password123` | System telemetry, audit logs, user management, database controls |

---

## 🧭 7. Key Feature Navigation for Evaluation

Once logged in at `http://localhost:3000`:

1. **Academic Shield (Integrity Engine):**  
   Navigate to `/academic-shield` ➔ Test AI-writing risk analysis and TF-IDF plagiarism scanning.
2. **Code Lab (In-Browser IDE):**  
   Navigate to `/labs` ➔ Run Python / Node.js code with live output and test-case verification.
3. **Next-Gen Portfolio Studio:**  
   Navigate to `/portfolio` ➔ Test the 3-way layout switcher (`[Bento]`, `[RyanCV]`, `[Classic]`), live theme changer, and click `Public View` for 1-click PDF export.

---

## 🧪 8. Code Quality & Health Verification

To verify that the entire monorepo is clean and complies with strict TypeScript 5.9 standards:

```bash
npm run typecheck
```
*Expected Result: **0 compilation errors, 100% type-safe.***

---

## ❓ Troubleshooting & Tips

* **Port 3000 / 8311 already in use:**  
  Make sure previous dev servers are stopped before running `npm run dev`.
* **Python launcher command on Windows:**  
  If your system uses `python` instead of `py -3.13`, you can start the ML service manually in a separate terminal:  
  `python -m uvicorn app.main:app --app-dir services/ml-nlp --reload --port 8010`

