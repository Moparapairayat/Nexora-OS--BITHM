# 📐 Nexora OS — Mathematical Foundations & Algorithmic Formulations

> **Document Purpose:** Complete mathematical reference detailing every equation, formula, and vector space used in Nexora OS's Academic Shield suite, explicitly mapping each mathematical model to its corresponding software feature, operational role, and concrete execution purpose.

---

## 🌟 Table of Contents & Feature Matrix

| Mathematical Model | 📌 Applied Feature in Nexora OS | 🎯 Core Algorithmic Purpose |
| :--- | :--- | :--- |
| **1.1 TF-IDF Weighting** | **Academic Source Search & Cross-Referencing** | Filters stop-words and isolates high-value academic vocabulary across large research corpora. |
| **1.2 Cosine Similarity** | **Semantic Similarity & Paraphrase Detection** | Calculates conceptual alignment ($0\text{–}100\%$) invariant to document length or word restructuring. |
| **2.1 N-Gram Shingling** | **Verbatim Clause & Sentence Windowing** | Sliding-window decomposition ($n=3,4$) preserving localized syntax order. |
| **2.2 Jaccard Index** | **Exact Plagiarism Overlap % Calculation** | Computes discrete intersection over union (IoU) of verbatim text against source repositories. |
| **3.1 Burstiness Index ($CV$)** | **AI Writing / Stylometric Risk Detector** | Measures sentence length variation ($\sigma/\mu$) to mathematically separate human prose from LLM output. |
| **3.2 Type-Token Ratio (TTR)** | **Lexical Diversity & Academic Vocabulary Quality** | Measures vocabulary richness ($\lvert V\rvert/N$) and detects repetitive phrasing patterns. |
| **3.3 Shannon Entropy & PP** | **AI Predictability & Transition Rhythm** | Quantifies token transition probability distributions and low-perplexity machine patterns. |
| **4.1 Levenshtein Distance** | **Fuzzy Matching & Anti-Tampering Typo Defense** | Detects character-level tampering, intentional misspellings, and homoglyph substitution tricks. |
| **5.1 Sine Waves & Bézier** | **Real-Time Fluid Scanner UI Physics** | Powers the dynamic sinusoidal wave crests and fluid surface curves in the scanning badge. |
| **6.1 Multi-Criteria Scoring** | **Final Document Originality & Risk Synthesis** | Synthesizes exact shingles ($45\%$), fuzzy edits ($25\%$), and semantic cosine ($30\%$) into $[0\%, 100\%]$. |

---

## 1. Linear Algebra & Vector Space Model

### 1.1 TF-IDF (Term Frequency – Inverse Document Frequency)

* **📌 Applied Feature:** `Web-Source Scan Engine` & `Academic Research Paper Search`.
* **🎯 Role & Purpose:** Student papers contain thousands of common words (*"the"*, *"is"*, *"in"*). TF-IDF mathematically strips statistical noise and assigns exponential weights to domain-specific scientific terminology (*"cryptography"*, *"reactivity"*, *"polymorphism"*), enabling fast indexing and cross-referencing against a large research corpus.

#### 🧮 Mathematical Equations

$$\text{Term Frequency (TF)}: \quad \text{TF}(t, d) = \frac{f_{t,d}}{\sum_{t' \in d} f_{t',d}}$$

$$\text{Inverse Document Frequency (IDF)}: \quad \text{IDF}(t, D) = \ln\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

$$\text{Final TF-IDF Weight}: \quad \text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

#### 📖 Variable Definitions

* $t$ = Specific target term/token.
* $d$ = Target student assignment document.
* $f_{t,d}$ = Absolute occurrence frequency of term $t$ in document $d$.
* $|D|$ = Total corpus size (total reference documents in the repository).
* $|\{d \in D : t \in d\}|$ = Count of documents containing term $t$.

---

### 1.2 Cosine Similarity Vector Space

* **📌 Applied Feature:** `Semantic Plagiarism & Paraphrasing Engine`.
* **🎯 Role & Purpose:** Detects students who rewrite sentences using synonyms or expand/contract paragraph lengths. By measuring the angle ($\theta$) between $n$-dimensional TF-IDF vectors rather than raw word counts, Nexora OS detects semantic concept copying regardless of text length.

#### 🧮 Mathematical Equation

$$\text{Cosine Similarity}(\vec{A}, \vec{B}) = \cos(\theta) = \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|} = \frac{\sum_{i=1}^{n} A_i B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \times \sqrt{\sum_{i=1}^{n} B_i^2}}$$

#### 📖 Variable Definitions & Proof

* $\vec{A}, \vec{B} \in \mathbb{R}^n$ = $n$-dimensional TF-IDF vectors of the student paper and the source document.
* $\vec{A} \cdot \vec{B}$ = Dot product (co-occurring conceptual weights).
* $\|\vec{A}\|, \|\vec{B}\|$ = Euclidean lengths (normalizes out document length differences).
* **Numerical Example:** If $\vec{A} = [2, 3]$ and $\vec{B} = [2, 4]$, $\text{Cosine Similarity} = \frac{16}{3.605 \times 4.472} = \mathbf{99.25\%}$ semantic match.

