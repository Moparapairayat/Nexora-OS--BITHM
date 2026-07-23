/**
 * Nexora OS — Conversation Context Service
 */

import { ChatMessage } from "../types/ai.types";
import { TokenCounterService } from "./token-counter.service";

export class ConversationContextService {
  /**
   * Prunes old chat messages if total token count exceeds maxTokenBudget.
   */
  public static fitMessageHistory(
    messages: ChatMessage[],
    maxTokenBudget: number = 8000
  ): ChatMessage[] {
    if (!messages || messages.length === 0) return [];

    let totalTokens = 0;
    const keptMessages: ChatMessage[] = [];

    // Always preserve system messages first if present
    const systemMsgs = messages.filter((m) => m.role === "system");
    for (const sysMsg of systemMsgs) {
      totalTokens += TokenCounterService.estimateTokens(sysMsg.content);
      keptMessages.push(sysMsg);
    }

    const nonSystemMsgs = messages.filter((m) => m.role !== "system");

    // Iterate backwards from latest to oldest
    const reverseRecent: ChatMessage[] = [];
    for (let i = nonSystemMsgs.length - 1; i >= 0; i--) {
      const msg = nonSystemMsgs[i];
      const msgTokens = TokenCounterService.estimateTokens(msg.content);
      if (totalTokens + msgTokens > maxTokenBudget) {
        break;
      }
      totalTokens += msgTokens;
      reverseRecent.unshift(msg);
    }

    return [...keptMessages, ...reverseRecent];
  }
}
