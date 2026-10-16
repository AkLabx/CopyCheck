/**
 * Core pure evaluation logic for UPSC & BPSC Mains descriptive evaluation.
 * Decoupled from UI and external APIs for deterministic testing and reliability.
 */

export interface RubricCriteriaScores {
  structureAndFlow: number;       // 0 to 10 scale
  directiveAdherence: number;     // 0 to 10 scale
  factualAndEvidenceDepth: number;// 0 to 10 scale
  linguisticSophistication: number;// 0 to 10 scale
  argumentBalance: number;        // 0 to 10 scale
}

export type GradeBand = 'Topper Grade (AIR 1-100)' | 'Above Average (Interview Call)' | 'Average (Borderline)' | 'Below Average (Needs Revision)';

export interface EvaluatedSentence {
  id: string;
  originalText: string;
  classification: 'strong' | 'adequate' | 'weak' | 'error';
  feedback: string;
  suggestedVocab: {
    original: string;
    replacement: string;
    contextReason: string;
  }[];
  improvedRewrite: string;
}

/**
 * Splits essay or GS answer text into sentences without erroneously splitting on abbreviations like
 * Art. 21, e.g., i.e., Dr., vs., etc.
 */
export function splitIntoSentences(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  // Protect common abbreviations in civil services writing
  const placeholderMap: [RegExp, string][] = [
    [/\bArt\./gi, '__ART_DOT__'],
    [/\be\.g\./gi, '__EG_DOT__'],
    [/\bi\.e\./gi, '__IE_DOT__'],
    [/\bvs\./gi, '__VS_DOT__'],
    [/\bDr\./gi, '__DR_DOT__'],
    [/\bProf\./gi, '__PROF_DOT__'],
    [/\bGovt\./gi, '__GOVT_DOT__'],
    [/\bVol\./gi, '__VOL_DOT__'],
    [/\bNo\./gi, '__NO_DOT__'],
    [/(\d+)\.(\d+)/g, '$1__NUM_DOT__$2'] // decimals like 4.5%
  ];

  let sanitized = text;
  for (const [regex, placeholder] of placeholderMap) {
    sanitized = sanitized.replace(regex, placeholder);
  }

  // Split on punctuation followed by space or newline, or newlines
  const rawParts = sanitized.split(/(?<=[.?!])\s+|\n{2,}|\n(?=[A-Z0-9])/);

  const sentences: string[] = [];

  for (let part of rawParts) {
    // Restore placeholders
    part = part
      .replace(/__ART_DOT__/g, 'Art.')
      .replace(/__EG_DOT__/g, 'e.g.')
      .replace(/__IE_DOT__/g, 'i.e.')
      .replace(/__VS_DOT__/g, 'vs.')
      .replace(/__DR_DOT__/g, 'Dr.')
      .replace(/__PROF_DOT__/g, 'Prof.')
      .replace(/__GOVT_DOT__/g, 'Govt.')
      .replace(/__VOL_DOT__/g, 'Vol.')
      .replace(/__NO_DOT__/g, 'No.')
      .replace(/__NUM_DOT__/g, '.')
      .trim();

    if (part.length > 0) {
      sentences.push(part);
    }
  }

  return sentences;
}

/**
 * Calculate accurate word count for descriptive text.
 */
