import React, { useState, useEffect } from 'react';
import { QuestionPrompt, QUESTION_LIBRARY } from '../data/mockPrompts.ts';
import { calculateWordCount } from '../utils/evaluationLogic.ts';
import { PdfUploadModal, ExtractedPdfPayload } from './PdfUploadModal.tsx';
import { PdfDocumentPreview } from './PdfDocumentPreview.tsx';
import {
  BookOpen,
  Sparkles,
  Clock,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Send,
  CheckCircle2,
  ChevronDown,
  FileUp,
  FileText,
  UploadCloud,
  Eye,
  EyeOff,
  Columns,
  Maximize2,
  Minimize2,
  X
} from 'lucide-react';

interface AnswerWorkspaceProps {
  onRunEvaluation: (params: {
    question: string;
    directive: string;
    answerText: string;
    maxMarks: number;
    wordLimit: number;
    exam: 'UPSC' | 'BPSC';
    paper: string;
  }) => void;
  isEvaluating: boolean;
  selectedQuestion: QuestionPrompt;
  setSelectedQuestion: (q: QuestionPrompt) => void;
  answerText: string;
  setAnswerText: (text: string) => void;
  isPdfModalOpen?: boolean;
  setIsPdfModalOpen?: (open: boolean) => void;
  pdfModalCategory?: 'auto' | 'gs' | 'essay';
  setPdfModalCategory?: (cat: 'auto' | 'gs' | 'essay') => void;
}

