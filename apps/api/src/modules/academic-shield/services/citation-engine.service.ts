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
    let rawAuthor = (params.author || "Academic Research Group").trim();
    let year = params.year || new Date().getFullYear().toString();

    // Extract year from author if present like "Marcotte, E. (2010)"
    const yearMatch = rawAuthor.match(/\((\d{4})\)/);
    if (yearMatch) {
      year = yearMatch[1];
      rawAuthor = rawAuthor.replace(/\(\d{4}\)/, "").trim();
    }

    const title = (params.sourceTitle || "Academic Study and Technical Framework").trim();
    const url = params.url || "https://example.edu";
    let publisher = params.publisher?.trim();

    if (!publisher || publisher.toLowerCase() === "academic press") {
      const urlLower = url.toLowerCase();
      if (urlLower.includes("wikipedia.org")) {
        publisher = "Wikipedia, The Free Encyclopedia";
      } else if (urlLower.includes("ieee.org")) {
        publisher = "IEEE Standards Association";
      } else if (urlLower.includes("acm.org")) {
        publisher = "ACM Digital Library";
      } else if (urlLower.includes("alistapart.com")) {
        publisher = "A List Apart Magazine";
      } else if (urlLower.includes("othm.org.uk")) {
        publisher = "OTHM Qualifications UK";
      } else if (urlLower.includes("github.com")) {
        publisher = "GitHub Repository";
      } else if (urlLower.includes("repository.nexora.edu") || urlLower.startsWith("vault://")) {
        publisher = "BITHM Institutional Repository";
      } else {
        const domainMatch = url.match(/https?:\/\/(?:www\.)?([^/]+)/i);
        publisher = domainMatch ? domainMatch[1] : "Online Academic Literature";
      }
    }

    const style = (params.style || "Harvard").toUpperCase();

    // Format author name properly
    let formattedAuthor = rawAuthor;
    let inTextAuthor = rawAuthor;

    if (rawAuthor.toLowerCase().includes("wikipedia")) {
      formattedAuthor = "Wikipedia Contributors";
      inTextAuthor = "Wikipedia Contributors";
    } else if (!rawAuthor.includes(",") && rawAuthor.includes(" ") && !rawAuthor.toLowerCase().includes("association") && !rawAuthor.toLowerCase().includes("board") && !rawAuthor.toLowerCase().includes("group")) {
      const parts = rawAuthor.split(/\s+/);
      const lastName = parts[parts.length - 1];
      const initials = parts.slice(0, -1).map(p => `${p[0]}.`).join("");
      formattedAuthor = `${lastName}, ${initials}`;
      inTextAuthor = lastName;
    } else if (rawAuthor.includes(",")) {
      inTextAuthor = rawAuthor.split(",")[0].trim();
    }

    switch (style) {
      case "APA":
      case "APA 7":
      case "APA7":
        return {
          reference: `${formattedAuthor} (${year}). ${title}. ${publisher}. ${url}`,
          inText: `(${inTextAuthor}, ${year})`,
        };

      case "IEEE":
        return {
          reference: `[1] ${formattedAuthor}, "${title}," ${publisher}, ${year}. [Online]. Available: ${url}`,
          inText: `[1]`,
        };

      case "MLA":
      case "MLA 9":
        return {
          reference: `${formattedAuthor}. "${title}." ${publisher}, ${year}, ${url}.`,
          inText: `(${inTextAuthor})`,
        };

      case "HARVARD":
      default:
        return {
          reference: `${formattedAuthor} (${year}) '${title}', ${publisher}. Available at: ${url} (Accessed: ${new Date().toLocaleDateString("en-GB")}).`,
          inText: `(${inTextAuthor}, ${year})`,
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

