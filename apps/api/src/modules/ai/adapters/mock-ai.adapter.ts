import {
  phase3CodeDoctorReport,
  phase3Documentation,
  phase3ProjectBlueprint,
  phase3SlideDeck,
} from "@nexora/config";

import type { AIAdapter, AIRequest, AIResponse, AITask } from "../ai.types.js";

const taskOutput: Record<AITask, Record<string, unknown>> = {
  "project-architect": {
    ...phase3ProjectBlueprint,
  },
  "code-doctor": {
    ...phase3CodeDoctorReport,
  },
  rewrite: {
    mode: "Academic readability",
    warning: "Rewrite suggestions should preserve citation and source meaning.",
  },
  feedback: {
    reason:
      "Your submission needs stronger evidence for the selected assessment criteria. Add screenshots, test cases and a short explanation before resubmitting.",
  },
  slides: {
    ...phase3SlideDeck,
  },
  document: {
    ...phase3Documentation,
  },
  similarity: {
    originalityScore: 82,
    matchedSources: ["internal-demo://othm-task-1"],
  },
  vision: {
    extractedText: "Mock OCR result ready for MiniCPM-V or Tesseract adapter.",
  },
};

export class MockAIAdapter implements AIAdapter {
  constructor(
    public id: string,
    public supports: AITask[],
  ) {}

  async run(request: AIRequest): Promise<AIResponse> {
    return {
      model: this.id,
      mode: "mock",
      output: {
        promptPreview: request.prompt.slice(0, 180),
        ...taskOutput[request.task],
      },
    };
  }
}
