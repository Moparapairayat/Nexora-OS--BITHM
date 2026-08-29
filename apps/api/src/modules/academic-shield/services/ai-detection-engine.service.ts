import type {
  AcademicShieldSentenceEvaluation,
  AcademicShieldWritingFeature,
  AcademicShieldWritingRisk,
  RiskLevel,
} from "@nexora/types";

/**
 * Categorized LLM Transition & Stylometric Hallmarks
 */
const AI_HEDGE_MARKERS = [
  "it is important to note",
  "it is worth noting",
  "it should be emphasized",
  "can be seen as",
  "plays a pivotal role",
  "plays a crucial role",
  "plays an essential role",
  "serves as a testament",
  "a testament to",
  "in today's digital age",
  "in the ever-evolving landscape",
  "navigating the complexities",
  "navigating through",
  "delves into",
  "delve deeper",
  "sheds light on",
  "underscores the importance",
  "comprehensive understanding",
  "seamlessly integrates",
  "fosters collaboration",
  "beacon of",
  "holistic approach",
  "cornerstone",
  "it is imperative",
  "paramount importance",
  "spearheading",
  "underpins the",
  "multifaceted nature",
  "orchestrating",
  "rich tapestry",
  "embark on",
  "revolutionizing",
  "by leveraging",
  "in essence",
  "in summary",
  "to summarize",
  "furthermore",
  "moreover",
  "consequently",
  "nevertheless",
  "additionally",
];

// Academic phrases that should NOT be penalized as AI markers
const ACADEMIC_LEGITIMATE_PHRASES = [
  "the results indicate",
  "empirical evidence",
  "as demonstrated in",
  "the methodology comprises",
  "data collection was conducted",
  "the hypothesis is supported",
  "validation testing",
  "statistical significance",
  "in accordance with",
  "the proposed architecture",
  "performance metrics",
  "othm assessment",
  "form validation",
  "test cases",
  "boundary values",
];

// Passive voice indicators
const PASSIVE_VOICE_REGEX = /\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en|[a-z]+t)\b/gi;

