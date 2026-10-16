import React, { useState } from 'react';
import { Pass4TopperResult } from '../types/evaluation.ts';
import { Award, GitCompare, Sparkles, BookOpen, Layers, CheckCircle, TrendingUp, BarChart2 } from 'lucide-react';

interface TopperAnswerSheetViewProps {
  pass4Data: Pass4TopperResult;
  candidateAnswerText: string;
  candidateMarks: number;
  maxMarks: number;
}

export const TopperAnswerSheetView: React.FC<TopperAnswerSheetViewProps> = ({
  pass4Data,
  candidateAnswerText,
  candidateMarks,
  maxMarks
}) => {
  const [viewMode, setViewMode] = useState<'topper_sheet' | 'side_by_side'>('topper_sheet');
  const { topperAnswerSheet, benchmarkMetrics } = pass4Data;

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Benchmark Metric HUD */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-stone-900">
                Topper-Level Ideal Answer Sheet & Benchmark
              </span>
              <span className="text-xs text-stone-500">· Pass 4 Output</span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Authored strictly to All-India Rank 1 examination standards with multidimensional PESTLE subheadings, micro-diagram, and value-addition anchors.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs self-start md:self-auto">
            <button
              onClick={() => setViewMode('topper_sheet')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'topper_sheet'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Ideal Answer Sheet
            </button>
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === 'side_by_side'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5 text-blue-600" />
              Peer & Topper Benchmark
            </button>
          </div>
        </div>

        {/* 3-Way Benchmark Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 text-xs">
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
            <span className="text-[10px] text-stone-500 font-semibold uppercase block">Your Score</span>
            <span className="font-serif text-xl font-bold text-stone-900 tabular-nums">
              {benchmarkMetrics.candidateScore} <span className="text-xs font-normal text-stone-500">/ {maxMarks}</span>
            </span>
            <span className="block text-[10px] text-stone-500 mt-0.5">Your Submission</span>
          </div>

          <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-center">
            <span className="text-[10px] text-stone-500 font-semibold uppercase block">Median Aspirant</span>
            <span className="font-serif text-xl font-bold text-stone-600 tabular-nums">
              {benchmarkMetrics.medianPeerScore} <span className="text-xs font-normal text-stone-500">/ {maxMarks}</span>
            </span>
            <span className="block text-[10px] text-stone-500 mt-0.5">50th Percentile</span>
          </div>

          <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-center">
            <span className="text-[10px] text-emerald-800 font-semibold uppercase block">AIR 1 Benchmark</span>
            <span className="font-serif text-xl font-bold text-emerald-900 tabular-nums">
              {benchmarkMetrics.topperBenchmarkScore} <span className="text-xs font-normal text-emerald-700">/ {maxMarks}</span>
            </span>
            <span className="block text-[10px] text-emerald-700 font-medium mt-0.5">Topper League</span>
          </div>

          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-center">
            <span className="text-[10px] text-amber-800 font-semibold uppercase block">Calibrated Percentile</span>
            <span className="font-serif text-xl font-bold text-amber-900 tabular-nums">
              {benchmarkMetrics.peerPercentile}%
            </span>
            <span className="block text-[10px] text-amber-700 font-medium mt-0.5">Against Mains Batch</span>
          </div>
        </div>
      </div>

      {viewMode === 'topper_sheet' ? (
        /* Topper Answer Booklet View */
        <div className="bg-white border border-stone-300 rounded-xl shadow-xs overflow-hidden">
          
          {/* Answer Booklet Header Bar */}
          <div className="bg-stone-900 text-stone-100 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-amber-400">UNION PUBLIC SERVICE COMMISSION & BPSC</span>
              <span className="text-stone-400">· Official Mains Answer Booklet</span>
            </div>
            <div className="text-stone-300 font-mono text-[11px]">
              Word Count: {topperAnswerSheet.wordCount} words
            </div>
          </div>

          {/* Authentic Ruled Sheet Container with Margins */}
          <div className="relative p-6 sm:p-10 ruled-paper bg-[#fdfdfb] text-stone-900 font-serif text-[15px] leading-[2.25rem]">
            
            {/* Left Margin Indicator */}
            <div className="hidden sm:block absolute left-8 top-0 bottom-0 border-r-2 border-red-300/40 w-0 select-none">
              <span className="absolute -left-6 top-12 -rotate-90 text-[9px] uppercase tracking-widest text-red-400 font-sans font-semibold">
                Do not write in this margin
              </span>
            </div>

            {/* Content within printable margins */}
            <div className="sm:ml-8 sm:mr-8 space-y-6">
              
              {/* Introduction Hook */}
              <div>
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Introduction:
                </span>
                <p className="font-medium text-stone-900">
                  {topperAnswerSheet.introHook}
                </p>
              </div>

              {/* Diagram / Flowchart Blueprint */}
              {topperAnswerSheet.diagramRepresentation && (
                <div className="my-4 p-4 bg-white/90 border border-stone-300 rounded-lg font-sans text-xs not-italic shadow-2xs">
                  <div className="flex items-center justify-between font-bold text-stone-800 uppercase mb-2">
                    <span className="flex items-center gap-1.5 text-stone-900">
                      <Layers className="w-4 h-4 text-amber-700" />
                      Visual Diagram Representation: {topperAnswerSheet.diagramRepresentation.title}
                    </span>
                    <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                      {topperAnswerSheet.diagramRepresentation.diagramType}
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-stone-600 mb-2">
                    {topperAnswerSheet.diagramRepresentation.description}
                  </p>

                  <div className="bg-stone-50 p-2.5 rounded border border-stone-200 font-mono text-xs space-y-1 text-stone-800">
                    {topperAnswerSheet.diagramRepresentation.asciiNodes.map((node, nIdx) => (
                      <div key={nIdx}>{node}</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Structured Body Sections */}
              {topperAnswerSheet.bodySections.map((section, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <h4 className="font-sans font-bold text-sm text-stone-900 underline decoration-amber-600 underline-offset-4">
                    {section.subheading}
                  </h4>
                  <ul className="list-disc list-outside ml-5 space-y-2 text-stone-800">
                    {section.points.map((pt, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Value Addition Box */}
              {topperAnswerSheet.valueAdditionHighlights && (
                <div className="my-4 p-4 bg-amber-50/70 border border-amber-200 rounded-lg font-sans text-xs">
                  <span className="font-bold text-amber-900 uppercase block mb-2">
                    Value Addition Highlights (Examiner Attention Grabbers):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <strong className="block text-amber-950 text-[10px] uppercase">Articles:</strong>
                      <span className="text-stone-700">{topperAnswerSheet.valueAdditionHighlights.articles.join(', ')}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <strong className="block text-amber-950 text-[10px] uppercase">Cases / Commissions:</strong>
                      <span className="text-stone-700">{topperAnswerSheet.valueAdditionHighlights.casesAndCommittees.join(', ')}</span>
                    </div>
                    <div className="p-2 bg-white rounded border border-amber-200">
                      <strong className="block text-amber-950 text-[10px] uppercase">Empirical Metrics:</strong>
                      <span className="text-stone-700">{topperAnswerSheet.valueAdditionHighlights.dataAndSchemes.join(', ')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Conclusion Synthesis */}
              <div className="pt-2">
                <span className="text-xs font-sans font-bold uppercase tracking-wider text-stone-500 block mb-1">
                  Way Forward & Concluding Synthesis:
                </span>
                <p className="font-medium text-stone-900">
                  {topperAnswerSheet.conclusionSynthesis}
                </p>
              </div>

            </div>

            {/* Right Margin Indicator */}
            <div className="hidden sm:block absolute right-8 top-0 bottom-0 border-l-2 border-red-300/40 w-0 select-none">
              <span className="absolute -right-6 top-12 rotate-90 text-[9px] uppercase tracking-widest text-red-400 font-sans font-semibold">
                Do not write in this margin
              </span>
            </div>

          </div>
        </div>
      ) : (
        /* Side by Side Comparative Benchmark View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left: Candidate Answer */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-semibold text-sm text-stone-900">Your Answer Submission</span>
                <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                  {candidateMarks} / {maxMarks} Marks
                </span>
              </div>
              <div className="font-serif text-xs text-stone-800 whitespace-pre-line leading-relaxed max-h-[500px] overflow-y-auto p-3 bg-stone-50 rounded-lg border border-stone-200">
                {candidateAnswerText}
              </div>
            </div>

            {/* Right: Topper Ideal Answer Summary */}
            <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-semibold text-sm text-emerald-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-700" />
                  Topper Model Structure
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {benchmarkMetrics.topperBenchmarkScore} / {maxMarks} Marks (AIR 1)
                </span>
              </div>
              <div className="text-xs text-stone-800 space-y-3 max-h-[500px] overflow-y-auto p-3 bg-stone-50 rounded-lg border border-stone-200">
                <div>
                  <strong className="text-stone-900 block mb-0.5">Intro Hook:</strong>
                  <p className="font-serif text-stone-700">{topperAnswerSheet.introHook}</p>
                </div>
                {topperAnswerSheet.bodySections.map((sec, i) => (
                  <div key={i} className="pt-2 border-t border-stone-200">
                    <strong className="text-stone-900 block mb-1">{sec.subheading}</strong>
                    <ul className="list-disc ml-4 space-y-1 font-serif text-stone-700">
                      {sec.points.map((p, pI) => (
                        <li key={pI}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="pt-2 border-t border-stone-200">
                  <strong className="text-stone-900 block mb-0.5">Way Forward:</strong>
                  <p className="font-serif text-stone-700">{topperAnswerSheet.conclusionSynthesis}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Criteria Comparison Table */}
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart2 className="w-4 h-4 text-stone-600" />
              Criteria Benchmark Gap Analysis
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Evaluation Dimension</th>
                    <th className="py-2.5 px-3">Your Score</th>
                    <th className="py-2.5 px-3">Median Peer</th>
                    <th className="py-2.5 px-3">AIR 1 Benchmark</th>
                    <th className="py-2.5 px-3">Delta Gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {benchmarkMetrics.criteriaComparison.map((row, idx) => {
                    const delta = (row.topper - row.candidate).toFixed(1);
                    return (
                      <tr key={idx} className="hover:bg-stone-50/50">
                        <td className="py-2.5 px-3 font-semibold text-stone-800">{row.criterion}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-900 tabular-nums">{row.candidate.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-stone-600 tabular-nums">{row.peer.toFixed(1)}</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-800 tabular-nums">{row.topper.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-amber-700 font-semibold tabular-nums">+{delta} to bridge</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actionable Topper Gap Roadmap */}
          <div className="bg-stone-900 text-stone-100 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" />
              3-Step Action Plan to Reach Topper Band
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {benchmarkMetrics.topperGapRoadmap.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-stone-800/80 rounded-lg border border-stone-700 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold flex items-center justify-center text-[11px]">
                      {item.step}
                    </span>
                    <span className="font-semibold text-stone-100">{item.title}</span>
                  </div>
                  <p className="text-stone-300 text-[11px] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
