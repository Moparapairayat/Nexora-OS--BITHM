/**
 * Nexora OS — Production AI Router Types
 */

export type AITaskCategory =
  | "coding"
  | "general"
  | "academic"
  | "research"
  | "summarization"
  | "diagram"
  | "database"
  | "debugging";

export type AIProviderId = "gemini" | "groq" | "openrouter";

export type AIModule =
  | "AcademicShield"
  | "AssignmentAssistant"
  | "LabReportAssistant"
  | "CodeAssistant"
  | "DatabaseAssistant"
  | "SlideGenerator"
  | "PortfolioAssistant"
  | "MLStudioAssistant"
  | "DocumentationAssistant"
  | "TeacherFeedbackAssistant"
  | "PandaChat"
  | "General";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIRequestOptions {
  task: AITaskCategory;
  prompt: string;
  systemPrompt?: string;
  messages?: ChatMessage[];
  userId?: string;
  /**
   * Server-derived identifier used for rate limiting (verified session id or
   * request IP — never a client-supplied value). Falls back to `userId`.
   */
  rateLimitKey?: string;
  moduleName?: AIModule;
  maxTokens?: number;
  temperature?: number;
  preferredProvider?: AIProviderId;
  metadata?: Record<string, unknown>;
}

export interface AIProviderResponse {
  rawResponse: string;
  provider: AIProviderId;
  model: string;
  tokens: TokenUsage;
  executionTime: number;
}

export interface StandardAIResponse {
  success: boolean;
  message: string;
  provider: AIProviderId | "none";
  model: string;
  response: string;
  tokens: TokenUsage;
  executionTime: number;
  timestamp: string;
  error?: string;
}

export interface ProviderConfig {
  id: AIProviderId;
  name: string;
  apiKeyEnvVar: string;
  models: {
    primary: string;
    fallback?: string;
  };
  baseUrl: string;
  timeoutMs: number;
}

export interface TaskRouteMapping {
  task: AITaskCategory;
  primaryProvider: AIProviderId;
  fallbackProviders: AIProviderId[];
}

export interface AIRequestLogData {
  task: string;
  provider: string;
  model: string;
  mode?: string;
  status: "success" | "fallback_success" | "error";
  prompt: string;
  response?: unknown;
  promptLength: number;
  responseLength: number;
  executionTime: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  moduleName?: string;
  userId?: string;
}
