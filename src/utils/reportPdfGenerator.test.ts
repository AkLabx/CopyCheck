import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateReportFileName,
  formatReportDate,
  getGradeBadgeColors,
  generateRubricSvgChart,
  generateModelAnswerSvgDiagram,
  generatePrintableHtml
} from './reportPdfGenerator.ts';
import type { FullPipelineResult } from '../types/evaluation.ts';

test('generateReportFileName produces sanitized, descriptive filename', () => {
  const d = new Date('2026-10-15T12:00:00Z');
  const name = generateReportFileName('UPSC', 'GS Paper 2 (Polity & Governance)', d);
  assert.match(name, /^DrishtiEval_Report_UPSC_GS_Paper_2/);
  assert.ok(name.endsWith('.pdf'));
});

test('getGradeBadgeColors returns appropriate chromatic theme', () => {
  const topperTheme = getGradeBadgeColors('Topper Grade (AIR 1-100)');
  assert.equal(topperTheme.hex, '#059669');

  const averageTheme = getGradeBadgeColors('Average (Borderline)');
  assert.equal(averageTheme.hex, '#d97706');

  const belowAverage = getGradeBadgeColors('Below Average (Needs Revision)');
  assert.equal(belowAverage.hex, '#e11d48');
});

test('generateRubricSvgChart renders SVG bars and benchmark markers', () => {
  const chartHtml = generateRubricSvgChart(
    {
      structureAndFlow: 8.5,
      directiveAdherence: 7.0,
      factualAndEvidenceDepth: 8.0,
      linguisticSophistication: 7.5,
      argumentBalance: 8.0
    },
    11.5,
    15
  );

  assert.ok(chartHtml.includes('Rubric Dimension Benchmark Comparison'));
  assert.ok(chartHtml.includes('Structure & Flow'));
  assert.ok(chartHtml.includes('AIR 1 Benchmark'));
  assert.ok(chartHtml.includes('8.5 / 10.0'));
});

test('generateModelAnswerSvgDiagram outputs SVG elements with flow nodes', () => {
  const svgOutput = generateModelAnswerSvgDiagram({
    title: 'Constitutional Federalism Test',
    diagramType: 'flowchart',
    description: 'Visual flow of checks and balances',
    asciiNodes: ['[Central Mandate]', '[State Consultation]', '[Judicial Review]']
  });

  assert.ok(svgOutput.includes('<svg'));
  assert.ok(svgOutput.includes('Central'));
  assert.ok(svgOutput.includes('Mandate'));
  assert.ok(svgOutput.includes('Judicial'));
  assert.ok(svgOutput.includes('Model Answer Micro-Diagram'));
});

