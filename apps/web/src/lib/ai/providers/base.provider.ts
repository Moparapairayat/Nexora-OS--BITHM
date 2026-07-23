/**
 * Nexora OS — Abstract Base Provider Contract
 */

import { AIProviderId, AIProviderResponse, AIRequestOptions } from "../types/ai.types";

export abstract class BaseAIProvider {
  public abstract readonly id: AIProviderId;
  public abstract readonly name: string;

  /**
   * Check if the provider has a valid API key configured in environment variables.
   */
  public abstract isConfigured(): boolean;

  /**
   * Execute prompt request against the provider API.
   */
  public abstract generateContent(options: AIRequestOptions): Promise<AIProviderResponse>;
}
