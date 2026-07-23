# 🚀 Nexora OS — Code Execution Engine Documentation

**Module**: Code Execution Engine (Provider Abstraction Layer)  
**Default Provider**: Piston API v2 with automatic Judge0 CE Failover  
**Database Persistence**: Supabase PostgreSQL (`CodeRun` & `CodeTestResult` models via Prisma)  

---

## 🏛️ 1. Architecture Overview

The Nexora OS Code Execution Engine uses a decoupled, multi-provider architecture designed to ensure zero downtime, high performance, and future-proof extensibility.

```
Student (Monaco Editor UI)
       │
       ▼
   codeRunner (/api/code/execute & /api/code/test)
       │
       ▼
InputValidator & ExecutionRateLimiterService (Rate Limit & Security Check)
       │
       ▼
ExecutionFactory & ExecutionRouter (Provider Selection & Failover Chain)
       │
       ├────────────────────────┬──────────────────────┐
       ▼                        ▼                      ▼
PistonProvider           Judge0Provider          DockerProvider
(Piston API v2)          (Judge0 CE API)        (Self-Hosted Sandbox)
       │                        │                      │
       └────────────────────────┴──────────────────────┘
                                │
                                ▼
                       OutputParser & Formatter
                                │
                                ▼
                 ExecutionLoggerService (Supabase DB Log)
                                │
                                ▼
                    Standard Execution JSON
```

---

## 💻 2. Supported Language Matrix

| Language | Canonical Key | Default Provider | Version / Environment | Sandbox Isolation |
| :--- | :---: | :---: | :---: | :---: |
| **C** | `c` | Piston / Judge0 | GCC 10.2.0 | Containerized Sandbox |
| **C++** | `cpp` | Piston / Judge0 | GCC 10.2.0 | Containerized Sandbox |
| **Java** | `java` | Piston / Judge0 | OpenJDK 15.0.2 | Containerized Sandbox |
| **Python** | `python` | Piston / Judge0 | Python 3.10.0 | Containerized Sandbox |
| **JavaScript** | `javascript` | Piston / Judge0 | Node.js 18.15.0 | Containerized Sandbox |
| **TypeScript** | `typescript` | Piston / Judge0 | TypeScript 5.0.3 | Containerized Sandbox |
| **HTML/CSS** | `html` | Browser Sandbox | HTML5 / CSS3 / JS | Sandboxed iframe |

---

## 🔌 3. Provider Abstraction Layer

The engine implements the `BaseExecutionProvider` contract. No provider-specific details exist outside the `providers/` directory.

```typescript
export abstract class BaseExecutionProvider {
  public abstract readonly id: ExecutionProviderId;
  public abstract readonly name: string;
  public abstract isConfigured(): boolean;
  public abstract executeCode(input: ExecutionInput): Promise<StandardExecutionResult>;
}
```

### Automatic Failover Policy
When a request arrives at `ExecutionRouter.execute()`:
1. The engine attempts execution via `PistonProvider`.
2. If Piston returns HTTP 401 (whitelist error) or network offline, it seamlessly fails over to `Judge0Provider`.
3. The response is normalized into `StandardExecutionResult` regardless of which provider executed the code.

---

## 🔒 4. Security, Validation & Rate Limiting

- **Input Validation**: `validateExecutionInput()` rejects empty payloads or source code exceeding `64,000` characters.
- **Output Sanitization**: `sanitizeStdout()` strips null bytes and truncates outputs exceeding `16,000` characters to prevent buffer overflow attacks.
- **Rate Limiting**: `ExecutionRateLimiterService` enforces a limit of `30 requests/minute` per user/IP.
- **Iframe Security**: Browser JS runner uses `parent.postMessage(..., window.location.origin)` to prevent cross-window target origin leakage.

---

## 📡 5. Backend API Endpoints

### 1. Execute Code
- **URL**: `POST /api/code/execute`
- **Body**:
  ```json
  {
    "language": "python",
    "code": "print('Hello Nexora OS!')",
    "stdin": "",
    "workspaceId": "ws-123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "stdout": "Hello Nexora OS!\n",
    "stderr": "",
    "status": "success",
    "exitCode": 0,
    "executionTimeMs": 11,
    "provider": "judge0",
    "language": "python",
    "timestamp": "2026-07-23T04:28:44.976Z"
  }
  ```

### 2. Run Test Suite
- **URL**: `POST /api/code/test`
- **Body**:
  ```json
  {
    "language": "cpp",
    "code": "#include <iostream>\nint main(){ int a, b; std::cin >> a >> b; std::cout << a + b; return 0; }",
    "testCases": [
      { "input": "2 3", "expected": "5", "isHidden": false },
      { "input": "10 20", "expected": "30", "isHidden": true }
    ]
  }
  ```

### 3. Execution History
- **URL**: `GET /api/code/history/[workspaceId]`
- **Response**: List of past 25 execution runs logged in Supabase PostgreSQL database.

---

## 🛠️ 6. Adding New Providers

To add a new provider (e.g., self-hosted Docker cluster):
1. Create `apps/web/src/lib/execution/providers/my-custom.provider.ts` extending `BaseExecutionProvider`.
2. Register the provider in `ExecutionFactory.providers` dictionary.
3. Done! The frontend and API endpoints automatically gain support for the new provider without any code changes.
