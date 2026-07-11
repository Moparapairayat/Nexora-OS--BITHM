export type AITask =
  | "project-architect"
  | "code-doctor"
  | "rewrite"
  | "feedback"
  | "slides"
  | "document"
  | "similarity"
  | "vision";

export interface AIRequest {
  task: AITask;
  prompt: string;
  context?: Record<string, unknown>;
}

export interface AIResponse {
  model: string;
  mode: "mock" | "local" | "remote";
  output: Record<string, unknown>;
}

export interface AIAdapter {
  id: string;
  supports: AITask[];
  run(request: AIRequest): Promise<AIResponse>;
}
