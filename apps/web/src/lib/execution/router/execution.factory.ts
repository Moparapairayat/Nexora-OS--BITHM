/**
 * Nexora OS — Execution Provider Factory
 */

import { BaseExecutionProvider } from "../providers/base.provider";
import { PistonProvider } from "../providers/piston.provider";
import { Judge0Provider } from "../providers/judge0.provider";
import { DockerProvider } from "../providers/docker.provider";
import { ExecutionProviderId } from "../types/execution.types";

export class ExecutionFactory {
  private static pistonProvider = new PistonProvider();
  private static judge0Provider = new Judge0Provider();
  private static dockerProvider = new DockerProvider();

  private static providers: Record<ExecutionProviderId, BaseExecutionProvider> = {
    piston: ExecutionFactory.pistonProvider,
    judge0: ExecutionFactory.judge0Provider,
    docker: ExecutionFactory.dockerProvider,
  };

  public static getProvider(id: ExecutionProviderId = "piston"): BaseExecutionProvider {
    const provider = this.providers[id];
    if (provider && provider.isConfigured()) {
      return provider;
    }
    return this.pistonProvider;
  }

  public static getFallbackChain(preferred?: ExecutionProviderId): BaseExecutionProvider[] {
    const chain: BaseExecutionProvider[] = [];

    if (preferred && this.providers[preferred]?.isConfigured()) {
      chain.push(this.providers[preferred]);
    }

    if (!chain.includes(this.pistonProvider)) chain.push(this.pistonProvider);
    if (!chain.includes(this.judge0Provider)) chain.push(this.judge0Provider);

    return chain;
  }
}
