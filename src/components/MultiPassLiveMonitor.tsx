import React from 'react';
import { ShieldCheck, BookMarked, MessageSquareText, Award, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export interface PassStatus {
  pass1: 'idle' | 'running' | 'completed' | 'error';
  pass2: 'idle' | 'running' | 'completed' | 'error';
  pass3: 'idle' | 'running' | 'completed' | 'error';
  pass4: 'idle' | 'running' | 'completed' | 'error';
}

interface MultiPassLiveMonitorProps {
  status: PassStatus;
  isEvaluating: boolean;
}

export const MultiPassLiveMonitor: React.FC<MultiPassLiveMonitorProps> = ({ status, isEvaluating }) => {
  const passes = [
    {
      id: 'pass1',
      num: 'Pass 1',
      title: 'Rubric & Structural Evaluator',
      agent: 'Senior Chief Examiner',
      focus: 'Directive Adherence · Word Discipline · Official Marks Award',
      state: status.pass1,
      icon: ShieldCheck,
      color: 'border-blue-200 bg-blue-50/50 text-blue-900',
      activeColor: 'ring-2 ring-blue-500 bg-blue-50'
    },
    {
      id: 'pass2',
      num: 'Pass 2',
      title: 'Content & Evidence Auditor',
      agent: 'Empirical Research Auditor',
      focus: 'Constitutional Articles · SC Precedents · Committees · Bihar Context',
      state: status.pass2,
      icon: BookMarked,
      color: 'border-purple-200 bg-purple-50/50 text-purple-900',
      activeColor: 'ring-2 ring-purple-500 bg-purple-50'
    },
    {
      id: 'pass3',
      num: 'Pass 3',
      title: 'Sentence-by-Sentence Micro-Linguist',
      agent: 'Bureaucratic Lexicon Specialist',
      focus: 'Grammar Precision · Contextual Vocab Upgrades · Model Rewrites',
      state: status.pass3,
      icon: MessageSquareText,
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
      activeColor: 'ring-2 ring-amber-500 bg-amber-50'
    },
    {
      id: 'pass4',
      num: 'Pass 4',
      title: 'Topper Benchmark Synthesizer',
      agent: 'AIR 1 Model Answer Drafter',
      focus: 'Ideal Answer Sheet · Diagram Blueprint · Percentile Calibration',
      state: status.pass4,
      icon: Award,
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      activeColor: 'ring-2 ring-emerald-500 bg-emerald-50'
    }
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-stone-900 tracking-tight">
              Independent Multi-Pass Architecture
            </span>
            <span className="text-xs text-stone-500 font-normal">
              · Strict Role-Separation Protocol
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            To prevent evaluation hallucinations and generic scoring, evaluation is strictly divided across 4 specialized AI passes.
          </p>
        </div>
        
        {isEvaluating && (
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Multi-Agent Review in Progress...</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {passes.map((p, idx) => {
          const Icon = p.icon;
          const isDone = p.state === 'completed';
          const isRunning = p.state === 'running';

          return (
            <div
              key={p.id}
              className={`p-3.5 rounded-lg border transition-all ${
                isRunning
                  ? p.activeColor
                  : isDone
                  ? 'border-stone-200 bg-stone-50/70'
                  : 'border-stone-200/70 bg-white opacity-85'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`p-1.5 rounded-md ${isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-700'}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-bold text-stone-800">{p.num}</span>
                </div>

                <div>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Audited
                    </span>
                  )}
                  {isRunning && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Analyzing
                    </span>
                  )}
                  {p.state === 'idle' && (
                    <span className="text-[11px] text-stone-400">Ready</span>
                  )}
                </div>
              </div>

              <h4 className="text-xs font-semibold text-stone-900 leading-tight">
                {p.title}
              </h4>
              <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                {p.agent}
              </p>

              <div className="mt-2.5 pt-2 border-t border-stone-200/60 text-[10px] text-stone-600 leading-normal">
                {p.focus}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