---

## 2. Set Theory & N-Gram Combinatorics

### 2.1 N-Gram Sliding Window Shingling Space

* **📌 Applied Feature:** `Verbatim Sentence Matching`.
* **🎯 Role & Purpose:** Deconstructs paragraphs into continuous, overlapping word shingles ($n=3, 4$). This prevents students from evading detection by simply swapping word order or rearranging clauses.

#### 🧮 Mathematical Set Construction

$$S(D, n) = \{w_i, w_{i+1}, \dots, w_{i+n-1} \mid 1 \le i \le |D|-n+1\}$$

* **Example ($n = 3$):** Text `"React is a JavaScript library"` → Shingle set: $\{\text{"React is a"}, \; \text{"is a JavaScript"}, \; \text{"a JavaScript library"}\}$.

---

### 2.2 Jaccard Similarity Coefficient (Intersection over Union)

* **📌 Applied Feature:** `Direct Plagiarism Overlap Percentage Calculator`.
* **🎯 Role & Purpose:** Calculates the exact ratio of verbatim shared shingles between the student's submission and reference sources.

#### 🧮 Mathematical Equation

$$J(A, B) = \frac{|A \cap B|}{|A \cup B|} \times 100\% = \frac{|A \cap B|}{|A| + |B| - |A \cap B|} \times 100\%$$

* **Numerical Proof:** If the student has 3 shingles, the source has 4 shingles, and 1 shingle is identical: $|A \cap B| = 1, \; |A \cup B| = 6 \implies J(A, B) = \frac{1}{6} \times 100\% = \mathbf{16.67\%}$ direct overlap.

---

## 3. Statistical Stylometrics & Information Theory

### 3.1 Burstiness Index & Coefficient of Variation ($CV$)

* **📌 Applied Feature:** `AI Writing Risk Detector`.
* **🎯 Role & Purpose:** Separates human writing from AI. Human writers vary sentence lengths naturally (e.g. 4 words, 22 words, 7 words → high variance). LLMs tend to generate predictable, uniform sentence lengths (e.g. 15 words, 16 words, 14 words → near-zero variance).

#### 🧮 Mathematical Equations

$$\text{Mean Sentence Length } (\mu) = \frac{1}{N} \sum_{i=1}^{N} L_i$$

$$\text{Standard Deviation } (\sigma) = \sqrt{\frac{1}{N} \sum_{i=1}^{N} (L_i - \mu)^2}$$

$$\text{Burstiness Index } (CV) = \frac{\sigma}{\mu}$$

#### 🎯 Classification Decision Rules

$$\text{Classification}(CV) = \begin{cases}
\mathbf{Organic\ Human\ Writing} & \text{if } CV \ge 0.40 \quad (\sigma \text{ is high; natural variation}) \\
\mathbf{Mixed\ /\ AI\text{-}Assisted} & \text{if } 0.25 \le CV < 0.40 \quad (\text{hybrid rhythm}) \\
\mathbf{High\ AI\ Risk\ (LLM)} & \text{if } CV < 0.25 \quad (\sigma \approx 0; \text{uniform synthetic cadence})
\end{cases}$$

#### 🔢 Empirical Validation

| Metric | 👤 Organic Human Text | 🤖 Synthetic AI-Style Text |
| :--- | :---: | :---: |
| Sentence lengths ($L_i$) | $[4, 20, 6]$ words | $[15, 16, 14]$ words |
| Mean length ($\mu$) | $10.0$ | $15.0$ |
| Standard deviation ($\sigma$) | $7.12$ (high variance) | $0.82$ (near-zero variance) |
| Coefficient of variation ($CV$) | $0.712$ ($CV \ge 0.40$) | $0.055$ ($CV < 0.25$) |
| Nexora classification | ✅ Organic human | 🚨 High AI risk flagged |

---

### 3.2 Type-Token Ratio (TTR — Lexical Diversity)

* **📌 Applied Feature:** `Academic Vocabulary Quality & Repetition Inspector`.
* **🎯 Role & Purpose:** Measures whether the student has used rich, varied academic vocabulary or repeated the same basic phrases continuously.

#### 🧮 Mathematical Equation

$$\text{TTR} = \frac{|V|}{N} \times 100\% \quad (|V| = \text{Unique Words Count}, \; N = \text{Total Tokens})$$

---

### 3.3 Shannon Entropy & Perplexity

* **📌 Applied Feature:** `Sentence Perplexity & Synthetic Pattern Scoring`.
* **🎯 Role & Purpose:** Measures the statistical predictability of consecutive words. AI text tends to exhibit lower entropy ($H(X)$) and lower perplexity ($\text{PP}(X)$) because language models optimize for high-probability transitions.

