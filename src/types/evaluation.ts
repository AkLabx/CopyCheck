export interface RubricCriteriaScores {
  structureAndFlow: number;        // 0 to 10
  directiveAdherence: number;      // 0 to 10
  factualAndEvidenceDepth: number; // 0 to 10
  linguisticSophistication: number;// 0 to 10
  argumentBalance: number;         // 0 to 10
}

export type GradeBand =
  | 'Topper Grade (AIR 1-100)'
  | 'Above Average (Interview Call)'
  | 'Average (Borderline)'
  | 'Below Average (Needs Revision)';

export interface Pass1StructureResult {
  pass: string;
  evaluator: string;
  wordCount: number;
  wordLimit: number;
  wordPenalty: {
    penaltyMarks: number;
    status: 'optimal' | 'acceptable' | 'under_limit' | 'excessive';
    message: string;
  };
  directiveAnalysis: {
    directive: string;
    adherenceLevel: 'High' | 'Moderate' | 'Low';
    analysisComment: string;
  };
  structuralBreakdown: {
    introQuality: 'Strong' | 'Adequate' | 'Weak';
    introComment: string;
    bodyFlow: 'Well-structured' | 'Disorganized' | 'Average';
    bodyComment: string;
    conclusionQuality: 'Visionary' | 'Adequate' | 'Missing/Abrupt';
    conclusionComment: string;
  };
  rubricCriteriaScores: RubricCriteriaScores;
  marksAwarded: number;
  maxMarks: number;
  percentage: number;
  gradeBand: GradeBand;
  weightedScore: number;
  summaryFeedback: string;
}

export interface Pass2ContentResult {
  pass: string;
  evaluator: string;
  dimensionsAudit: {
    dimension: string;
    present: boolean;
    notes: string;
  }[];
  constitutionalArticles: {
    cited: string[];
    recommendedMissed: string[];
  };
  supremeCourtCases: {
    cited: string[];
    recommendedMissed: string[];
  };
  committeesAndReports: {
    cited: string[];
    recommendedMissed: string[];
  };
  stateSpecificContext: {
    relevance: string;
    coverageQuality: 'Strong' | 'Adequate' | 'Neglected';
    analysis: string;
  };
  factualIntegrity: {
    hasFactualErrors: boolean;
    issues: string[];
    strengths: string[];
  };
  contentDeepFeedback: string;
}

export interface SuggestedVocab {
  original: string;
  replacement: string;
  contextReason: string;
}

export interface EvaluatedSentence {
  id: string;
  originalText: string;
  classification: 'strong' | 'adequate' | 'weak' | 'error';
  feedback: string;
  suggestedVocab: SuggestedVocab[];
  improvedRewrite: string;
}

export interface Pass3SentencesResult {
  pass: string;
  evaluator: string;
  evaluatedSentences: EvaluatedSentence[];
  linguisticSummary: {
    totalSentences: number;
    strongCount: number;
    adequateCount: number;
    weakCount: number;
    errorCount: number;
    overallImpression: string;
    topVocabularyUpgrades: { from: string; to: string }[];
    grammarAndSyntaxNotes: string;
  };
}

export interface TopperAnswerSheet {
  title: string;
  introHook: string;
  diagramRepresentation?: {
    title: string;
    diagramType: string;
    description: string;
    asciiNodes: string[];
  };
  bodySections: {
    subheading: string;
    points: string[];
  }[];
  valueAdditionHighlights: {
    articles: string[];
    casesAndCommittees: string[];
    dataAndSchemes: string[];
  };
  conclusionSynthesis: string;
  wordCount: number;
}

export interface BenchmarkMetrics {
  candidateScore: number;
  medianPeerScore: number;
  topperBenchmarkScore: number;
  peerPercentile: number;
  criteriaComparison: {
    criterion: string;
    candidate: number;
    peer: number;
    topper: number;
  }[];
  topperGapRoadmap: {
    step: number;
    title: string;
    detail: string;
  }[];
}

export interface Pass4TopperResult {
  pass: string;
  evaluator: string;
  topperAnswerSheet: TopperAnswerSheet;
  benchmarkMetrics: BenchmarkMetrics;
}

export interface FullPipelineResult {
  success: boolean;
  timestamp: string;
  question: string;
  directive: string;
  exam: 'UPSC' | 'BPSC';
  paper: string;
  maxMarks: number;
  wordLimit: number;
  pass1Structure: Pass1StructureResult;
  pass2Content: Pass2ContentResult;
  pass3Sentences: Pass3SentencesResult;
  pass4Topper: Pass4TopperResult;
}

export interface HistoricalTestRecord {
  id: string;
  date: string;
  exam: 'UPSC' | 'BPSC';
  paper: string;
  topic: string;
  marksAwarded: number;
  maxMarks: number;
  percentage: number;
  percentile: number;
  gradeBand: GradeBand;
  rubricScores: RubricCriteriaScores;
  weakPoints: string[];
  vocabMasteredCount: number;
}
