/**
 * Nexora OS — Base Provider Contract for Code Execution Engine
 */

import { ExecutionInput, ExecutionProviderId, StandardExecutionResult } from "../types/execution.types";

export abstract class BaseExecutionProvider {
  public abstract readonly id: ExecutionProviderId;
  public abstract readonly name: string;

  /**
   * Check if provider is configured and accessible.
   */
  public abstract isConfigured(): boolean;

  /**
   * Execute code payload against provider runtime.
   */
  public abstract executeCode(input: ExecutionInput): Promise<StandardExecutionResult>;
}
