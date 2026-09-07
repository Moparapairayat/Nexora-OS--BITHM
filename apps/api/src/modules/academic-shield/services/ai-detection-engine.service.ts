import type {
  AcademicShieldSentenceEvaluation,
  AcademicShieldWritingFeature,
  AcademicShieldWritingRisk,
  RiskLevel,
} from "@nexora/types";

/**
 * Categorized LLM Transition & Stylometric Hallmarks
 */
/**
 * Categorized LLM Transition & Stylometric Hallmarks (Synthetic Clichés)
 */
const AI_HEDGE_MARKERS = [
  "it is important to note",
  "it is worth noting",
  "it should be emphasized",
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
  "fosters a sense of",
  "beacon of",
  "holistic approach",
  "cornerstone of",
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
  "in conclusion",
  "furthermore",
  "moreover",
  "consequently",
  "nevertheless",
  "additionally",
  "in summary",
  "to summarize",
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
      return { averageLength: 0, stdDev: 0, coefficientOfVariation: 0, burstinessScore: 0 };
    }

    const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
    const averageLength = lengths.reduce((sum, l) => sum + l, 0) / lengths.length;

    const variance =
      lengths.reduce((sum, l) => sum + Math.pow(l - averageLength, 2), 0) /
      Math.max(lengths.length - 1, 1);
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = averageLength > 0 ? stdDev / averageLength : 0;

    // AI typically clusters with low CV (0.05 - 0.25)
    // Human writing has rich natural variance (CV > 0.40)
    let burstinessAiSignal = 0;
    if (coefficientOfVariation < 0.15 && lengths.length >= 3) {
      burstinessAiSignal = 85;
    } else if (coefficientOfVariation < 0.28 && lengths.length >= 3) {
      burstinessAiSignal = 55;
    } else if (coefficientOfVariation < 0.38) {
      burstinessAiSignal = 25;
    } else if (coefficientOfVariation >= 0.45) {
      burstinessAiSignal = 0; // Natural organic variance
    } else {
      burstinessAiSignal = 10;
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

      let sentenceAiProbability = 0;
      const flaggedFeatures: string[] = [];
      let reason = "Natural human sentence rhythm with authentic lexical variance.";

      // Check for synthetic AI clichés in this sentence
      const localMarkers = AI_HEDGE_MARKERS.filter((m) => lower.includes(m));
      if (localMarkers.length > 0) {
        sentenceAiProbability += localMarkers.length * 35;
        flaggedFeatures.push(`Synthetic cliché (${localMarkers.join(", ")})`);
        reason = `Contains distinct AI transitional phrasing (${localMarkers.slice(0, 2).join(", ")}).`;
      }

      // Check for extreme length uniformity (< 1 word deviation in medium-long sentence)
      const deviation = Math.abs(wCount - avgLength);
      if (deviation < 1.5 && wCount > 15 && sentences.length >= 4) {
        sentenceAiProbability += 15;
        flaggedFeatures.push("Uniform sentence length clustering");
      }

      // Safeguard for legitimate academic research vocabulary
      if (ACADEMIC_LEGITIMATE_PHRASES.some((p) => lower.includes(p))) {
        sentenceAiProbability = Math.max(0, sentenceAiProbability - 20);
        if (sentenceAiProbability === 0) {
          reason = "Verified authentic academic phrasing and methodology.";
        }
      }

      const finalProb = Math.min(100, Math.max(0, Math.round(sentenceAiProbability)));
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
        score: 0,
        riskLevel: "LOW",
        confidence: "advisory",
        confidenceBand: "low",
        confidenceReason: "Text is too short for the sub-signals to be measured reliably.",
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
        : 0;

    // Composite Weighted Hybrid Score:
    // 35% Sentence-level granular + 25% Burstiness/CV + 25% Markers/Hedging + 15% Perplexity & Lexical Diversity
    const rawScore =
      sentenceAvgScore * 0.35 +
      burstiness.burstinessScore * 0.25 +
      markers.markerScore * 0.25 +
      perplexity.predictabilityScore * 0.08 +
      diversity.diversityScore * 0.07;

    const finalScore = Math.min(100, Math.max(0, Math.round(rawScore)));

    const riskLevel: RiskLevel =
      finalScore >= 65 ? "HIGH" : finalScore >= 35 ? "MEDIUM" : "LOW";

    // Confidence reflects how much the independent sub-signals agree with
    // each other, not how extreme the final score is. Four signals all
    // pointing the same direction is trustworthy; burstiness screaming
    // "human" while markers scream "AI" means the headline score shouldn't
    // be taken at face value — flag it for human review instead.
    const subScores = [
      sentenceAvgScore,
      burstiness.burstinessScore,
      markers.markerScore,
      perplexity.predictabilityScore,
      diversity.diversityScore,
    ];
    const subScoreMean = subScores.reduce((sum, s) => sum + s, 0) / subScores.length;
    const subScoreVariance =
      subScores.reduce((sum, s) => sum + (s - subScoreMean) ** 2, 0) / subScores.length;
    const subScoreStdDev = Math.sqrt(subScoreVariance);

    const confidenceBand: "low" | "medium" | "high" =
      subScoreStdDev <= 15 ? "high" : subScoreStdDev <= 30 ? "medium" : "low";
    const confidenceReason =
      confidenceBand === "high"
        ? "Sentence rhythm, markers, perplexity and diversity signals all point the same direction."
        : confidenceBand === "medium"
        ? "Most signals agree, but at least one metric diverges — treat the score as indicative, not conclusive."
        : "The underlying signals substantially disagree with each other. This score is unreliable on its own and should not be used without human review of the highlighted sentences.";

    const features: AcademicShieldWritingFeature[] = [
      {
        label: "Sentence rhythm & burstiness",
        value: `${burstiness.averageLength} avg words per sentence (CV: ${burstiness.coefficientOfVariation} — ${burstiness.coefficientOfVariation >= 0.40 ? "Natural Variance" : "Machine-like Regularity"})`,
        impact: burstiness.burstinessScore >= 70 ? "HIGH" : burstiness.burstinessScore >= 40 ? "MEDIUM" : "LOW",
      },
      {
        label: "AI transition & hedge markers",
        value: markers.markerCount > 0
          ? `${markers.markerCount} synthetic clichés detected (${markers.detectedMarkers.slice(0, 3).join(", ")})`
          : "No characteristic AI synthetic clichés found",
        impact: markers.markerScore >= 70 ? "HIGH" : markers.markerScore >= 40 ? "MEDIUM" : "LOW",
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
      confidenceBand,
      confidenceReason,
      features,
      sentences: evaluatedSentences,
      perplexityScore: perplexity.perplexityIndex,
      burstinessCv: burstiness.coefficientOfVariation,
      disclaimer: "This AI writing risk score is an institutional advisory signal based on sentence rhythm, burstiness and lexical patterns.",
    };
  }
}

export const aiDetectionEngine = new AIDetectionEngineService();
