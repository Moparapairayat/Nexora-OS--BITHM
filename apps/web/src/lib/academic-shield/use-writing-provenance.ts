"use client";

import { useCallback, useRef } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import type { WritingProvenanceSummary } from "@nexora/types";

/**
 * Tracks HOW text in a textarea was composed — typed gradually vs. pasted in
 * bulk — while the user writes. A large single paste is a far harder signal
 * to fake than any after-the-fact text analysis, so this is sent alongside
 * plagiarism/AI-risk checks as corroborating (never sole) evidence.
 *
 * Usage: spread `bind` onto the textarea, call `summarize(text)` right before
 * submitting a check, then `reset()` to start tracking the next draft.
 */
export function useWritingProvenance() {
  const state = useRef({
    pastedChars: 0,
    pasteEvents: 0,
    largestPasteChars: 0,
    keystrokeCount: 0,
    firstEventAt: null as number | null,
    lastEventAt: null as number | null,
  });

  const onPaste = useCallback((event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = event.clipboardData?.getData("text") ?? "";
    if (!pasted) return;

    const s = state.current;
    const now = Date.now();
    s.pastedChars += pasted.length;
    s.pasteEvents += 1;
    s.largestPasteChars = Math.max(s.largestPasteChars, pasted.length);
    s.firstEventAt ??= now;
    s.lastEventAt = now;
  }, []);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Only count keys that actually change content, not modifiers/navigation.
    const isContentKey = event.key.length === 1 || event.key === "Backspace" || event.key === "Delete" || event.key === "Enter";
    if (!isContentKey) return;

    const s = state.current;
    const now = Date.now();
    s.keystrokeCount += 1;
    s.firstEventAt ??= now;
    s.lastEventAt = now;
  }, []);

  const reset = useCallback(() => {
    state.current = {
      pastedChars: 0,
      pasteEvents: 0,
      largestPasteChars: 0,
      keystrokeCount: 0,
      firstEventAt: null,
      lastEventAt: null,
    };
  }, []);

  const summarize = useCallback((finalText: string): WritingProvenanceSummary => {
    const s = state.current;
    const totalChars = finalText.length;
    const activeMs = s.firstEventAt && s.lastEventAt ? s.lastEventAt - s.firstEventAt : 0;
    const pastedRatio = totalChars > 0 ? s.pastedChars / totalChars : 0;

    const verdict: WritingProvenanceSummary["verdict"] =
      pastedRatio >= 0.6 ? "paste-heavy" : pastedRatio >= 0.2 || s.pasteEvents > 0 ? "mixed" : "organic";

    return {
      totalChars,
      pastedChars: s.pastedChars,
      pasteEvents: s.pasteEvents,
      largestPasteChars: s.largestPasteChars,
      keystrokeCount: s.keystrokeCount,
      activeMs,
      verdict,
    };
  }, []);

  return {
    bind: { onPaste, onKeyDown },
    summarize,
    reset,
  };
}
