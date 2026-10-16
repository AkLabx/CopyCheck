import React from 'react';
import { Pass1StructureResult } from '../types/evaluation.ts';
import { Award, CheckCircle2, AlertCircle, FileText, Compass, BarChart, Download } from 'lucide-react';

interface RubricScorecardProps {
  pass1Data: Pass1StructureResult;
  exam: string;
  onDownloadReport?: () => void;
}

export const RubricScorecard: React.FC<RubricScorecardProps> = ({ pass1Data, exam, onDownloadReport }) => {
  const {
    marksAwarded,
    maxMarks,
    percentage,
    gradeBand,
    wordCount,
    wordLimit,
    wordPenalty,
    directiveAnalysis,
    structuralBreakdown,
    rubricCriteriaScores,
    summaryFeedback
  } = pass1Data;

  const criteriaList = [
    {
      name: 'Factual & Evidence Depth',
      weight: '30%',
      score: rubricCriteriaScores.factualAndEvidenceDepth,
      desc: 'Authenticity of data, schemes, constitutional articles, and case laws.'
    },
    {
      name: 'Structure & Flow',
      weight: '20%',
      score: rubricCriteriaScores.structureAndFlow,
      desc: 'Introductory hook, logical subheadings, paragraph transitions, and conclusion.'
    },
    {
      name: 'Directive Word Adherence',
      weight: '20%',
      score: rubricCriteriaScores.directiveAdherence,
      desc: `Fulfillment of directive requirements ("${directiveAnalysis.directive}").`
    },
    {
      name: 'Multi-Dimensional Arguments',
      weight: '15%',
      score: rubricCriteriaScores.argumentBalance,
      desc: 'PESTLE framework, affirmative vs counter perspectives, balanced synthesis.'
    },
    {
      name: 'Linguistic Sophistication',
      weight: '15%',
      score: rubricCriteriaScores.linguisticSophistication,
      desc: 'Bureaucratic vocabulary, academic register, clarity, and grammatical precision.'
    }
  ];

  const getGradeBandColor = (band: string) => {
    if (band.includes('Topper')) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (band.includes('Above Average')) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (band.includes('Average')) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Top Banner: Score & Grade Band */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-xl bg-stone-900 text-amber-400 shrink-0">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-stone-500">
                Official {exam} Evaluation Result
              </span>
              <span className="text-xs text-stone-400">· Chief Examiner Pass 1</span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-stone-900 tabular-nums">
                {marksAwarded}
              </span>
              <span className="text-sm font-semibold text-stone-500">/ {maxMarks} Marks</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2 border bg-stone-100 text-stone-700 tabular-nums">
                {percentage}% Score
              </span>
            </div>
            <div className="mt-2">
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-md border ${getGradeBandColor(gradeBand)}`}>
                {gradeBand}
              </span>
            </div>
          </div>
        </div>

        {/* Word Count & Limit Meter */}
        <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl min-w-[260px] text-xs space-y-2">
          <div className="flex items-center justify-between text-stone-600">
            <span className="font-semibold">Word Limit Discipline:</span>
            <span className="tabular-nums font-bold text-stone-900">
              {wordCount} / {wordLimit} words
            </span>
          </div>

          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                wordPenalty.status === 'optimal'
                  ? 'bg-emerald-500'
                  : wordPenalty.status === 'acceptable'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, (wordCount / wordLimit) * 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500">{wordPenalty.message}</span>
            {wordPenalty.penaltyMarks > 0 ? (
              <span className="font-bold text-rose-600">-{wordPenalty.penaltyMarks} mark</span>
            ) : (
              <span className="font-bold text-emerald-600">0 penalty</span>
            )}
          </div>

          {onDownloadReport && (
            <button
              onClick={onDownloadReport}
              className="w-full mt-2 py-1.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Report (PDF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Directive Adherence & Structural Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Directive Box */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-700" />
              Directive: {directiveAnalysis.directive}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
              directiveAnalysis.adherenceLevel === 'High'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : directiveAnalysis.adherenceLevel === 'Moderate'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}>
              {directiveAnalysis.adherenceLevel} Adherence
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">
            {directiveAnalysis.analysisComment}
          </p>
        </div>

        {/* Structural Breakdown Box */}
        <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2">
          <span className="text-xs font-bold text-stone-800 uppercase flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-stone-600" />
            Structural Anatomy Breakdown
          </span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
            <div className="p-2 bg-white rounded border border-stone-200">
              <span className="text-[10px] text-stone-500 font-semibold uppercase block">Intro</span>
              <span className="font-bold text-stone-900">{structuralBreakdown.introQuality}</span>
            </div>
            <div className="p-2 bg-white rounded border border-stone-200">
              <span className="text-[10px] text-stone-500 font-semibold uppercase block">Body</span>
              <span className="font-bold text-stone-900">{structuralBreakdown.bodyFlow}</span>
            </div>
            <div className="p-2 bg-white rounded border border-stone-200">
              <span className="text-[10px] text-stone-500 font-semibold uppercase block">Conclusion</span>
              <span className="font-bold text-stone-900">{structuralBreakdown.conclusionQuality}</span>
            </div>
          </div>
          <p className="text-[11px] text-stone-500 italic mt-1">
            {summaryFeedback}
          </p>
        </div>
      </div>

      {/* 5-Criteria Rubric Breakdown */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-stone-600" />
            Evaluation Criteria Score Matrix (0 - 10 Scale)
          </h4>
          <span className="text-[11px] text-stone-500">Official UPSC/BPSC Weights</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {criteriaList.map((crit, idx) => (
            <div
              key={idx}
              className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-stone-600">{crit.weight}</span>
                <span className="font-bold text-stone-900 tabular-nums text-sm">
                  {crit.score.toFixed(1)} / 10
                </span>
              </div>

              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-stone-900 h-full rounded-full transition-all"
                  style={{ width: `${(crit.score / 10) * 100}%` }}
                />
              </div>

              <div>
                <h5 className="font-semibold text-xs text-stone-900 leading-tight">
                  {crit.name}
                </h5>
                <p className="text-[10px] text-stone-500 mt-1 leading-normal">
                  {crit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
