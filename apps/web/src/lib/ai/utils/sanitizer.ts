/**
 * Nexora OS — AI Input Sanitizer & Security Utilities
 */

import { AI_CONFIG } from "../configuration/ai.config";

export function sanitizePrompt(rawPrompt: string): string {
  if (!rawPrompt || typeof rawPrompt !== "string") {
    return "";
  }

  // Remove potential script injection tags or null byte control chars
  let cleaned = rawPrompt
    .replace(/\0/g, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "[Script Tag Removed]")
    .trim();

  // Enforce max character limit
  if (cleaned.length > AI_CONFIG.security.maxPromptCharLength) {
    cleaned = cleaned.substring(0, AI_CONFIG.security.maxPromptCharLength) + "\n\n[Input truncated to max length]";
  }

  return cleaned;
}

export function validateAIRequest(prompt: string): { valid: boolean; reason?: string } {
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return { valid: false, reason: "Prompt cannot be empty" };
  }

  return { valid: true };
}
