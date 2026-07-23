/**
 * Nexora OS — Prompt Builder Service
 */

import { AITaskCategory } from "../types/ai.types";
import { sanitizePrompt } from "../utils/sanitizer";

const TASK_SYSTEM_PROMPTS: Record<AITaskCategory, string> = {
  coding:
    "You are Nexora Code AI, an expert software engineer. Provide high-quality, production-ready, clean TypeScript/JavaScript/Python code solutions with concise explanations.",
  general:
    "You are Nexora OS AI Assistant, an intelligent, helpful academic assistant for BITHM College of Professionals. Provide clear, accurate, and structured answers.",
  academic:
    "You are Nexora Academic Scholar, an elite academic assistant. Format explanations clearly with structured headings, precise academic terminology, and analytical depth.",
  research:
    "You are Nexora Research Analyst. Provide comprehensive, evidence-based research summaries, structured insights, and clear source references.",
  summarization:
    "You are Nexora Summary Engine. Synthesize the provided content into concise, bulleted key takeaways without losing critical detail.",
  diagram:
    "You are Nexora Diagram & Architecture Expert. Analyze database schemas, ERDs, and system architectures, offering precise modeling suggestions.",
  database:
    "You are Nexora Database Architect. Write optimized SQL queries, database migrations, and relational data structures adhering to relational standards.",
  debugging:
    "You are Nexora Debugging Engine. Analyze stack traces, identify root causes, and provide step-by-step fix recommendations.",
};

export class PromptBuilderService {
  public static buildPrompt(rawPrompt: string, task: AITaskCategory, userSystemPrompt?: string): { prompt: string; systemPrompt: string } {
    const cleanPrompt = sanitizePrompt(rawPrompt);
    const defaultSystem = TASK_SYSTEM_PROMPTS[task] || TASK_SYSTEM_PROMPTS.general;
    const finalSystemPrompt = userSystemPrompt ? `${defaultSystem}\n\nUser Instruction: ${userSystemPrompt}` : defaultSystem;

    return {
      prompt: cleanPrompt,
      systemPrompt: finalSystemPrompt,
    };
  }
}