#### 🧮 Mathematical Equations

$$\text{Shannon Entropy}: \quad H(X) = -\sum_{i=1}^{k} P(x_i) \log_2 P(x_i)$$

$$\text{Perplexity}: \quad \text{PP}(X) = 2^{H(X)}$$

---

## 4. Metric Spaces & Dynamic Programming

### 4.1 Levenshtein Distance (Character-Level Matrix)

* **📌 Applied Feature:** `Fuzzy Matcher & Anti-Tampering Defense`.
* **🎯 Role & Purpose:** Defeats evasion tactics where students intentionally misspell words (e.g. *"JavaScript"* → *"JavvScript"*), swap letters, or introduce subtle character shifts to bypass exact string filters.

#### 🧮 Recursive Formulation

$$\text{lev}_{a,b}(i, j) = \begin{cases}
\max(i, j) & \text{if } \min(i, j) = 0, \\
\min \begin{cases}
\text{lev}_{a,b}(i-1, j) + 1 & \text{(Deletion)} \\
\text{lev}_{a,b}(i, j-1) + 1 & \text{(Insertion)} \\
\text{lev}_{a,b}(i-1, j-1) + 1_{(a_i \neq b_j)} & \text{(Substitution)}
\end{cases} & \text{otherwise.}
\end{cases}$$

#### 🧮 Normalized Fuzzy Similarity Metric

$$\text{Fuzzy Similarity}(a, b) = \left( 1 - \frac{\text{lev}(a, b)}{\max(|a|, |b|)} \right) \times 100\%$$

* **Example:** `"JavaScript"` (10 chars) vs `"JavvScript"` (10 chars) → $\text{lev} = 1 \implies \mathbf{90.0\%}$ match.

---

## 5. Applied Trigonometry & Fluid Physics

### 5.1 Sine Waves & Cubic Bézier Curves

* **📌 Applied Feature:** `Real-Time Interactive Fluid Progress Badge UI`.
* **🎯 Role & Purpose:** Instead of static loading spinners, computes real-time sinusoidal wave crests and cubic Bézier continuous curves to animate a fluid-rise effect inside the scanner badge, proportional to scan progress ($0\text{–}100\%$).

#### 🧮 Mathematical Equations

$$\text{Harmonic Sine Wave}: \quad y(x, t) = A \cdot \sin\left(\frac{2\pi}{\lambda} x - \omega t + \phi\right)$$

$$\text{Cubic Bézier Parametric Spline}: \quad \mathbf{B}(t) = (1-t)^3 \mathbf{P}_0 + 3(1-t)^2 t \mathbf{P}_1 + 3(1-t) t^2 \mathbf{P}_2 + t^3 \mathbf{P}_3, \quad t \in [0, 1]$$

---

## 6. Multi-Dimensional Weighted Scoring & Clamping

### 6.1 Multi-Criteria Weighted Originality Synthesis

* **📌 Applied Feature:** `Final Originality Score & Risk Rating Engine`.
* **🎯 Role & Purpose:** Combines discrete exact matching, fuzzy edit matching, and semantic vector matching into a single calibrated originality percentage.

#### 🧮 Mathematical Equation

$$\text{Originality Score} = 100 - \left( w_1 \cdot S_{\text{Jaccard}} + w_2 \cdot S_{\text{Fuzzy}} + w_3 \cdot S_{\text{Cosine}} \right)$$

$$\text{Weight Constraints}: \quad w_1 = 0.45 \text{ (Exact Matches)}, \; w_2 = 0.25 \text{ (Fuzzy Matches)}, \; w_3 = 0.30 \text{ (Semantic Meaning)}, \quad \sum w_k = 1.0$$

---

### 6.2 Range Interval Clamping Function

* **📌 Applied Feature:** `Score Normalization for OTHM / BTEC Grading Criteria`.
* **🎯 Role & Purpose:** Mathematically guarantees that composite scores never underflow below $0\%$ or overflow above $100\%$, ensuring compliance with UK OTHM and Pearson BTEC grading rubrics.

#### 🧮 Mathematical Equation

$$f(S) = \min(100, \max(0, S)) = \begin{cases}
0 & \text{if } S < 0 \\
S & \text{if } 0 \le S \le 100 \\
100 & \text{if } S > 100
\end{cases}$$

---

## 7. Summary

* **Deterministic by design:** every score returned by Academic Shield is backed by an explicit linear-algebra, set-theory, or statistical formula — never a black-box heuristic.
* **Layered defense:** verbatim copying (Jaccard), paraphrasing (Cosine), typo evasion (Levenshtein), and AI-generated prose (Burstiness/CV) are each caught by a different mathematical model, so evading one layer does not evade the others.
* **Bounded, grade-safe output:** the clamping function (§6.2) guarantees every composite score stays within $[0\%, 100\%]$, matching UK OTHM / Pearson BTEC grading rubric requirements.

---

*Nexora OS — Academic Integrity Engineering*