export const AnswerWorkspace: React.FC<AnswerWorkspaceProps> = ({
  onRunEvaluation,
  isEvaluating,
  selectedQuestion,
  setSelectedQuestion,
  answerText,
  setAnswerText,
  isPdfModalOpen: isPdfModalOpenProp,
  setIsPdfModalOpen: setIsPdfModalOpenProp,
  pdfModalCategory: pdfModalCategoryProp,
  setPdfModalCategory: setPdfModalCategoryProp
}) => {
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('');
  const [customDirective, setCustomDirective] = useState<string>('Critically Analyze');
  const [customMarks, setCustomMarks] = useState<number>(15);
  const [customWordLimit, setCustomWordLimit] = useState<number>(250);
  const [customExam, setCustomExam] = useState<'UPSC' | 'BPSC'>('UPSC');
  const [customPaper, setCustomPaper] = useState<string>('GS Paper 2');

  // Internal state if not controlled from parent
  const [internalPdfModalOpen, setInternalPdfModalOpen] = useState<boolean>(false);
  const [internalPdfModalCategory, setInternalPdfModalCategory] = useState<'auto' | 'gs' | 'essay'>('auto');

  const isModalOpen = isPdfModalOpenProp !== undefined ? isPdfModalOpenProp : internalPdfModalOpen;
  const setModalOpen = setIsPdfModalOpenProp || setInternalPdfModalOpen;

  const modalCategory = pdfModalCategoryProp !== undefined ? pdfModalCategoryProp : internalPdfModalCategory;
  const setModalCategory = setPdfModalCategoryProp || setInternalPdfModalCategory;

  const [isDeskDragging, setIsDeskDragging] = useState<boolean>(false);

  // PDF Preview State
  const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
  const [isSplitExpanded, setIsSplitExpanded] = useState<boolean>(true);
  const [mobileActiveView, setMobileActiveView] = useState<'preview' | 'editor'>('preview');

  const [activePdfDocument, setActivePdfDocument] = useState<{
    fileName: string;
    fileSize?: number;
    exam: 'UPSC' | 'BPSC';
    paper: string;
    question: string;
    directive?: string;
    answerText: string;
    pdfDataUrl?: string | null;
    ocrConfidence?: string;
    pageCountEstimated?: number;
  } | null>(null);

  const [uploadedPdfInfo, setUploadedPdfInfo] = useState<{
    fileName: string;
    ocrConfidence: string;
    detectedPaper: string;
  } | null>(null);

  // Timer states for Mains simulation
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentWordCount = calculateWordCount(answerText);
  const targetWordLimit = isCustomMode ? customWordLimit : selectedQuestion.wordLimit;
  const currentMaxMarks = isCustomMode ? customMarks : selectedQuestion.maxMarks;
  const currentDirective = isCustomMode ? customDirective : selectedQuestion.directive;
  const currentExam = isCustomMode ? customExam : selectedQuestion.exam;
  const currentPaper = isCustomMode ? customPaper : selectedQuestion.paper;
  const activeQuestionText = isCustomMode ? customQuestion : selectedQuestion.questionText;

  const handleSelectPrompt = (promptId: string) => {
    const found = QUESTION_LIBRARY.find(q => q.id === promptId);
    if (found) {
      setSelectedQuestion(found);
      setIsCustomMode(false);
      setAnswerText(found.sampleStudentAnswer);
      setUploadedPdfInfo(null);
      setActivePdfDocument(null);
      setShowPdfPreview(false);
      setTimerSeconds(0);
      setIsTimerRunning(false);
    }
  };

  const handleLoadSampleAnswer = () => {
    setAnswerText(selectedQuestion.sampleStudentAnswer);
    setUploadedPdfInfo(null);
    setActivePdfDocument(null);
    setShowPdfPreview(false);
  };

  const handleClearAnswer = () => {
    setAnswerText('');
    setUploadedPdfInfo(null);
    setActivePdfDocument(null);
    setShowPdfPreview(false);
    setTimerSeconds(0);
    setIsTimerRunning(false);
  };

  const handleOpenPdfWithCategory = (cat: 'auto' | 'gs' | 'essay') => {
    setModalCategory(cat);
    setModalOpen(true);
  };

  const handlePdfExtracted = (payload: ExtractedPdfPayload) => {
    setAnswerText(payload.extractedAnswerText);
    setIsCustomMode(true);
    setCustomExam(payload.detectedExam);
    setCustomPaper(payload.detectedPaper);
    setCustomQuestion(payload.detectedQuestion);
    setCustomDirective(payload.detectedDirective || 'Discuss');

    // Default marks and word limit according to paper type
    const isEssay = payload.detectedPaper.toLowerCase().includes('essay');
    const marks = isEssay ? 125 : payload.detectedExam === 'BPSC' ? 38 : 15;
    const words = isEssay ? 1000 : payload.detectedExam === 'BPSC' ? 400 : 250;
    setCustomMarks(marks);
    setCustomWordLimit(words);

    setUploadedPdfInfo({
      fileName: payload.fileName,
      ocrConfidence: payload.ocrConfidence,
      detectedPaper: payload.detectedPaper
    });

    // Populate active PDF document preview alongside text editor
    setActivePdfDocument({
      fileName: payload.fileName,
      fileSize: payload.fileSize,
      exam: payload.detectedExam,
      paper: payload.detectedPaper,
      question: payload.detectedQuestion,
      directive: payload.detectedDirective || 'Discuss',
      answerText: payload.extractedAnswerText,
      pdfDataUrl: payload.pdfDataUrl || null,
      ocrConfidence: payload.ocrConfidence,
      pageCountEstimated: payload.pageCountEstimated || (isEssay ? 3 : 2)
    });

    // Automatically open the side-by-side preview component
    setShowPdfPreview(true);
    setMobileActiveView('preview');

    if (payload.autoEvaluateImmediately && payload.extractedAnswerText.trim()) {
      onRunEvaluation({
        question: payload.detectedQuestion,
        directive: payload.detectedDirective || 'Discuss',
        answerText: payload.extractedAnswerText,
        maxMarks: marks,
        wordLimit: words,
        exam: payload.detectedExam,
        paper: payload.detectedPaper
      });
    }
  };

  // Instant Sample Preview Option (for quick testing alongside editor)
  const handleLoadSamplePdfPreview = (type: 'gs' | 'essay' = 'gs') => {
    if (type === 'gs') {
      const gsText = `Article 263 of the Indian Constitution provides for an Inter-State Council (ISC) to inquire into and advise upon disputes between States, and to deliberate upon subjects of common interest. Established in 1990 following the Sarkaria Commission recommendations, it was envisioned as the premier constitutional platform for cooperative federalism. However, over the past three decades, the ISC has met only 11 times, rendering it largely dormant.

Structural and Political Impediments:
1. Advisory Status: Under Art. 263, the recommendations of the ISC are purely advisory and non-binding on the Union and States.
2. Irregular Meetings: Despite the mandate to meet thrice a year, prolonged intervals of several years between meetings prevent timely resolution of inter-state friction.
3. Eclipse by Alternative Fora: The rise of the GST Council (Art. 279A) and NITI Aayog Governing Council has diverted institutional focus, although neither replaces the constitutional dispute-resolution mandate of Art. 263.
4. Over-centralization & Asymmetric Federalism: Persistent friction over Governor's discretionary powers under Art. 163/200 and central agency deployment remains unresolved in ISC deliberations.

Revitalization Roadmap:
1. Statutory Regularity: Amend ISC rules to mandate at least two compulsory plenary sessions annually.
2. Permanent Secretariat: Upgrade the ISC Secretariat with independent policy researchers, as recommended by the Punchhi Commission (2010).
3. Equal Agenda Setting: States must have equal power with the Union in formulating meeting agendas.

Revitalizing the ISC is essential to realize the constitutional vision of competitive yet cooperative federalism as outlined in the S.R. Bommai judgment.`;

      setAnswerText(gsText);
      setIsCustomMode(true);
      setCustomExam('UPSC');
      setCustomPaper('GS Paper 2 (Polity & Governance)');
      setCustomQuestion('The Inter-State Council (Article 263) has remained an under-utilized institutional mechanism for cooperative federalism in India. Critically examine the structural and political impediments hindering its efficacy, and suggest reforms to revitalize it.');
      setCustomDirective('Critically Examine');
      setCustomMarks(15);
      setCustomWordLimit(250);

      setUploadedPdfInfo({
        fileName: 'UPSC_GS2_InterStateCouncil_Federalism_Sample.pdf',
        ocrConfidence: 'High',
        detectedPaper: 'GS Paper 2 (Polity & Governance)'
      });

      setActivePdfDocument({
        fileName: 'UPSC_GS2_InterStateCouncil_Federalism_Sample.pdf',
        fileSize: 285000,
        exam: 'UPSC',
        paper: 'GS Paper 2 (Polity & Governance)',
        question: 'The Inter-State Council (Article 263) has remained an under-utilized institutional mechanism for cooperative federalism in India. Critically examine the structural and political impediments hindering its efficacy, and suggest reforms to revitalize it.',
        directive: 'Critically Examine',
        answerText: gsText,
        pdfDataUrl: null,
        ocrConfidence: 'High',
        pageCountEstimated: 2
      });

      setShowPdfPreview(true);
      setMobileActiveView('preview');
    } else {
      const essayText = `The quote "Forests precede civilizations and deserts follow them" was originally stated by the French romantic writer Chateaubriand. It captures how human development has historically destroyed ecological balance.

Civilizations arose in fertile river basins covered with dense forests. However, excessive exploitation of natural resources, deforestation for agriculture, and urban greed turned lush green landscapes into barren wastelands. Ancient civilizations like Mesopotamia and the Maya collapsed largely due to ecological degradation and water mismanagement.

In our current Anthropocene epoch, this destruction has reached a planetary scale. Climate change, melting glaciers, and loss of biodiversity threaten human survival. Economic growth based on endless consumption is unsustainable. We must adopt sustainable development, renewable energy, and protect tribal forest rights under the Forest Rights Act. As Mahatma Gandhi said, the earth has enough for everyone's need but not for anyone's greed.`;

      setAnswerText(essayText);
      setIsCustomMode(true);
      setCustomExam('UPSC');
      setCustomPaper('Essay Paper');
      setCustomQuestion('“Forests precede civilizations and deserts follow them.” In the context of the Anthropocene epoch and planetary boundaries, elaborate on the philosophical and governance imperatives for sustainable coexistence.');
      setCustomDirective('Elaborate with Multidimensional Perspectives');
      setCustomMarks(125);
      setCustomWordLimit(1000);

      setUploadedPdfInfo({
        fileName: 'UPSC_Essay_Chateaubriand_Anthropocene.pdf',
        ocrConfidence: 'High',
        detectedPaper: 'Essay Paper'
      });

      setActivePdfDocument({
        fileName: 'UPSC_Essay_Chateaubriand_Anthropocene.pdf',
        fileSize: 485000,
        exam: 'UPSC',
        paper: 'Essay Paper',
        question: '“Forests precede civilizations and deserts follow them.” In the context of the Anthropocene epoch and planetary boundaries, elaborate on the philosophical and governance imperatives for sustainable coexistence.',
        directive: 'Elaborate with Multidimensional Perspectives',
        answerText: essayText,
        pdfDataUrl: null,
        ocrConfidence: 'High',
        pageCountEstimated: 3
      });

      setShowPdfPreview(true);
      setMobileActiveView('preview');
    }
  };

  const handleSubmit = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!answerText.trim()) return;

    const finalQuestion =
      (activeQuestionText && activeQuestionText.trim()) ||
      activePdfDocument?.question ||
      selectedQuestion.questionText ||
      'UPSC / BPSC Descriptive Mains Examination Submission';

    const finalDirective =
      (currentDirective && currentDirective.trim()) ||
      activePdfDocument?.directive ||
      selectedQuestion.directive ||
      'Discuss';

    onRunEvaluation({
      question: finalQuestion,
      directive: finalDirective,
      answerText,
      maxMarks: currentMaxMarks || 15,
      wordLimit: targetWordLimit || 250,
      exam: currentExam || 'UPSC',
      paper: currentPaper || 'General Studies'
    });
  };

  const getDirectiveDescription = (directive: string) => {
    switch (directive.toLowerCase()) {
      case 'critically analyze':
      case 'critically examine':
        return 'Weigh both affirmative arguments and structural counter-perspectives, assess evidence rigorously, and deliver an objective, balanced synthesis.';
      case 'discuss':
        return 'Explore multiple facets of the issue, debate various viewpoints, and present a reasoned exploration with relevant examples.';
      case 'elucidate':
      case 'illustrate':
        return 'Make the concept lucid and transparent by breaking down complex mechanisms, citing clear real-world examples, cases, and illustrations.';
      case 'examine':
        return 'Investigate the facts and causes thoroughly, probing beneath the surface of claims to expose systemic realities.';
      default:
        return 'Address all dimensions requested with clear administrative tone and empirical citations.';
    }
  };

  return (
    <div className="space-y-5">
      
      {/* Prominent PDF Upload & Preview Banner */}
      <div className="bg-gradient-to-r from-amber-50 via-white to-stone-50 border border-amber-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
              <FileUp className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif font-bold text-stone-900 text-sm sm:text-base">
                  Upload Answer Sheet Copy (PDF)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  UPSC & BPSC Mains
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Side-by-Side PDF Preview
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Upload your scanned handwritten booklet or typed PDF for either <strong>Essay Paper</strong> or <strong>GS Paper (GS 1, 2, 3, 4)</strong>. View your original document alongside the ruled editor before evaluation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenPdfWithCategory('gs')}
              className="px-3.5 py-2 text-xs font-bold bg-amber-800 hover:bg-amber-900 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Upload PDF of your General Studies answer (GS 1, 2, 3, 4 or BPSC GS)"
            >
              <FileText className="w-3.5 h-3.5 text-amber-200" />
              <span>Upload GS Paper (PDF)</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenPdfWithCategory('essay')}
              className="px-3.5 py-2 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Upload PDF of your complete Essay Paper (UPSC or BPSC 1000w)"
            >
              <FileUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Upload Essay (PDF)</span>
            </button>

            {/* Instant Sample Preview Button */}
            {!activePdfDocument && (
              <button
                type="button"
                onClick={() => handleLoadSamplePdfPreview('gs')}
                className="px-3 py-2 text-xs font-semibold bg-white hover:bg-stone-50 text-stone-800 rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Preview a sample GS Paper 2 booklet copy alongside the text editor"
              >
                <Columns className="w-3.5 h-3.5 text-amber-700" />
                <span>Preview Sample Alongside Editor</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Document Status Strip */}
        {activePdfDocument && (
          <div className="pt-2 border-t border-amber-200/60 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-stone-800">
                <span className="font-semibold flex items-center gap-1 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  PDF Uploaded:
                </span>
                <span className="font-mono bg-stone-100 px-2 py-0.5 rounded text-stone-900 font-bold border border-stone-200">
                  {activePdfDocument.fileName}
                </span>
                <span className="text-stone-500">· {activePdfDocument.paper}</span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                  ✓ Text Transcribed ({currentWordCount} words)
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Primary Evaluation Trigger Button right at top */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isEvaluating || !answerText.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm ring-2 ring-amber-400/40"
                  title="Click to examine and grade paper using 4-Pass AI Engine"
                >
                  {isEvaluating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                      <span>Evaluating Paper...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-stone-950" />
                      <span>Run 4-Pass AI Evaluation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    showPdfPreview
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-stone-900 text-amber-300 hover:bg-stone-800'
                  }`}
                >
                  {showPdfPreview ? (
                    <>
                      <EyeOff className="w-3 h-3 text-amber-800" />
                      <span>Hide PDF</span>
                    </>
                  ) : (
                    <>
                      <Columns className="w-3 h-3 text-amber-300" />
                      <span>View PDF</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenPdfWithCategory('auto')}
                  className="text-stone-600 hover:text-stone-900 text-xs font-medium underline cursor-pointer"
                >
                  Change File
                </button>
              </div>
            </div>

            {/* Instruction Banner explaining how evaluation happens */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-900">⚡ Ready for Examination:</span>
                <span>The PDF content is transcribed into the workspace. Click <strong>"Run 4-Pass AI Evaluation"</strong> to examine and generate rubric scores, model answers, and feedback.</span>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isEvaluating || !answerText.trim()}
                className="text-xs font-bold text-stone-900 underline hover:text-stone-700 self-start sm:self-auto cursor-pointer"
              >
                Start Evaluation Now →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Question Selector & Configuration Card */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
        
        {/* Top Toggle: Presets vs Custom Question vs PDF Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-stone-900">
              Exam Paper & Question Configuration
            </span>
            <span className="text-xs text-stone-500">· Official Syllabus Alignment</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-0.5 bg-stone-100 rounded-lg text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsCustomMode(false)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                !isCustomMode
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              UPSC / BPSC Library
            </button>
            <button
              type="button"
              onClick={() => setIsCustomMode(true)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                isCustomMode
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Custom Question Entry
            </button>
            <button
              type="button"
              onClick={() => handleOpenPdfWithCategory('auto')}
              className="px-3 py-1.5 rounded-md font-bold transition-colors bg-amber-100/80 hover:bg-amber-200 text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5 text-amber-800" />
              <span>Upload PDF Copy</span>
            </button>
          </div>
        </div>

        {!isCustomMode ? (
          /* Presets Dropdown & Details */
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Previous Year Question (PYQ) or Curated Prompt:
                </label>
                <div className="relative">
                  <select
                    value={selectedQuestion.id}
                    onChange={(e) => handleSelectPrompt(e.target.value)}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg p-2.5 pr-8 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400 font-medium"
                  >
                    {QUESTION_LIBRARY.map((q) => (
                      <option key={q.id} value={q.id}>
                        [{q.exam}] {q.paper} — {q.topic} ({q.year || 'Model'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="md:col-span-5 flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenPdfWithCategory('auto')}
                  className="w-1/2 py-2.5 px-3 text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Upload a PDF file of your handwritten or typed essay/GS paper copy"
                >
                  <FileUp className="w-3.5 h-3.5 text-amber-700" />
                  <span>Upload PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleLoadSampleAnswer}
                  className="w-1/2 py-2.5 px-3 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg border border-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Loads a realistic aspirant answer with intentional errors and colloquial phrasing to review"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sample Answer</span>
                </button>
              </div>
            </div>

            {/* Display Active Question Text */}
            <div className="p-4 bg-stone-50/80 rounded-xl border border-stone-200 space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-600">
                <span className="font-bold px-2 py-0.5 rounded bg-stone-900 text-amber-400">
                  {selectedQuestion.exam}
                </span>
                <span className="font-semibold text-stone-700">{selectedQuestion.paper}</span>
                <span>·</span>
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Directive: {selectedQuestion.directive}
                </span>
                <span>·</span>
                <span>Max Marks: {selectedQuestion.maxMarks}</span>
                <span>·</span>
                <span>Word Limit: {selectedQuestion.wordLimit} words</span>
              </div>

              <p className="font-serif text-sm font-semibold text-stone-900 leading-snug">
                {selectedQuestion.questionText}
              </p>

              {/* Directive Advisory */}
              <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/60">
                <strong className="text-stone-800">Directive Demand:</strong>{' '}
                {getDirectiveDescription(selectedQuestion.directive)}
              </div>
            </div>
          </div>
        ) : (
          /* Custom Question Form */
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-stone-700">Custom Answer Specification:</span>
              <button
                type="button"
                onClick={() => handleOpenPdfWithCategory('auto')}
                className="text-xs font-bold text-amber-800 hover:text-amber-900 inline-flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded border border-amber-300 cursor-pointer"
              >
                <FileUp className="w-3.5 h-3.5 text-amber-700" />
                <span>Upload PDF Document</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Target Exam:</label>
                <select
                  value={customExam}
                  onChange={(e) => setCustomExam(e.target.value as 'UPSC' | 'BPSC')}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-md p-2"
                >
                  <option value="UPSC">UPSC IAS Mains</option>
                  <option value="BPSC">BPSC CSE Mains</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Paper:</label>
                <input
                  type="text"
                  value={customPaper}
                  onChange={(e) => setCustomPaper(e.target.value)}
                  placeholder="e.g. Essay Paper / GS Paper 2"
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-md p-2"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">Directive Word:</label>
                <select
                  value={customDirective}
                  onChange={(e) => setCustomDirective(e.target.value)}
                  className="w-full text-xs bg-stone-50 border border-stone-200 rounded-md p-2 font-medium"
                >
                  <option value="Critically Analyze">Critically Analyze</option>
                  <option value="Critically Examine">Critically Examine</option>
                  <option value="Discuss">Discuss</option>
                  <option value="Elucidate">Elucidate</option>
                  <option value="Examine">Examine</option>
                  <option value="Evaluate">Evaluate</option>
                  <option value="Comment">Comment</option>
                  <option value="Elaborate with Multidimensional Perspectives">Elaborate with Multidimensional Perspectives</option>
                </select>
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Marks:</label>
                  <input
                    type="number"
                    value={customMarks}
                    onChange={(e) => setCustomMarks(Number(e.target.value))}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-md p-2"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-[11px] font-semibold text-stone-600 mb-1">Words:</label>
                  <input
                    type="number"
                    value={customWordLimit}
                    onChange={(e) => setCustomWordLimit(Number(e.target.value))}
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-md p-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                Enter Custom Question Text / Essay Title:
              </label>
              <textarea
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Type or paste the official descriptive question prompt here..."
                rows={2}
                className="w-full text-xs font-serif bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-400"
              />
            </div>
          </div>
        )}

      </div>

      {/* Mobile Tab Switcher when PDF Preview is Active */}
      {showPdfPreview && activePdfDocument && (
        <div className="lg:hidden flex items-center justify-center p-1 bg-stone-200 rounded-xl border border-stone-300">
          <button
            type="button"
            onClick={() => setMobileActiveView('preview')}
            className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileActiveView === 'preview'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-amber-700" />
            <span>Uploaded PDF Document</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileActiveView('editor')}
            className={`w-1/2 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
              mobileActiveView === 'editor'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-stone-700" />
            <span>Ruled Text Editor</span>
          </button>
        </div>
      )}

      {/* Workspace Area: Side-by-Side (Split) or Single View */}
      <div
        className={`grid grid-cols-1 ${
          showPdfPreview && activePdfDocument && isSplitExpanded
            ? 'lg:grid-cols-2 gap-5 items-stretch'
            : 'gap-0'
        }`}
      >
        
        {/* Left Column: PDF Document Preview Component */}
        {showPdfPreview && activePdfDocument && (
          <div
            className={`${
              mobileActiveView === 'editor' ? 'hidden lg:block' : 'block'
            } h-full min-h-[580px]`}
          >
            <PdfDocumentPreview
              fileName={activePdfDocument.fileName}
              fileSize={activePdfDocument.fileSize}
              exam={activePdfDocument.exam}
              paper={activePdfDocument.paper}
              question={activePdfDocument.question}
              directive={activePdfDocument.directive}
              answerText={answerText}
              pdfDataUrl={activePdfDocument.pdfDataUrl}
              ocrConfidence={activePdfDocument.ocrConfidence}
              pageCountEstimated={activePdfDocument.pageCountEstimated}
              onClose={() => setShowPdfPreview(false)}
              onReUpload={() => handleOpenPdfWithCategory('auto')}
              isSplitView={isSplitExpanded}
              onToggleSplitView={() => setIsSplitExpanded(!isSplitExpanded)}
              onRunEvaluation={handleSubmit}
              isEvaluating={isEvaluating}
              onSwitchToEditor={() => setMobileActiveView('editor')}
            />
          </div>
        )}

        {/* Right Column (or Full Width): Answer Writing Desk / Ruled Answer Booklet */}
        <div
          className={`${
            showPdfPreview && activePdfDocument && mobileActiveView === 'preview'
              ? 'hidden lg:block'
              : 'block'
          } relative bg-white border border-stone-300 rounded-xl shadow-xs overflow-hidden flex flex-col`}
          onDragOver={(e) => { e.preventDefault(); setIsDeskDragging(true); }}
          onDragLeave={() => setIsDeskDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDeskDragging(false);
            handleOpenPdfWithCategory('auto');
          }}
        >
          
          {/* Drag Overlay on Desk */}
          {isDeskDragging && (
            <div className="absolute inset-0 z-30 bg-amber-500/10 backdrop-blur-xs border-2 border-dashed border-amber-600 flex flex-col items-center justify-center gap-2 p-6 text-center">
              <UploadCloud className="w-10 h-10 text-amber-700 animate-bounce" />
              <span className="font-serif font-bold text-stone-900 text-base">
                Drop your Essay or GS Paper PDF here
              </span>
              <span className="text-xs text-stone-600">
                Instant multimodal transcription and side-by-side preview
              </span>
            </div>
          )}

          {/* Desk HUD Toolbar */}
          <div className="bg-stone-900 text-stone-100 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
            
            {/* Word Count HUD */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-stone-400 uppercase text-[10px] font-semibold">Word Count:</span>
                <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
                  {currentWordCount}
                </span>
                <span className="text-stone-400 font-mono text-[11px]">/ {targetWordLimit} words</span>
              </div>

              <div className="hidden sm:block w-20 bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    currentWordCount <= targetWordLimit * 1.1 && currentWordCount >= targetWordLimit * 0.9
                      ? 'bg-emerald-400'
                      : currentWordCount > targetWordLimit * 1.2
                      ? 'bg-rose-400'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (currentWordCount / targetWordLimit) * 100)}%` }}
                />
              </div>
            </div>

            {/* Exam Timer */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-mono text-xs bg-stone-800/80 px-2.5 py-1 rounded-md border border-stone-700">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-stone-200">{formatTimer(timerSeconds)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                title={isTimerRunning ? 'Pause timer' : 'Start exam timer'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => { setTimerSeconds(0); setIsTimerRunning(false); }}
                className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Split Toggle, Quick Evaluation & PDF Actions */}
            <div className="flex items-center gap-2.5">
              {/* Quick Evaluation CTA on Toolbar */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isEvaluating || !answerText.trim()}
                className="px-3 py-1 rounded-md text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                title="Execute 4-Pass AI Evaluation"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-stone-900" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3 h-3 text-stone-950" />
                    <span>Run Evaluation</span>
                  </>
                )}
              </button>
              {activePdfDocument && (
                <button
                  type="button"
                  onClick={() => setShowPdfPreview(!showPdfPreview)}
                  className={`text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                    showPdfPreview
                      ? 'text-amber-400 hover:text-amber-300 font-bold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                  title={showPdfPreview ? 'Hide PDF preview' : 'View PDF document alongside editor'}
                >
                  <Columns className="w-3 h-3" />
                  <span>{showPdfPreview ? 'PDF Active' : 'Show PDF'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleOpenPdfWithCategory('auto')}
                className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileUp className="w-3 h-3" />
                <span>Upload PDF</span>
              </button>
              <span className="text-stone-700">|</span>
              <button
                type="button"
                onClick={handleClearAnswer}
                className="text-stone-400 hover:text-stone-200 text-xs transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Ruled Paper Writing Surface with Official Margins */}
          <div className="relative ruled-paper p-5 sm:p-8 bg-[#fbfbf9] flex-1">
            
            {/* Left Margin */}
            <div className="hidden sm:block absolute left-8 top-0 bottom-0 border-r-2 border-red-300/40 w-0 select-none pointer-events-none">
              <span className="absolute -left-6 top-16 -rotate-90 text-[9px] uppercase tracking-widest text-red-400 font-sans font-semibold">
                Do not write in this margin
              </span>
            </div>

            {/* Textarea */}
            <div className="sm:ml-8 sm:mr-8">
              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Begin drafting or review the extracted PDF text here... Follow standard Introduction hook, multi-dimensional body points with subheadings, and forward-looking conclusion."
                className="w-full bg-transparent resize-y min-h-[400px] font-serif text-[15px] leading-[2.25rem] text-stone-900 focus:outline-none placeholder:text-stone-400"
              />
            </div>

            {/* Right Margin */}
            <div className="hidden sm:block absolute right-8 top-0 bottom-0 border-l-2 border-red-300/40 w-0 select-none pointer-events-none">
              <span className="absolute -right-6 top-16 rotate-90 text-[9px] uppercase tracking-widest text-red-400 font-sans font-semibold">
                Do not write in this margin
              </span>
            </div>

          </div>

          {/* Action Footer */}
          <div className="bg-stone-100 border-t border-stone-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-stone-600">
              <span className="font-semibold text-stone-800">4-Pass Independent AI Engine:</span>{' '}
              Evaluates Structure, Evidence/Articles, Sentence-by-Sentence Micro-Linguistics, and Topper Ideal Answer.
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isEvaluating || !answerText.trim()}
              className="px-6 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:bg-stone-400 disabled:text-stone-700 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap self-end sm:self-auto cursor-pointer ring-2 ring-amber-400/40"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-950" />
                  <span>Executing 4 AI Passes...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-stone-950" />
                  <span>Run 4-Pass AI Evaluation</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>

      {/* Sticky Bottom Evaluation Dock (Always visible regardless of scrolling or active view) */}
      {answerText.trim() && (
        <div className="sticky bottom-3 z-30 bg-stone-900/95 backdrop-blur-md text-white p-3 sm:px-5 sm:py-3.5 rounded-2xl shadow-xl border border-stone-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-300">
                  {activePdfDocument ? '📄 PDF Document Transcribed' : '✍️ Answer Ready'}
                </span>
                <span className="text-[11px] text-stone-300 font-mono">
                  · {currentWordCount} words / {targetWordLimit}w
                </span>
              </div>
              <p className="text-[11px] text-stone-300 hidden md:block truncate">
                Ready for AI examination: Rubric scoring, evidence audit, micro-linguistics, and AIR 1 model answer.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            {activePdfDocument && (
              <button
                type="button"
                onClick={() => {
                  setShowPdfPreview(true);
                  setMobileActiveView(mobileActiveView === 'preview' ? 'editor' : 'preview');
                }}
                className="px-3 py-2 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Columns className="w-3.5 h-3.5 text-amber-400" />
                <span>{mobileActiveView === 'preview' ? 'Switch to Ruled Editor' : 'Switch to PDF View'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isEvaluating || !answerText.trim()}
              className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 disabled:opacity-50 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-amber-400/50 grow sm:grow-0"
              title="Examine & evaluate paper with 4-pass AI engine"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-950" />
                  <span>Evaluating Paper...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-stone-950" />
                  <span>Run 4-Pass AI Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* PDF Upload Modal */}
      <PdfUploadModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        onPdfExtracted={handlePdfExtracted}
        initialPaperCategory={modalCategory}
      />

    </div>
  );
};