export class AIDetectionEngineService {
  /**
   * Split text into clean sentences preserving formatting
   */
  splitSentences(text: string): string[] {
    return text
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, "$1|")
      .split("|")
      .map((s) => s.trim())
      .filter((s) => s.length > 5);
  }

  /**
   * Tokenize text into words
   */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }

  /**
   * Calculate Burstiness & Sentence Variance (Coefficient of Variation)
   */
  calculateBurstiness(sentences: string[]): {
    averageLength: number;
    stdDev: number;
    coefficientOfVariation: number;
    burstinessScore: number;
  } {
    if (sentences.length === 0) {
      return { averageLength: 0, stdDev: 0, coefficientOfVariation: 0, burstinessScore: 50 };
    }

    const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
    const averageLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;

    const variance =
      lengths.reduce((sum, l) => sum + Math.pow(l - averageLength, 2), 0) /
      Math.max(lengths.length - 1, 1);
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = averageLength > 0 ? stdDev / averageLength : 0;

    // AI typically clusters with low CV (0.15 - 0.35)
    // Human writing has rich variance (CV > 0.50)
    let burstinessAiSignal = 40;
    if (coefficientOfVariation < 0.20) {
      burstinessAiSignal = 90;
    } else if (coefficientOfVariation < 0.32) {
      burstinessAiSignal = 75;
    } else if (coefficientOfVariation < 0.45) {
      burstinessAiSignal = 50;
    } else if (coefficientOfVariation > 0.60) {
      burstinessAiSignal = 18;
    } else {
      burstinessAiSignal = 28;
    }

    return {
      averageLength: Number(averageLength.toFixed(1)),
      stdDev: Number(stdDev.toFixed(1)),
      coefficientOfVariation: Number(coefficientOfVariation.toFixed(2)),
      burstinessScore: burstinessAiSignal,
    };
  }

  /**
   * Calculate Perplexity & N-Gram Predictability Indicator
   */
  calculatePerplexityApproximation(tokens: string[]): {
    perplexityIndex: number;
    predictabilityScore: number;
  } {
    if (tokens.length < 10) {
      return { perplexityIndex: 50, predictabilityScore: 50 };
    }

    // Measure repetitive trigram and bigram transitions
    const bigrams = new Map<string, number>();
    for (let i = 0; i < tokens.length - 1; i++) {
      const bg = `${tokens[i]}_${tokens[i + 1]}`;
      bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
    }

    // High bigram uniformity indicates predictable machine syntax
    const uniqueBigrams = bigrams.size;
    const bigramRatio = uniqueBigrams / Math.max(tokens.length - 1, 1);

    // AI text often has very high bigram reuse or standard low-entropy combinations
    let predictabilityScore = 30;
    if (bigramRatio < 0.65) {
      predictabilityScore = 80;
    } else if (bigramRatio < 0.78) {
      predictabilityScore = 60;
    } else if (bigramRatio > 0.90) {
      predictabilityScore = 20;
    }

    return {
      perplexityIndex: Number((bigramRatio * 100).toFixed(1)),
      predictabilityScore,
    };
  }

  /**
   * Calculate AI Markers Density with Academic Normalization
   */
  calculateAIMarkerDensity(text: string, tokenCount: number): {
    detectedMarkers: string[];
    markerCount: number;
    markerDensityPct: number;
    markerScore: number;
  } {
    const lowerText = text.toLowerCase();
    const detected: string[] = [];

    for (const marker of AI_HEDGE_MARKERS) {
      if (lowerText.includes(marker)) {
        detected.push(marker);
      }
    }

    // Check for legitimate academic safeguards
    let academicDampener = 0;
    for (const phrase of ACADEMIC_LEGITIMATE_PHRASES) {
      if (lowerText.includes(phrase)) {
        academicDampener += 1;
      }
    }

    const markerDensity = tokenCount > 0 ? (detected.length / (tokenCount / 100)) : 0;

    let markerScore = 20;
    if (markerDensity >= 2.2) {
      markerScore = 92;
    } else if (markerDensity >= 1.3) {
      markerScore = 78;
    } else if (markerDensity >= 0.6) {
      markerScore = 55;
    } else if (detected.length > 0) {
      markerScore = 38;
    } else {
      markerScore = 15;
    }

    // Apply academic dampener so legitimate research terminology is protected
    if (academicDampener >= 2) {
      markerScore = Math.max(12, markerScore - 18);
    }

    return {
      detectedMarkers: detected,
      markerCount: detected.length,
      markerDensityPct: Number(markerDensity.toFixed(2)),
      markerScore,
    };
  }

  /**
   * Calculate Lexical Diversity (Type-Token Ratio & Hapax Legomena)
   */
  calculateLexicalDiversity(tokens: string[]): {
    ttr: number;
    uniqueWordCount: number;
    hapaxLegomenaCount: number;
    diversityScore: number;
  } {
    if (tokens.length === 0) {
      return { ttr: 0, uniqueWordCount: 0, hapaxLegomenaCount: 0, diversityScore: 50 };
    }

    const freq = new Map<string, number>();
    for (const t of tokens) {
      freq.set(t, (freq.get(t) || 0) + 1);
    }

    const uniqueWordCount = freq.size;
    const ttr = uniqueWordCount / tokens.length;

    let hapaxCount = 0;
    for (const count of freq.values()) {
      if (count === 1) hapaxCount++;
    }

    let diversityScore = 35;
    if (ttr < 0.45 && tokens.length > 60) {
      diversityScore = 72; // Low vocabulary diversity
    } else if (ttr > 0.70) {
      diversityScore = 18; // High human vocabulary range
    }

    return {
      ttr: Number(ttr.toFixed(2)),
      uniqueWordCount,
      hapaxLegomenaCount: hapaxCount,
      diversityScore,
    };
  }

  /**
   * Sentence-by-Sentence Evaluator (Real Heatmap Scoring)
   */
  evaluateSentences(
    sentences: string[],
    avgLength: number,
    globalMarkers: string[]
  ): AcademicShieldSentenceEvaluation[] {
    return sentences.map((sentence, idx) => {
      const words = sentence.split(/\s+/).filter(Boolean);
      const wCount = words.length;
      const lower = sentence.toLowerCase();

      let sentenceAiProbability = 15;
      const flaggedFeatures: string[] = [];
      let reason = "Natural human sentence rhythm with authentic lexical variance.";

      // Check for markers in this sentence
      const localMarkers = AI_HEDGE_MARKERS.filter((m) => lower.includes(m));
      if (localMarkers.length > 0) {
        sentenceAiProbability += localMarkers.length * 28;
        flaggedFeatures.push(`Characteristic AI transition (${localMarkers.join(", ")})`);
        reason = `Contains distinct AI transitional phrasing (${localMarkers.slice(0, 2).join(", ")}).`;
      }

      // Check for length deviation / uniformity
      const deviation = Math.abs(wCount - avgLength);
      if (deviation < 2 && wCount > 12) {
        sentenceAiProbability += 15;
        flaggedFeatures.push("Uniform sentence length clustering");
      }

      // Check for repetitive clause openings (e.g. Furthermore, Additionally, In conclusion)
      if (/^(furthermore|moreover|consequently|additionally|in summary|in conclusion|overall|importantly),/i.test(sentence)) {
        sentenceAiProbability += 22;
        flaggedFeatures.push("Formulaic transitional opening");
        reason = "Formulaic adverbial opening frequently indexed by conversational LLMs.";
      }

      // Safeguard for legitimate academic phrasing
      if (ACADEMIC_LEGITIMATE_PHRASES.some((p) => lower.includes(p))) {
        sentenceAiProbability = Math.max(10, sentenceAiProbability - 25);
        reason = "Verified academic research structure.";
      }

      const finalProb = Math.min(98, Math.max(6, Math.round(sentenceAiProbability)));
      const riskLevel: RiskLevel =
        finalProb >= 65 ? "HIGH" : finalProb >= 35 ? "MEDIUM" : "LOW";

      return {
        index: idx + 1,
        text: sentence,
        wordCount: wCount,
        aiProbability: finalProb,
        riskLevel,
        reason: flaggedFeatures.length > 0 ? flaggedFeatures.join(". ") : reason,
        flaggedFeatures,
      };
    });
  }

  /**
   * Run Comprehensive Hybrid AI Writing Detection
   */
  detectAIWriting(text: string): AcademicShieldWritingRisk {
    const sentences = this.splitSentences(text);
    const tokens = this.tokenize(text);
    const wordCount = tokens.length;

    if (wordCount < 15) {
      return {
        id: `writing-risk-${Date.now()}`,
        score: 12,
        riskLevel: "LOW",
        confidence: "advisory",
        features: [
          {
            label: "Sample volume",
            value: "Insufficient text volume for deep stylometric inference (< 15 words).",
            impact: "LOW",
          },
        ],
        sentences: [],
        disclaimer: "This AI writing risk score is an advisory signal generated from sentence rhythm, burstiness and lexical patterns.",
      };
    }

    // 1. Burstiness analysis
    const burstiness = this.calculateBurstiness(sentences);

    // 2. AI Transition Markers & Perplexity
    const markers = this.calculateAIMarkerDensity(text, wordCount);

    // 3. Perplexity & N-gram transition predictability
    const perplexity = this.calculatePerplexityApproximation(tokens);

    // 4. Lexical Diversity
    const diversity = this.calculateLexicalDiversity(tokens);

    // 5. Granular Sentence-by-Sentence Evaluation
    const evaluatedSentences = this.evaluateSentences(
      sentences,
      burstiness.averageLength,
      markers.detectedMarkers
    );

    // Sentence-weighted aggregate
    const sentenceAvgScore =
      evaluatedSentences.length > 0
        ? evaluatedSentences.reduce((acc, s) => acc + s.aiProbability, 0) / evaluatedSentences.length
        : 20;

    // Composite Weighted Hybrid Score:
    // 30% Sentence-level granular + 25% Burstiness/CV + 25% Markers/Hedging + 10% Perplexity + 10% Lexical TTR
    const rawScore =
      sentenceAvgScore * 0.30 +
      burstiness.burstinessScore * 0.25 +
      markers.markerScore * 0.25 +
      perplexity.predictabilityScore * 0.10 +
      diversity.diversityScore * 0.10;

    const finalScore = Math.min(96, Math.max(8, Math.round(rawScore)));

    const riskLevel: RiskLevel =
      finalScore >= 65 ? "HIGH" : finalScore >= 35 ? "MEDIUM" : "LOW";

    const features: AcademicShieldWritingFeature[] = [
      {
        label: "Sentence rhythm & burstiness",
        value: `${burstiness.averageLength} avg words per sentence (CV: ${burstiness.coefficientOfVariation} — ${burstiness.coefficientOfVariation >= 0.40 ? "Natural Variance" : "Uniform Machine Pattern"})`,
        impact: burstiness.burstinessScore >= 70 ? "HIGH" : burstiness.burstinessScore >= 45 ? "MEDIUM" : "LOW",
      },
      {
        label: "AI transition & hedge markers",
        value: markers.markerCount > 0
          ? `${markers.markerCount} characteristic markers detected (${markers.detectedMarkers.slice(0, 3).join(", ")})`
          : "No characteristic AI transitional phrases found",
        impact: markers.markerScore >= 70 ? "HIGH" : markers.markerScore >= 45 ? "MEDIUM" : "LOW",
      },
      {
        label: "N-gram perplexity & predictability",
        value: `Predictability Index: ${perplexity.perplexityIndex}% (Entropy distribution matches ${perplexity.predictabilityScore < 40 ? "organic human writing" : "synthetic language model"})`,
        impact: perplexity.predictabilityScore >= 65 ? "HIGH" : perplexity.predictabilityScore >= 40 ? "MEDIUM" : "LOW",
      },
      {
        label: "Lexical vocabulary diversity",
        value: `Type-Token Ratio ${diversity.ttr} (${diversity.uniqueWordCount} unique words / ${tokens.length} total tokens)`,
        impact: diversity.diversityScore >= 65 ? "HIGH" : diversity.diversityScore >= 40 ? "MEDIUM" : "LOW",
      },
    ];

    return {
      id: `writing-risk-${Date.now()}`,
      score: finalScore,
      riskLevel,
      confidence: "advisory",
      features,
      sentences: evaluatedSentences,
      perplexityScore: perplexity.perplexityIndex,
      burstinessCv: burstiness.coefficientOfVariation,
      disclaimer: "This AI writing risk score is an institutional advisory signal based on sentence rhythm, burstiness and lexical patterns.",
    };
  }
}

export const aiDetectionEngine = new AIDetectionEngineService();
