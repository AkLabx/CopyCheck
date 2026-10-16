import React from 'react';
import { Pass2ContentResult } from '../types/evaluation.ts';
import { BookMarked, Scale, Landmark, FileCheck2, CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';

interface ContentAuditPanelProps {
  pass2Data: Pass2ContentResult;
}

export const ContentAuditPanel: React.FC<ContentAuditPanelProps> = ({ pass2Data }) => {
  const {
    dimensionsAudit,
    constitutionalArticles,
    supremeCourtCases,
    committeesAndReports,
    stateSpecificContext,
    factualIntegrity,
    contentDeepFeedback
  } = pass2Data;

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg font-bold text-stone-900">
              Content, Dimensions & Evidence Audit
            </span>
            <span className="text-xs text-stone-500">· Pass 2 Output</span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Independent factual examination of constitutional articles, legal precedents, committee reports, and state-specific policy frameworks.
          </p>
        </div>

        <div className="shrink-0">
          {factualIntegrity.hasFactualErrors ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5" />
              Factual Discrepancies Noted
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Factual Grounding Verified
            </span>
          )}
        </div>
      </div>

      {/* Multidimensional Coverage Matrix (PESTLE) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
          <BookMarked className="w-4 h-4 text-stone-600" />
          Multidimensional Coverage (PESTLE & Institutional Scope)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {dimensionsAudit.map((dim, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-xs space-y-1 ${
                dim.present
                  ? 'bg-emerald-50/40 border-emerald-200/80 text-stone-800'
                  : 'bg-stone-50 border-stone-200 text-stone-500'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span>{dim.dimension}</span>
                {dim.present ? (
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Covered</span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-medium uppercase">Omitted</span>
                )}
              </div>
              <p className="text-[11px] leading-normal text-stone-600">
                {dim.notes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pillars: Articles, SC Cases, Committees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        
        {/* Constitutional Articles */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold uppercase">
            <Scale className="w-4 h-4 text-amber-700" />
            <span>Constitutional Articles</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
              Articles Cited by Candidate:
            </span>
            {constitutionalArticles.cited.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {constitutionalArticles.cited.map((art, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    {art}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-stone-400 italic">None cited explicitly</span>
            )}
          </div>

          <div className="pt-2 border-t border-stone-200">
            <span className="text-[10px] font-semibold text-amber-900 uppercase block mb-1">
              Recommended High-Yield Citations:
            </span>
            <div className="space-y-1">
              {constitutionalArticles.recommendedMissed.map((art, i) => (
                <div key={i} className="text-stone-700 bg-white p-1.5 rounded border border-stone-200">
                  {art}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Supreme Court Precedents */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold uppercase">
            <Landmark className="w-4 h-4 text-stone-700" />
            <span>Landmark Judgments</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
              Precedents Cited:
            </span>
            {supremeCourtCases.cited.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {supremeCourtCases.cited.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    {c}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-stone-400 italic">No case laws cited</span>
            )}
          </div>

          <div className="pt-2 border-t border-stone-200">
            <span className="text-[10px] font-semibold text-stone-800 uppercase block mb-1">
              High-Scoring Case Laws to Add:
            </span>
            <div className="space-y-1">
              {supremeCourtCases.recommendedMissed.map((c, i) => (
                <div key={i} className="text-stone-700 bg-white p-1.5 rounded border border-stone-200">
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Committees & Reports */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-900 font-bold uppercase">
            <FileCheck2 className="w-4 h-4 text-blue-700" />
            <span>Committees & Reports</span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-stone-500 uppercase block mb-1">
              Committees Cited:
            </span>
            {committeesAndReports.cited.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {committeesAndReports.cited.map((com, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                    {com}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-stone-400 italic">No committees cited</span>
            )}
          </div>

          <div className="pt-2 border-t border-stone-200">
            <span className="text-[10px] font-semibold text-blue-900 uppercase block mb-1">
              Recommended Commissions & Data:
            </span>
            <div className="space-y-1">
              {committeesAndReports.recommendedMissed.map((com, i) => (
                <div key={i} className="text-stone-700 bg-white p-1.5 rounded border border-stone-200">
                  {com}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* State-Specific Context & Overall Content Feedback */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-900 uppercase">
            Specialized Context Focus: {stateSpecificContext.relevance}
          </span>
          <span className="px-2 py-0.5 rounded bg-stone-200 font-semibold text-stone-700">
            {stateSpecificContext.coverageQuality} Quality
          </span>
        </div>
        <p className="text-stone-700 leading-relaxed">
          {stateSpecificContext.analysis}
        </p>
        <div className="pt-2 border-t border-stone-200 text-stone-600 italic">
          <strong>Chief Auditor Summary:</strong> {contentDeepFeedback}
        </div>
      </div>

    </div>
  );
};
