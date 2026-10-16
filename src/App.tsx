import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { AnswerWorkspace } from './components/AnswerWorkspace.tsx';
import { MultiPassLiveMonitor, PassStatus } from './components/MultiPassLiveMonitor.tsx';
import { RubricScorecard } from './components/RubricScorecard.tsx';
import { SentenceReviewer } from './components/SentenceReviewer.tsx';
import { ContentAuditPanel } from './components/ContentAuditPanel.tsx';
import { TopperAnswerSheetView } from './components/TopperAnswerSheetView.tsx';
import { ImprovementDashboard } from './components/ImprovementDashboard.tsx';
import { QUESTION_LIBRARY, QuestionPrompt } from './data/mockPrompts.ts';
import { INITIAL_TEST_HISTORY } from './data/mockHistory.ts';
import { FullPipelineResult, HistoricalTestRecord } from './types/evaluation.ts';
import { Award, BookOpen, Sparkles, BarChart3, AlertCircle, CheckCircle2, ChevronRight, Layers, Download } from 'lucide-react';
import { EvaluationReportModal } from './components/EvaluationReportModal.tsx';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'sentence-review' | 'topper-sheet' | 'dashboard'>('workspace');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionPrompt>(QUESTION_LIBRARY[0]);
  const [answerText, setAnswerText] = useState<string>(QUESTION_LIBRARY[0].sampleStudentAnswer);

  // PDF Upload modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfModalCategory, setPdfModalCategory] = useState<'auto' | 'gs' | 'essay'>('auto');

  // Evaluation Report PDF Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const [pipelineResult, setPipelineResult] = useState<FullPipelineResult | null>(null);

  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [passStatus, setPassStatus] = useState<PassStatus>({
    pass1: 'idle',
    pass2: 'idle',
    pass3: 'idle',
    pass4: 'idle'
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Historical records for tracking improvement
  const [testHistory, setTestHistory] = useState<HistoricalTestRecord[]>(() => {
    try {
      const saved = localStorage.getItem('drishti_eval_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
    }
    return INITIAL_TEST_HISTORY;
  });

  const saveHistory = (newRecord: HistoricalTestRecord) => {
    const updated = [newRecord, ...testHistory];
    setTestHistory(updated);
    try {
      localStorage.setItem('drishti_eval_history', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  };

  const handleRunEvaluation = async (params: {
    question: string;
    directive: string;
    answerText: string;
    maxMarks: number;
    wordLimit: number;
    exam: 'UPSC' | 'BPSC';
    paper: string;
  }) => {
    setIsEvaluating(true);
    setErrorMessage(null);
    setPassStatus({
      pass1: 'running',
      pass2: 'running',
      pass3: 'running',
      pass4: 'running'
    });

    try {
      // Execute 4-pass independent evaluation pipeline via backend API
      const res = await fetch('/api/eval/run-pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      if (!res.ok) {
        throw new Error(`Evaluation pipeline returned status ${res.status}`);
      }

      const data: FullPipelineResult = await res.json();
      setPipelineResult(data);

      setPassStatus({
        pass1: 'completed',
        pass2: 'completed',
        pass3: 'completed',
        pass4: 'completed'
      });

      // Smoothly scroll down to evaluation results so user sees their score and feedback
      setTimeout(() => {
        const dossierEl = document.getElementById('evaluation-dossier-section');
        if (dossierEl) {
          dossierEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 250);

      // Record to longitudinal improvement history
      const newHistoryItem: HistoricalTestRecord = {
        id: `eval-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        exam: params.exam,
        paper: params.paper,
        topic: selectedQuestion?.topic || 'Custom Question',
        marksAwarded: data.pass1Structure.marksAwarded,
        maxMarks: data.pass1Structure.maxMarks,
        percentage: data.pass1Structure.percentage,
        percentile: data.pass4Topper.benchmarkMetrics.peerPercentile,
        gradeBand: data.pass1Structure.gradeBand,
        rubricScores: data.pass1Structure.rubricCriteriaScores,
        weakPoints: [
          data.pass1Structure.structuralBreakdown.introComment,
          data.pass2Content.factualIntegrity.issues?.[0] || 'Expand empirical articles'
        ].filter(Boolean),
        vocabMasteredCount: data.pass3Sentences.linguisticSummary.topVocabularyUpgrades?.length || 3
      };

      saveHistory(newHistoryItem);
    } catch (err: any) {
      console.error('Evaluation failure:', err);
      setErrorMessage(err.message || 'Failed to complete evaluation');
      setPassStatus({
        pass1: 'error',
        pass2: 'error',
        pass3: 'error',
        pass4: 'error'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNewEvaluation = () => {
    setActiveTab('workspace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 font-sans flex flex-col">
      {/* 3-Zone Compliant Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasEvaluated={Boolean(pipelineResult)}
        onNewEvaluation={handleNewEvaluation}
        onOpenPdfUpload={() => {
          setActiveTab('workspace');
          setPdfModalCategory('auto');
          setIsPdfModalOpen(true);
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        
        {/* Error notification if any */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-900 font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Independent Multi-Pass Live Architecture Monitor */}
        <MultiPassLiveMonitor status={passStatus} isEvaluating={isEvaluating} />

        {/* Tab View 1: Answer Desk & Evaluated Report */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <AnswerWorkspace
              onRunEvaluation={handleRunEvaluation}
              isEvaluating={isEvaluating}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              answerText={answerText}
              setAnswerText={setAnswerText}
              isPdfModalOpen={isPdfModalOpen}
              setIsPdfModalOpen={setIsPdfModalOpen}
              pdfModalCategory={pdfModalCategory}
              setPdfModalCategory={setPdfModalCategory}
            />


            {/* Quick Results Cards if evaluated */}
            {pipelineResult && (
              <div id="evaluation-dossier-section" className="space-y-6 pt-4 scroll-mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-stone-900">
                      Comprehensive Evaluation Dossier
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {pipelineResult.exam} Mains
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* DOWNLOAD REPORT BUTTON */}
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      title="Download or preview complete evaluation report PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Download Report</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('sentence-review')}
                      className="px-3 py-1.5 rounded-lg bg-stone-900 text-amber-300 font-semibold hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Inspect Sentences ({pipelineResult.pass3Sentences.linguisticSummary.totalSentences})
                    </button>
                    <button
                      onClick={() => setActiveTab('topper-sheet')}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 text-white font-semibold hover:bg-stone-700 transition-colors flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      View Topper Answer Sheet
                    </button>
                  </div>
                </div>

                {/* Pass 1: Official Rubric Scorecard */}
                <RubricScorecard
                  pass1Data={pipelineResult.pass1Structure}
                  exam={pipelineResult.exam}
                  onDownloadReport={() => setIsReportModalOpen(true)}
                />

                {/* Pass 2: Content & Evidence Audit */}
                <ContentAuditPanel pass2Data={pipelineResult.pass2Content} />

                {/* Inline preview of Sentence-by-Sentence with CTA to full tab */}
                <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-stone-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      Sentence-by-Sentence Micro-Linguistics Audit Available
                    </h4>
                    <p className="text-xs text-stone-600 mt-0.5">
                      {pipelineResult.pass3Sentences.linguisticSummary.strongCount} strong sentences,{' '}
                      {pipelineResult.pass3Sentences.linguisticSummary.weakCount} weak sentences flagged with administrative vocabulary replacements.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('sentence-review')}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800 transition-colors shrink-0 flex items-center gap-1"
                  >
                    Open Reviewer
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab View 2: Sentence-by-Sentence Review */}
        {activeTab === 'sentence-review' && (
          <div>
            {pipelineResult ? (
              <SentenceReviewer pass3Data={pipelineResult.pass3Sentences} />
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  No Evaluated Answer Found
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Submit an answer from the Answer Desk to unlock line-by-line grammatical diagnostics, highlighted flaws, and contextual civil services vocabulary upgrades.
                </p>
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                >
                  Go to Answer Desk
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab View 3: Topper Level Ideal Answer Sheet & Benchmarks */}
        {activeTab === 'topper-sheet' && (
          <div>
            {pipelineResult ? (
              <TopperAnswerSheetView
                pass4Data={pipelineResult.pass4Topper}
                candidateAnswerText={answerText}
                candidateMarks={pipelineResult.pass1Structure.marksAwarded}
                maxMarks={pipelineResult.pass1Structure.maxMarks}
              />
            ) : (
              <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Ideal Answer Sheet Not Yet Generated
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Select a prompt and execute the evaluation to generate an authentic All-India Rank 1 model answer sheet with micro-flowcharts and peer benchmark deltas.
                </p>
                <button
                  onClick={() => setActiveTab('workspace')}
                  className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800"
                >
                  Draft or Evaluate Answer
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab View 4: Longitudinal Dashboard */}
        {activeTab === 'dashboard' && (
          <ImprovementDashboard
            testHistory={testHistory}
            onSelectHistoricalTest={(record) => {
              // Could navigate to workspace or review
              setActiveTab('workspace');
            }}
          />
        )}

        {/* Evaluation Dossier PDF Report Modal */}
        {pipelineResult && (
          <EvaluationReportModal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            result={pipelineResult}
            candidateAnswerText={answerText}
          />
        )}

      </main>

      {/* Footer conforming to anti-slop rules */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">DrishtiEval</span>
            <span>·</span>
            <span>UPSC IAS & BPSC CSE Mains Descriptive Evaluation System</span>
          </div>

          <div className="flex items-center gap-6">
            <span>Official Rubric Compliance</span>
            <span>·</span>
            <span>4 Independent AI Passes</span>
            <span>·</span>
            <span>Topper Answer Blueprints</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
