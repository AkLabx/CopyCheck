import React from 'react';
import { Award, BookOpen, Clock, BarChart3, Sparkles, FileUp } from 'lucide-react';

interface HeaderProps {
  activeTab: 'workspace' | 'sentence-review' | 'topper-sheet' | 'dashboard';
  setActiveTab: (tab: 'workspace' | 'sentence-review' | 'topper-sheet' | 'dashboard') => void;
  hasEvaluated: boolean;
  onNewEvaluation: () => void;
  onOpenPdfUpload?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasEvaluated,
  onNewEvaluation,
  onOpenPdfUpload
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Single Brand Wordmark with Civil Services Emblem Motif */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center font-serif text-lg font-bold shadow-sm">
            दृ
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-stone-900 whitespace-nowrap">
              DrishtiEval
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-stone-500 -mt-1">
              UPSC & BPSC Mains AI Engine
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (Single Line, 1-2 words) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'workspace'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Answer Desk
          </button>

          <button
            onClick={() => setActiveTab('sentence-review')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 relative ${
              activeTab === 'sentence-review'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Sentence Review
            {hasEvaluated && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('topper-sheet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'topper-sheet'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            Topper Answer Sheet
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dashboard'
                ? 'bg-stone-100 text-stone-900 font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Progress Dashboard
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenPdfUpload && (
            <button
              onClick={onOpenPdfUpload}
              className="px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
              title="Upload your scanned handwritten essay or GS paper answer copy (PDF)"
            >
              <FileUp className="w-3.5 h-3.5 text-amber-800" />
              <span>Upload PDF</span>
            </button>
          )}

          <button
            onClick={onNewEvaluation}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg shadow-sm transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">New Answer Evaluation</span>
            <span className="sm:hidden">New Eval</span>
          </button>
        </div>

      </div>
    </header>
  );
};
