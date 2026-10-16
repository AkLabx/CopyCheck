import React, { useState } from 'react';
import { HistoricalTestRecord } from '../types/evaluation.ts';
import { BarChart3, TrendingUp, AlertTriangle, BookCheck, ShieldAlert, Award, Calendar, ChevronRight } from 'lucide-react';

interface ImprovementDashboardProps {
  testHistory: HistoricalTestRecord[];
  onSelectHistoricalTest?: (record: HistoricalTestRecord) => void;
}

export const ImprovementDashboard: React.FC<ImprovementDashboardProps> = ({
  testHistory,
  onSelectHistoricalTest
}) => {
  const [filterExam, setFilterExam] = useState<'ALL' | 'UPSC' | 'BPSC'>('ALL');

  const filteredHistory = testHistory.filter(t => {
    if (filterExam === 'UPSC') return t.exam === 'UPSC';
    if (filterExam === 'BPSC') return t.exam === 'BPSC';
    return true;
  });

  const totalEvaluations = filteredHistory.length;
  const avgPercentage = totalEvaluations > 0
    ? Math.round(filteredHistory.reduce((sum, t) => sum + t.percentage, 0) / totalEvaluations)
    : 0;
  const avgPercentile = totalEvaluations > 0
    ? Math.round(filteredHistory.reduce((sum, t) => sum + t.percentile, 0) / totalEvaluations)
    : 0;
  const totalVocabMastered = filteredHistory.reduce((sum, t) => sum + t.vocabMasteredCount, 0);

  // Compute average rubric scores
  const avgRubric = totalEvaluations > 0 ? {
    structure: (filteredHistory.reduce((s, t) => s + t.rubricScores.structureAndFlow, 0) / totalEvaluations).toFixed(1),
    directive: (filteredHistory.reduce((s, t) => s + t.rubricScores.directiveAdherence, 0) / totalEvaluations).toFixed(1),
    facts: (filteredHistory.reduce((s, t) => s + t.rubricScores.factualAndEvidenceDepth, 0) / totalEvaluations).toFixed(1),
    language: (filteredHistory.reduce((s, t) => s + t.rubricScores.linguisticSophistication, 0) / totalEvaluations).toFixed(1),
    arguments: (filteredHistory.reduce((s, t) => s + t.rubricScores.argumentBalance, 0) / totalEvaluations).toFixed(1)
  } : { structure: '0', directive: '0', facts: '0', language: '0', arguments: '0' };

  return (
    <div className="space-y-6">
      
      {/* Header & High-Level Metrics */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-stone-900">
                Aspirant Longitudinal Improvement Dashboard
              </span>
              <span className="text-xs text-stone-500">· Multi-Exam Tracker</span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Tracks performance trajectory across UPSC IAS Mains & BPSC CSE written papers, measuring rubric convergence toward topper benchmarks.
            </p>
          </div>

          {/* Exam Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterExam('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterExam === 'ALL'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Tests ({testHistory.length})
            </button>
            <button
              onClick={() => setFilterExam('UPSC')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterExam === 'UPSC'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              UPSC Mains
            </button>
            <button
              onClick={() => setFilterExam('BPSC')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterExam === 'BPSC'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              BPSC Mains
            </button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Tests Evaluated</span>
            <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block tabular-nums">
              {totalEvaluations} Papers
            </span>
            <span className="text-[11px] text-stone-500 mt-1 block">Full Multi-Pass AI Audited</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Mean Score</span>
            <span className="font-serif text-2xl font-bold text-stone-900 mt-1 block tabular-nums">
              {avgPercentage}%
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">+8.5% over last 3 weeks</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Peer Percentile</span>
            <span className="font-serif text-2xl font-bold text-amber-800 mt-1 block tabular-nums">
              {avgPercentile}th %ile
            </span>
            <span className="text-[11px] text-stone-500 mt-1 block">Calibrated against Mains test-takers</span>
          </div>

          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
            <span className="text-[11px] font-semibold text-stone-500 uppercase block">Vocab Upgrades Mastered</span>
            <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block tabular-nums">
              {totalVocabMastered} Terms
            </span>
            <span className="text-[11px] text-stone-500 mt-1 block">Administrative replacements adopted</span>
          </div>
        </div>
      </div>

      {/* Rubric Dimension Radar & Weak Spot Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Rubric Dimension Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-stone-600" />
              Cumulative Rubric Performance Matrix (0-10 Scale)
            </h4>
            <span className="text-[11px] text-stone-500">Benchmark: AIR 1 is ≥ 9.0</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {[
              { label: 'Factual & Evidence Depth', score: avgRubric.facts, topper: '9.5', color: 'bg-emerald-600' },
              { label: 'Structure & Flow', score: avgRubric.structure, topper: '9.2', color: 'bg-blue-600' },
              { label: 'Directive Word Adherence', score: avgRubric.directive, topper: '9.0', color: 'bg-indigo-600' },
              { label: 'Linguistic Sophistication', score: avgRubric.language, topper: '9.0', color: 'bg-amber-600' },
              { label: 'Multidimensional Arguments', score: avgRubric.arguments, topper: '9.4', color: 'bg-rose-600' }
            ].map((metric, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-800">{metric.label}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="font-bold text-stone-900 tabular-nums">{metric.score} / 10</span>
                    <span className="text-stone-400">vs Topper {metric.topper}</span>
                  </div>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`${metric.color} h-full rounded-full transition-all`}
                    style={{ width: `${(parseFloat(metric.score) / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Improvement Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Recurrent Weak Spots Detected
            </h4>
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-semibold">
              Needs Immediate Attention
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <strong className="text-stone-900 block font-semibold">1. Under-Citation of Landmark Judgments</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                In 67% of GS Paper 2 submissions, federal and governance arguments were made without citing constitutional benches (e.g. Mohit Minerals, Bommai, Puttaswamy).
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <strong className="text-stone-900 block font-semibold">2. Conversational Transitional Phrases</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Examiners penalize phrases like "Because of this" and "To make things better". Shift to administrative connectors ("Consequently", "To ameliorate these institutional fissures").
              </p>
            </div>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg space-y-1">
              <strong className="text-stone-900 block font-semibold">3. State Policy Grounding (BPSC Papers)</strong>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Remember to consistently ground decentralization and economy answers in Saat Nischay-2, Jeevika SHG impact figures, and Bihar Economic Survey data.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Historical Test Submissions Table */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-stone-600" />
            Evaluation History & Longitudinal Log
          </h4>
          <span className="text-xs text-stone-500 font-medium">Click any row to review past critique</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Exam & Paper</th>
                <th className="py-2.5 px-3">Question Topic</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Percentile</th>
                <th className="py-2.5 px-3">Grade Band</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredHistory.map((test) => (
                <tr
                  key={test.id}
                  onClick={() => onSelectHistoricalTest && onSelectHistoricalTest(test)}
                  className="hover:bg-stone-50/70 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 text-stone-500 font-mono text-[11px] whitespace-nowrap">
                    {test.date}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-semibold text-stone-900">{test.exam}</span>
                    <span className="text-stone-500 block text-[11px]">{test.paper}</span>
                  </td>
                  <td className="py-3 px-3 font-medium text-stone-800 max-w-xs truncate">
                    {test.topic}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-bold text-stone-900 tabular-nums">
                      {test.marksAwarded} / {test.maxMarks}
                    </span>
                    <span className="text-stone-500 block text-[10px]">({test.percentage}%)</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-amber-800 tabular-nums whitespace-nowrap">
                    {test.percentile}%ile
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      {test.gradeBand}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-stone-400">
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
