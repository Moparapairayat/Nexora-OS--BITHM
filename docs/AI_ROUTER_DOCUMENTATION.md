# 🚀 Nexora OS — Production AI Router Documentation

Welcome to the official documentation for the **Nexora OS Production AI Router Infrastructure**.

---

## 📌 1. Executive Overview

The **Nexora OS AI Router** is a centralized, backend-only AI orchestration engine powering all artificial intelligence capabilities within the Nexora OS academic platform (e.g. AcademicShield, Lab Report Assistant, Database Assistant, Code Assistant, etc.).

### Key Architectural Guarantees:
* **Zero Direct Provider Exposure**: The frontend client NEVER contacts AI providers directly. All prompts pass through Next.js API Routes (`/api/ai` or `/api/ai/chat`) to the backend AI Router.
* **Pure API Infrastructure**: Uses zero local LLMs or heavy local model downloads (no Ollama, LM Studio, or local binaries).
* **Multi-Provider Failover**: Automatically redirects traffic across Google Gemini API, Groq Cloud API, and OpenRouter API if a primary provider experiences downtime, rate limits (HTTP 429), or timeouts.
* **Persistent PostgreSQL Telemetry**: Logs provider usage, model execution time, prompt/response lengths, token counts, and execution status into the PostgreSQL database (`AIRequestLog` table).

---

## 🏗️ 2. System Architecture & Flow

```
                      +-------------------+
                      |   Frontend UI     |
                      | (Next.js Client)  |
                      +---------+---------+
                                |
                   POST /api/ai | POST /api/ai/chat
                                v
                      +-------------------+
                      | Next.js API Route |
                      | (/api/ai/route.ts)|
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      |     AIRouter      |
                      | (Central Engine)  |
                      +----+----+----+----+
                           |    |    |
           +---------------+    |    +---------------+
           |                    |                    |
           v                    v                    v
  +------------------+ +------------------+ +------------------+
  |  GeminiProvider  | |   GroqProvider   | |OpenRouterProvider|
  | (Google Gemini)  | |   (Groq Cloud)   | |  (OpenRouter)   |
  +--------+---------+ +--------+---------+ +--------+---------+
           |                    |                    |
           +---------------+    |    +---------------+
                           v    v    v
                      +-------------------+
                      | Fallback Manager  |
                      | & Response Format |
                      +---------+---------+
                                |
                                v
                      +-------------------+
                      | PostgreSQL DB Log |
                      |  (AIRequestLog)   |
                      +-------------------+
```

---

## 🎯 3. Provider Selection & Fallback Logic

The AI Router dynamically routes tasks to the best-suited provider based on workload characteristics:

| Task Category | Primary Provider | Fallback Providers | Target Model | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`coding`** | **Groq Cloud** | Gemini, OpenRouter | `llama-3.3-70b-versatile` | Code generation, refactoring, algorithms |
| **`database`** | **Groq Cloud** | Gemini, OpenRouter | `llama-3.3-70b-versatile` | SQL queries, schema design, ERDs |
| **`debugging`** | **Groq Cloud** | Gemini, OpenRouter | `llama-3.3-70b-versatile` | Stack trace analysis, error fixes |
| **`general`** | **Google Gemini** | Groq, OpenRouter | `gemini-2.5-flash` | General Q&A, platform navigation |
| **`academic`** | **Google Gemini** | Groq, OpenRouter | `gemini-2.5-flash` | Essay writing, coursework explanation |
| **`summarization`**| **Google Gemini** | Groq, OpenRouter | `gemini-2.5-flash` | Document & text summarization |
| **`diagram`** | **Google Gemini** | Groq, OpenRouter | `gemini-2.5-flash` | Visual ERD & diagram descriptions |
| **`research`** | **OpenRouter** | Gemini, Groq | `meta-llama/llama-3.3-70b-instruct:free` | Comprehensive literature review |