export function calculateWordCount(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * UPSC & BPSC official word limit penalty calculation:
 * - Within +/- 10% of limit: 0 penalty marks.
 * - 10% to 25% deviance: minor penalty (-0.5 to -1.0 mark).
 * - >25% deviance: penalty (-1.5 to -2.5 marks).
 */
export function calculateWordPenalty(wordCount: number, targetWordLimit: number): {
  penaltyMarks: number;
  status: 'optimal' | 'acceptable' | 'under_limit' | 'excessive';
  message: string;
} {
  if (targetWordLimit <= 0) return { penaltyMarks: 0, status: 'optimal', message: 'No limit set' };

  const diffPercent = ((wordCount - targetWordLimit) / targetWordLimit) * 100;

  if (diffPercent >= -10 && diffPercent <= 10) {
    return {
      penaltyMarks: 0,
      status: 'optimal',
      message: 'Within ideal ±10% UPSC word threshold.'
    };
  }

  if (diffPercent < -25) {
    return {
      penaltyMarks: 2.0,
      status: 'under_limit',
      message: `Critically under-written (${Math.round(Math.abs(diffPercent))}% below target). Missing vital arguments.`
    };
  }

  if (diffPercent < -10) {
    return {
      penaltyMarks: 0.5,
      status: 'acceptable',
      message: `Slightly brief (${Math.round(Math.abs(diffPercent))}% below target). Elaborate further.`
    };
  }

  if (diffPercent > 25) {
    return {
      penaltyMarks: 1.5,
      status: 'excessive',
      message: `Exceeds word limit by ${Math.round(diffPercent)}%. May lead to negative marking or time penalty in actual exam.`
    };
  }

  // 10% to 25% over
  return {
    penaltyMarks: 0.5,
    status: 'acceptable',
    message: `Slightly verbose (${Math.round(diffPercent)}% above limit). Ensure crispness.`
  };
}

/**
 * UPSC / BPSC Grade Band Calculator.
 * In UPSC Mains, scoring 50%+ in GS is good; 55-60%+ is topper league (AIR 1-100).
 */
export function determineGradeBand(scaledMarks: number, maxMarks: number): GradeBand {
  if (maxMarks <= 0) return 'Below Average (Needs Revision)';
  const percentage = (scaledMarks / maxMarks) * 100;

  if (percentage >= 55) {
    return 'Topper Grade (AIR 1-100)';
  } else if (percentage >= 46) {
    return 'Above Average (Interview Call)';
  } else if (percentage >= 38) {
    return 'Average (Borderline)';
  } else {
    return 'Below Average (Needs Revision)';
  }
}

/**
 * Computes overall marks based on 5 rubric criteria and max marks (typically 10, 15, or 250).
 */
export function computeFinalMarks(
  scores: RubricCriteriaScores,
  maxMarks: number,
  penalty: number = 0
): {
  totalMarks: number;
  percentage: number;
  gradeBand: GradeBand;
  weightedScore: number;
} {
  // Weights aligned with UPSC evaluation scheme:
  // Factual/Evidence: 30%, Structure: 20%, Directive: 20%, Arguments: 15%, Language: 15%
  const weightedScore = (
    scores.factualAndEvidenceDepth * 0.30 +
    scores.structureAndFlow * 0.20 +
    scores.directiveAdherence * 0.20 +
    scores.argumentBalance * 0.15 +
    scores.linguisticSophistication * 0.15
  ); // on 10 scale

  // Convert to max marks
  const rawMarks = (weightedScore / 10) * maxMarks;
  const netMarks = Math.max(0, Math.round((rawMarks - penalty) * 10) / 10);
  const percentage = Math.round((netMarks / maxMarks) * 1000) / 10;
  const gradeBand = determineGradeBand(netMarks, maxMarks);

  return {
    totalMarks: netMarks,
    percentage,
    gradeBand,
    weightedScore: Math.round(weightedScore * 10) / 10
  };
}

/**
 * Computes estimated peer percentile based on historical UPSC/BPSC marks distributions.
 */
export function computePeerPercentile(marks: number, maxMarks: number): number {
  if (maxMarks <= 0) return 50;
  const ratio = marks / maxMarks;

  if (ratio >= 0.65) return 99.4;
  if (ratio >= 0.60) return 97.5;
  if (ratio >= 0.55) return 94.2;
  if (ratio >= 0.50) return 86.0;
  if (ratio >= 0.45) return 74.0;
  if (ratio >= 0.40) return 58.0;
  if (ratio >= 0.35) return 40.0;
  if (ratio >= 0.30) return 25.0;
  return 12.0;
}
