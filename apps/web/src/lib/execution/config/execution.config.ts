/**
 * Nexora OS — Code Execution Engine Configuration
 */

import { SupportedLanguage } from "../types/execution.types";

export const EXECUTION_CONFIG = {
  pistonApiUrl: process.env.PISTON_API_URL || "https://emkc.org/api/v2/piston",
  defaultTimeoutMs: 5000,
  maxCodeLengthChars: 64000,
  maxOutputLengthChars: 16000,
  rateLimitPerMinute: 30,

  languageRuntimes: {
    c: {
      pistonLanguage: "c",
      version: "10.2.0",
      mainFileName: "main.c",
    },
    cpp: {
      pistonLanguage: "c++",
      version: "10.2.0",
      mainFileName: "main.cpp",
    },
    java: {
      pistonLanguage: "java",
      version: "15.0.2",
      mainFileName: "Main.java",
    },
    python: {
      pistonLanguage: "python",
      version: "3.10.0",
      mainFileName: "main.py",
    },
    javascript: {
      pistonLanguage: "javascript",
      version: "18.15.0",
      mainFileName: "main.js",
    },
    typescript: {
      pistonLanguage: "typescript",
      version: "5.0.3",
      mainFileName: "main.ts",
    },
  } as Record<Exclude<SupportedLanguage, "html">, { pistonLanguage: string; version: string; mainFileName: string }>,
};