test('generatePrintableHtml generates complete HTML with metadata, rubric, passes, and seal', () => {
  const mockResult: FullPipelineResult = {
    success: true,
    timestamp: '2026-10-15T18:00:00Z',
    question: 'Critically analyze the role of the Governor as an agent of the Centre versus constitutional head of the State.',
    directive: 'Critically Analyze',
    exam: 'UPSC',
    paper: 'GS Paper 2 (Polity & Governance)',
    maxMarks: 15,
    wordLimit: 250,
    pass1Structure: {
      pass: 'Pass 1',
      evaluator: 'Structure AI',
      wordCount: 248,
      wordLimit: 250,
      wordPenalty: { penaltyMarks: 0, status: 'optimal', message: 'Within optimal range' },
      directiveAnalysis: { directive: 'Critically Analyze', adherenceLevel: 'High', analysisComment: 'Addressed both viewpoints' },
      structuralBreakdown: {
        introQuality: 'Strong',
        introComment: 'Good hook with Articles 153-163',
        bodyFlow: 'Well-structured',
        bodyComment: 'Balanced subheadings',
        conclusionQuality: 'Visionary',
        conclusionComment: 'Sarkaria commission cited'
      },
      rubricCriteriaScores: {
        structureAndFlow: 8,
        directiveAdherence: 7.5,
        factualAndEvidenceDepth: 8,
        linguisticSophistication: 7,
        argumentBalance: 7.5
      },
      marksAwarded: 11,
      maxMarks: 15,
      percentage: 73.3,
      gradeBand: 'Topper Grade (AIR 1-100)',
      weightedScore: 73.3,
      summaryFeedback: 'Exceptional command of constitutional nuance.'
    },
    pass2Content: {
      pass: 'Pass 2',
      evaluator: 'Evidence AI',
      dimensionsAudit: [
        { dimension: 'Constitutional', present: true, notes: 'Articles 153, 163, 356 cited' },
        { dimension: 'Judicial Precedents', present: true, notes: 'S.R. Bommai cited' }
      ],
      constitutionalArticles: { cited: ['Art 153', 'Art 163', 'Art 356'], recommendedMissed: ['Art 200'] },
      supremeCourtCases: { cited: ['S.R. Bommai (1994)'], recommendedMissed: ['Nabam Rebia (2016)'] },
      committeesAndReports: { cited: ['Sarkaria Commission'], recommendedMissed: ['Punchhi Commission (2010)'] },
      stateSpecificContext: { relevance: 'High', coverageQuality: 'Strong', analysis: 'Recent gubernatorial frictions covered' },
      factualIntegrity: { hasFactualErrors: false, issues: [], strengths: ['Accurate article numbers'] },
      contentDeepFeedback: 'Rich empirical citations.'
    },
    pass3Sentences: {
      pass: 'Pass 3',
      evaluator: 'Linguistics AI',
      evaluatedSentences: [
        {
          id: 's1',
          originalText: 'The governor sometimes does bad things to opposition state governments.',
          classification: 'weak',
          feedback: 'Too colloquial and informal.',
          suggestedVocab: [{ original: 'bad things', replacement: 'partisan interventions', contextReason: 'Administrative tone' }],
          improvedRewrite: 'Gubernatorial discretion has occasionally faced scrutiny for perceived partisan divergence in state administrations.'
        }
      ],
      linguisticSummary: {
        totalSentences: 12,
        strongCount: 8,
        adequateCount: 3,
        weakCount: 1,
        errorCount: 0,
        overallImpression: 'Sophisticated academic style',
        topVocabularyUpgrades: [{ from: 'bad things', to: 'partisan interventions' }],
        grammarAndSyntaxNotes: 'Impeccable syntax'
      }
    },
    pass4Topper: {
      pass: 'Pass 4',
      evaluator: 'Topper Benchmark AI',
      topperAnswerSheet: {
        title: 'The Dual Facet of Gubernatorial Jurisprudence',
        introHook: 'Dr. B.R. Ambedkar termed the Governor as a constitutional linchpin...',
        diagramRepresentation: {
          title: 'Governor Dual Mandate Flowchart',
          diagramType: 'flowchart',
          description: 'Checks and balances',
          asciiNodes: ['[Art 153 Mandate]', '[Discretionary Scope]', '[Judicial Review (Bommai)]']
        },
        bodySections: [
          { subheading: '1. Constitutional Facet: Impartial Umpire', points: ['Article 163(1) council of ministers advice binding'] }
        ],
        valueAdditionHighlights: {
          articles: ['Art 153', 'Art 163', 'Art 200', 'Art 356'],
          casesAndCommittees: ['S.R. Bommai', 'Nabam Rebia', 'Punchhi Commission'],
          dataAndSchemes: ['Punchhi Commission 2-year tenure clause']
        },
        conclusionSynthesis: 'Transforming the Governor into a sagacious statesperson preserves cooperative federalism.',
        wordCount: 245
      },
      benchmarkMetrics: {
        candidateScore: 11,
        medianPeerScore: 6.5,
        topperBenchmarkScore: 11.5,
        peerPercentile: 94,
        criteriaComparison: [],
        topperGapRoadmap: [
          { step: 1, title: 'Incorporate Article 200 Timeline', detail: 'Mention recent SC guidelines on gubernatorial assent to bills.' }
        ]
      }
    }
  };

  const html = generatePrintableHtml(mockResult, 'Sample candidate answer text goes here.');
  assert.ok(html.includes('DRISHTIEVAL OFFICIAL CANDIDATE DOSSIER'));
  assert.ok(html.includes('Critically Analyze'));
  assert.ok(html.includes('Topper Grade (AIR 1-100)'));
  assert.ok(html.includes('Pass 2: Macro-Structure & Flow Audit') || html.includes('Macro-Structure & Flow Audit'));
  assert.ok(html.includes('PASS 2: CONTENT & CONSTITUTIONAL EVIDENCE AUDIT'));
  assert.ok(html.includes('PASS 3: MICRO-LINGUISTIC AUDIT'));
  assert.ok(html.includes('OFFICIAL TOPPER MODEL ANSWER BLUEPRINT'));
  assert.ok(html.includes('Sample candidate answer text goes here.'));
  assert.ok(html.includes('DrishtiEval Verification Protocol'));
});
