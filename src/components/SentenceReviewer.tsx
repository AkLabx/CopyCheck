import React, { useState } from 'react';
import { EvaluatedSentence, Pass3SentencesResult } from '../types/evaluation.ts';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Sparkles, BookOpen, Copy, Check, Filter } from 'lucide-react';

interface SentenceReviewerProps {
  pass3Data: Pass3SentencesResult;
}

export const SentenceReviewer: React.FC<SentenceReviewerProps> = ({ pass3Data }) => {
  const [selectedId, setSelectedId] = useState<string>(
    pass3Data.evaluatedSentences[0]?.id || ''
  );
  const [filterMode, setFilterMode] = useState<'all' | 'needs_improvement' | 'strong'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sentences = pass3Data.evaluatedSentences;
  const selectedSentence = sentences.find(s => s.id === selectedId) || sentences[0];

  const filteredSentences = sentences.filter(s => {
    if (filterMode === 'needs_improvement') return s.classification === 'weak' || s.classification === 'error';
    if (filterMode === 'strong') return s.classification === 'strong';
    return true;
  });

  const handleCopyRewrite = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getBadgeStyle = (classification: EvaluatedSentence['classification']) => {
    switch (classification) {
      case 'strong':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'adequate':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'weak':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'error':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  const getSentenceUnderlineClass = (classification: EvaluatedSentence['classification'], isSelected: boolean) => {
    const base = 'cursor-pointer transition-all rounded px-1 py-0.5 inline ';
    if (isSelected) {
      return base + 'bg-amber-100 ring-2 ring-amber-500 font-medium text-stone-900';
    }
    switch (classification) {
      case 'strong':
        return base + 'bg-emerald-50/60 hover:bg-emerald-100 text-stone-900 border-b-2 border-emerald-400';
      case 'adequate':
        return base + 'hover:bg-stone-100 text-stone-800 border-b border-stone-300';
      case 'weak':
        return base + 'bg-amber-50 hover:bg-amber-100 text-stone-900 border-b-2 border-amber-400';
      case 'error':
        return base + 'bg-rose-50 hover:bg-rose-100 text-stone-900 border-b-2 border-rose-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Linguistic Overview Header */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold text-stone-900">
                Sentence-by-Sentence Micro-Linguistics Audit
              </span>
              <span className="text-xs text-stone-500">· Pass 3 Output</span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl">
              {pass3Data.linguisticSummary.overallImpression}
            </p>
          </div>

          {/* Metric Stats */}
          <div className="flex items-center gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
              <span className="block font-bold text-sm tabular-nums">{pass3Data.linguisticSummary.strongCount}</span>
              <span className="text-[10px] uppercase font-semibold">Strong</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-center">
              <span className="block font-bold text-sm tabular-nums">{pass3Data.linguisticSummary.adequateCount}</span>
              <span className="text-[10px] uppercase font-semibold">Adequate</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-center">
              <span className="block font-bold text-sm tabular-nums">{pass3Data.linguisticSummary.weakCount}</span>
              <span className="text-[10px] uppercase font-semibold">Weak</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-center">
              <span className="block font-bold text-sm tabular-nums">{pass3Data.linguisticSummary.errorCount}</span>
              <span className="text-[10px] uppercase font-semibold">Errors</span>
            </div>
          </div>
        </div>

        {/* Top Vocabulary Upgrades Strip */}
        {pass3Data.linguisticSummary.topVocabularyUpgrades?.length > 0 && (
          <div className="mt-4 pt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-stone-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Key Vocabulary Upgrades:
            </span>
            {pass3Data.linguisticSummary.topVocabularyUpgrades.map((item, i) => (
              <span
                key={i}
                className="text-xs text-stone-700 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 inline-flex items-center gap-1.5"
              >
                <span className="line-through text-stone-400">{item.from}</span>
                <ArrowRight className="w-3 h-3 text-amber-600 shrink-0" />
                <span className="font-semibold text-stone-900">{item.to}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Split: Interactive Text Reader vs Sentence Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Annotated Answer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
            <div className="text-xs font-semibold text-stone-800 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-stone-500" />
              <span>Interactive Annotated Answer (Click any sentence to inspect)</span>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-xs">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'all'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                All ({sentences.length})
              </button>
              <button
                onClick={() => setFilterMode('needs_improvement')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'needs_improvement'
                    ? 'bg-white text-amber-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Weak / Errors ({pass3Data.linguisticSummary.weakCount + pass3Data.linguisticSummary.errorCount})
              </button>
              <button
                onClick={() => setFilterMode('strong')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  filterMode === 'strong'
                    ? 'bg-white text-emerald-900 shadow-2xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Strong ({pass3Data.linguisticSummary.strongCount})
              </button>
            </div>
          </div>

          {/* Rendered Annotated Paragraphs */}
          <div className="font-serif text-[15px] leading-relaxed text-stone-800 space-y-3 p-4 bg-stone-50/50 rounded-lg border border-stone-200/80 min-h-[360px]">
            {filteredSentences.map((s, idx) => {
              const isSelected = s.id === selectedSentence?.id;
              return (
                <React.Fragment key={s.id}>
                  <span
                    onClick={() => setSelectedId(s.id)}
                    className={getSentenceUnderlineClass(s.classification, isSelected)}
                    title={`Click to inspect: ${s.classification.toUpperCase()}`}
                  >
                    {s.originalText}
                  </span>{' '}
                </React.Fragment>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center gap-4 text-xs text-stone-500">
            <span className="font-medium text-stone-700">Classification Legend:</span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Strong (Topper Quality)</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Adequate</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Weak Phrasing / Conversational</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Grammatical / Syntax Error</span>
            </span>
          </div>
        </div>

        {/* Right Column: Sentence Micro-Inspector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-xl p-5 shadow-xs sticky top-20 space-y-4">
          {selectedSentence ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Sentence Inspector
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded border capitalize ${getBadgeStyle(selectedSentence.classification)}`}>
                  {selectedSentence.classification}
                </span>
              </div>

              {/* Original sentence quote */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-[11px] font-semibold text-stone-500 uppercase block mb-1">
                  Original Sentence
                </span>
                <p className="font-serif text-sm text-stone-900 italic">
                  "{selectedSentence.originalText}"
                </p>
              </div>

              {/* Examiner Diagnostic Feedback */}
              <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200/80">
                <span className="text-[11px] font-semibold text-amber-900 uppercase block mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Linguistic Diagnostic
                </span>
                <p className="text-xs text-stone-700 leading-relaxed">
                  {selectedSentence.feedback}
                </p>
              </div>

              {/* Contextual Stronger Vocabulary */}
              {selectedSentence.suggestedVocab?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                    Contextual Stronger Vocabulary
                  </span>
                  <div className="space-y-2">
                    {selectedSentence.suggestedVocab.map((vocab, vIdx) => (
                      <div
                        key={vIdx}
                        className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500 line-through text-[11px]">
                            {vocab.original}
                          </span>
                          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {vocab.replacement}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60 leading-normal">
                          <strong className="text-stone-800">Context Rationale:</strong> {vocab.contextReason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topper-Level Model Sentence Rewrite */}
              {selectedSentence.improvedRewrite && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                      AIR 1 Administrative Rewrite
                    </span>
                    <button
                      onClick={() => handleCopyRewrite(selectedSentence.improvedRewrite, selectedSentence.id)}
                      className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                      title="Copy rewritten sentence"
                    >
                      {copiedId === selectedSentence.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Phrasing
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-serif text-xs leading-relaxed text-stone-900 bg-white p-2.5 rounded border border-emerald-200">
                    {selectedSentence.improvedRewrite}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-stone-400 text-xs">
              Select a sentence to view vocabulary suggestions and model rewrites.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
