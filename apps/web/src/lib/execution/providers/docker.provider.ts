/**
 * Nexora OS — Docker / Judge0 Extension Provider
 */

import { BaseExecutionProvider } from "./base.provider";
import { ExecutionInput, ExecutionProviderId, StandardExecutionResult } from "../types/execution.types";
import { OutputParser } from "../parsers/output.parser";
import { normalizeLanguage } from "../router/language.resolver";

export class DockerProvider extends BaseExecutionProvider {
  public readonly id: ExecutionProviderId = "docker";
  public readonly name: string = "Custom Docker Sandbox Provider";

  public isConfigured(): boolean {
    return false; // Reserved for self-hosted Docker / Judge0 CE
  }

  public async executeCode(input: ExecutionInput): Promise<StandardExecutionResult> {
    const lang = normalizeLanguage(input.language);
    return OutputParser.formatErrorResult(
      "Docker/Judge0 Provider is reserved for self-hosted deployments. Using default Piston provider.",
      lang,
      0,
      this.id
    );
  }
}
