import { aiModels } from "@nexora/config";

import { MockAIAdapter } from "./adapters/mock-ai.adapter.js";
import type { AIAdapter, AIRequest, AIResponse, AITask } from "./ai.types.js";

const adapters: AIAdapter[] = [
  new MockAIAdapter("glm-4.7-flash", ["project-architect", "feedback"]),
  new MockAIAdapter("devstral-small-2", ["code-doctor"]),
  new MockAIAdapter("minimax-m2.7", ["slides", "document", "rewrite"]),
  new MockAIAdapter("qwen3-thinking", ["project-architect", "feedback"]),
  new MockAIAdapter("qwen3-embedding-reranker", ["similarity"]),
  new MockAIAdapter("minicpm-v-4.6", ["vision"]),
];

const preferredByTask: Record<AITask, string> = {
  "project-architect": "glm-4.7-flash",
  "code-doctor": "devstral-small-2",
  rewrite: "minimax-m2.7",
  feedback: "qwen3-thinking",
  slides: "minimax-m2.7",
  document: "minimax-m2.7",
  similarity: "qwen3-embedding-reranker",
  vision: "minicpm-v-4.6",
};

export class AIModelRouter {
  async run(request: AIRequest): Promise<AIResponse> {
    const preferred = preferredByTask[request.task];
    const adapter =
      adapters.find(
        (item) => item.id === preferred && item.supports.includes(request.task),
      ) ?? adapters.find((item) => item.supports.includes(request.task));

    if (!adapter) {
      throw new Error(`No AI adapter registered for task: ${request.task}`);
    }

    return adapter.run(request);
  }

  listModels() {
    return aiModels;
  }
}

export const aiModelRouter = new AIModelRouter();
