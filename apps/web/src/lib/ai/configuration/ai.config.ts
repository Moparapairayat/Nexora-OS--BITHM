/**
 * Nexora OS — Centralized AI System Configuration
 */

import { ProviderConfig, TaskRouteMapping, AITaskCategory } from "../types/ai.types";

export const AI_CONFIG = {
  security: {
    maxPromptCharLength: 32000,
    maxResponseTokens: 4096,
    defaultTemperature: 0.7,
    rateLimitRequestsPerMin: 60,
  },

  providers: {
    gemini: {
      id: "gemini",
      name: "Google Gemini API",
      apiKeyEnvVar: "GEMINI_API_KEY",
      models: {
        primary: "gemini-2.5-flash",
        fallback: "gemini-2.0-flash",
      },
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      timeoutMs: 15000,
    } as ProviderConfig,

    groq: {
      id: "groq",
      name: "Groq Cloud API",
      apiKeyEnvVar: "GROQ_API_KEY",
      models: {
        primary: "llama-3.3-70b-versatile",
        fallback: "mixtral-8x7b-32768",
      },
      baseUrl: "https://api.groq.com/openai/v1",
      timeoutMs: 12000,
    } as ProviderConfig,

    openrouter: {
      id: "openrouter",
      name: "OpenRouter API",
      apiKeyEnvVar: "OPENROUTER_API_KEY",
      models: {
        primary: "google/gemma-4-31b-it:free",
        fallback: "poolside/laguna-s-2.1:free",
      },
      baseUrl: "https://openrouter.ai/api/v1",
      timeoutMs: 18000,
    } as ProviderConfig,
  },

  taskRouting: [
    {
      task: "coding",
      primaryProvider: "groq",
      fallbackProviders: ["gemini", "openrouter"],
    },
    {
      task: "database",
      primaryProvider: "groq",
      fallbackProviders: ["gemini", "openrouter"],
    },
    {
      task: "debugging",
      primaryProvider: "groq",
      fallbackProviders: ["gemini", "openrouter"],
    },
    {
      task: "general",
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
    },
    {
      task: "academic",
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
    },
    {
      task: "summarization",
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
    },
    {
      task: "diagram",
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
    },
    {
      task: "research",
      primaryProvider: "openrouter",
      fallbackProviders: ["gemini", "groq"],
    },
  ] as TaskRouteMapping[],
};

export function getRouteMappingForTask(task: AITaskCategory): TaskRouteMapping {
  const mapping = AI_CONFIG.taskRouting.find((r) => r.task === task);
  if (!mapping) {
    return {
      task,
      primaryProvider: "gemini",
      fallbackProviders: ["groq", "openrouter"],
    };
  }
  return mapping;
}