### Fallback Execution Algorithm:
1. `AIRouter` inspects requested task type (e.g. `coding`).
2. Checks environment variables (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`).
3. Attempts execution with the **Primary Provider**.
4. If primary provider fails (HTTP 429, timeout, network disconnect), `FallbackManagerService` catches error, logs fallback warning, and immediately executes the next **Fallback Provider**.
5. Formats standardized JSON response and persists telemetry to PostgreSQL.

---

## 🔐 4. Environment Variables Setup

Ensure the following variables are declared in `apps/web/.env` or root `.env`:

```env
# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key-here"

# Groq Cloud API
GROQ_API_KEY="your-groq-api-key-here"

# OpenRouter API
OPENROUTER_API_KEY="your-openrouter-api-key-here"

# Database Connection (Neon PostgreSQL — see NEON_DATABASE_MIGRATION.md)
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]-pooler.[REGION].aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

> [!IMPORTANT]
> Never prepend API keys with `NEXT_PUBLIC_` unless specifically required for client builds. Keep API keys strictly server-side inside Next.js API Routes.

---

## 📡 5. API Usage Examples

### 5.1 General AI Execution (`POST /api/ai`)

```typescript
const response = await fetch("/api/ai", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
  },
  body: JSON.stringify({
    task: "coding",
    prompt: "Write a TypeScript function to balance a binary search tree",
    moduleName: "CodeAssistant",
  }),
});

const data = await response.json();
```

> The caller's identity for rate-limiting and usage logging comes from the
> verified `Authorization: Bearer <token>` session token (or, for anonymous
> callers, the request's IP address) — never from a client-supplied `userId`
> field in the request body.

**Standard Response Format**:
```json
{
  "success": true,
  "message": "Response generated successfully.",
  "provider": "groq",
  "model": "llama-3.3-70b-versatile",
  "response": "Here is the balanced BST algorithm in TypeScript...",
  "tokens": {
    "promptTokens": 18,
    "completionTokens": 142,
    "totalTokens": 160
  },
  "executionTime": 320,
  "timestamp": "2026-07-23T03:43:00.000Z"
}
```

### 5.2 Conversational AI Chat (`POST /api/ai/chat`)

```typescript
const response = await fetch("/api/ai/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${sessionToken}`,
  },
  body: JSON.stringify({
    prompt: "What is OTHM Unit H/650/3385?",
    moduleName: "PandaChat",
  }),
});

const data = await response.json();
```

---

## 📁 6. Code Base Folder Structure

```
apps/web/src/lib/ai/
├── configuration/
│   └── ai.config.ts             # Tasks, providers, models & security limits
├── types/
│   └── ai.types.ts              # TypeScript interfaces for request/response
├── providers/
│   ├── base.provider.ts         # Abstract IAIProvider interface
│   ├── gemini.provider.ts       # Google Gemini 2.5/2.0 Flash REST provider
│   ├── groq.provider.ts         # Groq OpenAI-compatible provider
│   └── openrouter.provider.ts   # OpenRouter API provider
├── services/
│   ├── prompt-builder.service.ts        # Task prompt sanitization & instructions
│   ├── response-formatter.service.ts    # Response standardization
│   ├── fallback-manager.service.ts      # Multi-provider failover engine
│   ├── conversation-context.service.ts  # Token budget clipping for chat history
│   ├── token-counter.service.ts         # Token estimation service
│   ├── usage-logger.service.ts          # DB telemetry logger (AIRequestLog)
│   ├── rate-limiter.service.ts          # Request rate limiter per user/IP
│   └── error-handler.service.ts         # Error classification
├── router/
│   └── ai.router.ts             # Central AI Router orchestrator
└── utils/
    ├── sanitizer.ts             # Prompt sanitizer & validator
    └── index.ts                 # Module exports
```

---

## 🔮 7. Future Extension Guide for New Modules

To connect a new module (e.g. `AcademicShield`, `LabReportAssistant`, `SlideGenerator`) to the AI Router:

1. Import `AIRouter` in your Server Action or API Route:
   ```typescript
   import { AIRouter } from "@/lib/ai";
   ```
2. Invoke `AIRouter.execute()` specifying the task category and module name:
   ```typescript
   const result = await AIRouter.execute({
     task: "academic",
     prompt: userAssignmentText,
     moduleName: "AcademicShield",
     userId: currentUser.id,
   });
   ```
3. Process `result.response` securely in your backend.

---
*Created for Nexora OS Academic Operating System.*
