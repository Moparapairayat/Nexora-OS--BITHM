import type {
  AcademicRewriteSuggestion,
  CitationRecord,
} from "@nexora/types";

export interface CitationParams {
  style: string;
  sourceTitle: string;
  url?: string;
  author?: string;
  year?: string;
  publisher?: string;
}

export class CitationEngineService {
  /**
   * Format citation according to style specifications
   */
  formatCitation(params: CitationParams): { reference: string; inText: string } {
    const author = (params.author || "Nexora Academic Research Group").trim();
    const title = (params.sourceTitle || "Academic Study and Technical Framework").trim();
    const year = params.year || new Date().getFullYear().toString();
    const url = params.url || "https://example.edu";
    const publisher = params.publisher || "Academic Press";
    const style = (params.style || "Harvard").toUpperCase();

    const authorParts = author.split(/\s+/);
    const lastName = authorParts[authorParts.length - 1] || author;
    const initial = authorParts.length > 1 ? `${authorParts[0][0]}.` : "";

    switch (style) {
      case "APA":
      case "APA 7":
      case "APA7":
        return {
          reference: `${lastName}, ${initial} (${year}). ${title}. ${publisher}. ${url}`,
          inText: `(${lastName}, ${year})`,
        };

      case "IEEE":
        return {
          reference: `[1] ${initial} ${lastName}, "${title}," ${publisher}, ${year}. [Online]. Available: ${url}`,
          inText: `[1]`,
        };

      case "MLA":
      case "MLA 9":
        return {
          reference: `${lastName}, ${authorParts.slice(0, -1).join(" ") || initial}. "${title}." ${publisher}, ${year}, ${url}.`,
          inText: `(${lastName})`,
        };

      case "HARVARD":
      default:
        return {
          reference: `${lastName}, ${initial} (${year}) '${title}', ${publisher}. Available at: ${url} (Accessed: ${new Date().toLocaleDateString("en-GB")}).`,
          inText: `(${lastName}, ${year})`,
        };
    }
  }

  /**
   * Rewrite passage into formal academic style while preserving technical evidence and citations
   */
  academicRewrite(text: string): AcademicRewriteSuggestion {
    const cleanText = text.trim();
    if (!cleanText) {
      return {
        id: `rewrite-${Date.now()}`,
        originalText: text,
        rewrittenText: "Please provide valid text to rewrite.",
        citationPreservationNotes: [],
        riskWarnings: [],
        createdAt: new Date().toISOString(),
      };
    }

    // Identify preserved citations like [1], (Smith, 2024), etc.
    const citationMatches = cleanText.match(/\[\d+\]|\([A-Za-z\s]+,?\s*\d{4}\)/g) || [];
    const preservedNotes = citationMatches.map((c) => `Preserved in-text citation: ${c}`);

    // Intelligent academic lexical enhancement
    let rewritten = cleanText
      .replace(/\bThis report evaluates\b/gi, "This comprehensive study critically evaluates")
      .replace(/\bThis report shows\b/gi, "The empirical findings demonstrate")
      .replace(/\bWe found that\b/gi, "The experimental evaluation indicates that")
      .replace(/\bI think that\b/gi, "It can be deduced that")
      .replace(/\bGood performance\b/gi, "Optimal performance metrics")
      .replace(/\bVery important\b/gi, "Of paramount significance")
      .replace(/\bCheck if it works\b/gi, "Validate functional compliance and fault tolerance")
      .replace(/\bTesting should include\b/gi, "The rigorous verification protocol incorporates")
      .replace(/\bVisible tests passed\b/gi, "Primary test criteria achieved validation")
      .replace(/\bfailed for\b/gi, "exhibited regression during edge-case boundary analysis for");

    // If no specific replacements occurred, apply an academic framing
    if (rewritten === cleanText) {
      const paragraphs = cleanText.split(/\n\s*\n|\n/);
      rewritten = paragraphs
        .map((p) => {
          if (p.length < 15) return p;
          return `From an academic perspective, ${p.charAt(0).toLowerCase() + p.slice(1)}`;
        })
        .join("\n\n");
    }

    return {
      id: `rewrite-${Date.now()}`,
      originalText: text,
      rewrittenText: rewritten,
      citationPreservationNotes: [
        ...preservedNotes,
        "All quantitative test values, empirical data, and benchmark outputs were retained.",
        "Ensure all cited references are listed in the end-of-document bibliography according to your institution's referencing guidelines.",
      ],
      riskWarnings: [
        "Academic rewrite tools are intended for drafting assistance and stylistic enhancement, not misconduct concealment.",
        "The student remains solely responsible for the technical validity and conceptual integrity of all submitted work.",
      ],
      createdAt: new Date().toISOString(),
    };
  }
}

export const citationEngine = new CitationEngineService();

