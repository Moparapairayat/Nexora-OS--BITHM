/**
 * Nexora OS — Language Resolver Utility
 */

import { SupportedLanguage } from "../types/execution.types";

export function normalizeLanguage(rawLang: string): SupportedLanguage {
  if (!rawLang || typeof rawLang !== "string") return "javascript";
  const val = rawLang.toLowerCase().trim();

  if (["py", "python", "python3"].includes(val)) return "python";
  if (["js", "javascript", "node"].includes(val)) return "javascript";
  if (["ts", "typescript"].includes(val)) return "typescript";
  if (["c"].includes(val)) return "c";
  if (["cpp", "c++", "cc"].includes(val)) return "cpp";
  if (["java"].includes(val)) return "java";
  if (["html", "html/css/js"].includes(val)) return "html";

  return "javascript";
}
