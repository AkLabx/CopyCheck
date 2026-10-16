import { HistoricalTestRecord } from '../types/evaluation.ts';

export const INITIAL_TEST_HISTORY: HistoricalTestRecord[] = [
  {
    id: 'test-hist-1',
    date: '2026-09-18',
    exam: 'UPSC',
    paper: 'GS Paper 1 (Society & Geography)',
    topic: 'Urban Flooding & City Resilience',
    marksAwarded: 4.5,
    maxMarks: 10,
    percentage: 45.0,
    percentile: 58.0,
    gradeBand: 'Average (Borderline)',
    rubricScores: {
      structureAndFlow: 5.5,
      directiveAdherence: 5.0,
      factualAndEvidenceDepth: 4.0,
      linguisticSophistication: 5.0,
      argumentBalance: 4.5
    },
    weakPoints: ['Absence of NDMA guidelines', 'Lacked sponge city case studies', 'Informal language'],
    vocabMasteredCount: 4
  },
  {
    id: 'test-hist-2',
    date: '2026-09-28',
    exam: 'BPSC',
    paper: 'BPSC GS Paper 2 (Polity & Bihar)',
    topic: 'Caste Census & Social Welfare Delivery',
    marksAwarded: 19.5,
    maxMarks: 38,
    percentage: 51.3,
    percentile: 86.0,
    gradeBand: 'Above Average (Interview Call)',
    rubricScores: {
      structureAndFlow: 6.5,
      directiveAdherence: 6.0,
      factualAndEvidenceDepth: 6.5,
      linguisticSophistication: 6.0,
      argumentBalance: 6.0
    },
    weakPoints: ['Under-utilized Saat Nischay-2 metrics', 'Weak introductory hook'],
    vocabMasteredCount: 7
  },
  {
    id: 'test-hist-3',
    date: '2026-10-06',
    exam: 'UPSC',
    paper: 'GS Paper 4 (Ethics & Governance)',
    topic: 'Probity in Public Life & Whistleblower Protection',
    marksAwarded: 6.5,
    maxMarks: 10,
    percentage: 65.0,
    percentile: 97.5,
    gradeBand: 'Topper Grade (AIR 1-100)',
    rubricScores: {
      structureAndFlow: 7.5,
      directiveAdherence: 7.0,
      factualAndEvidenceDepth: 7.5,
      linguisticSophistication: 7.0,
      argumentBalance: 7.0
    },
    weakPoints: ['Could integrate 2nd ARC 4th report more explicitly'],
    vocabMasteredCount: 12
  }
];
