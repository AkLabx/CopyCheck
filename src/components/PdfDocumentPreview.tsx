import React, { useState } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  FileUp,
  Sparkles,
  Download,
  Eye,
  Columns,
  Layers,
  CheckCircle2,
  Send,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { splitAnswerIntoPages, formatFileSize } from '../utils/pdfHelper.ts';

export interface PdfDocumentPreviewProps {
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
  onClose?: () => void;
  onReUpload?: () => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onRunEvaluation?: () => void;
  isEvaluating?: boolean;
  onSwitchToEditor?: () => void;
}

export const PdfDocumentPreview: React.FC<PdfDocumentPreviewProps> = ({
  fileName,
  fileSize,
  exam,
  paper,
  question,
  directive,
  answerText,
  pdfDataUrl,
  ocrConfidence = 'High',
  pageCountEstimated,
  onClose,
  onReUpload,
  isSplitView = true,
  onToggleSplitView,
  onRunEvaluation,
  isEvaluating = false,
  onSwitchToEditor
}) => {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'booklet' | 'native'>(
    pdfDataUrl && pdfDataUrl.startsWith('data:application/pdf') ? 'native' : 'booklet'
  );
  const [highlightKeyTerms, setHighlightKeyTerms] = useState<boolean>(true);

  // Split text across realistic booklet pages
  const pages = splitAnswerIntoPages(answerText, paper.toLowerCase().includes('essay') ? 220 : 160);
  const totalPages = Math.max(pages.length, pageCountEstimated || 1);
  const activePageText = pages[currentPage] || pages[0] || '';

  const handleNextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(c => c + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(c => c - 1);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(z => Math.min(z + 15, 160));
  };

  const handleZoomOut = () => {
    setZoomLevel(z => Math.max(z - 15, 75));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // Helper to highlight legal articles, commissions, and key phrases
  const renderFormattedContent = (text: string) => {
    if (!highlightKeyTerms) {
      return <div className="whitespace-pre-line">{text}</div>;
    }

    const paragraphs = text.split(/\n\s*\n/);
    return (
      <div className="space-y-3.5">
        {paragraphs.map((para, pIdx) => {
          // Check if paragraph is a heading or bullet point
          const isHeading =
            /^[A-Z0-9\s\.\:\-]{4,60}\:?$/.test(para.trim()) ||
            para.trim().endsWith(':') ||
            para.trim().startsWith('Structural') ||
            para.trim().startsWith('Revitalization') ||
            para.trim().startsWith('Philosophical');

          if (isHeading) {
            return (
              <h4
                key={pIdx}
                className="font-bold text-stone-900 border-b border-stone-200/80 pb-1 pt-1 tracking-tight"
                style={{ fontSize: '0.98em' }}
              >
                {para}
              </h4>
            );
          }

          // Highlight Article numbers, Commissions, and Supreme Court judgments
          const parts = para.split(
            /(Article \d+[A-Z]?|Art\. \d+[A-Z]?|Sarkaria Commission|Punchhi Commission|S\.R\. Bommai|Forest Rights Act|NITI Aayog|GST Council)/g
          );

          return (
            <p key={pIdx} className="leading-relaxed">
              {parts.map((part, idx) => {
                if (
                  /^(Article \d+[A-Z]?|Art\. \d+[A-Z]?|Sarkaria Commission|Punchhi Commission|S\.R\. Bommai|Forest Rights Act|NITI Aayog|GST Council)$/.test(
                    part
                  )
                ) {
                  return (
                    <mark
                      key={idx}
                      className="bg-amber-100/90 text-amber-950 font-semibold px-1 py-0.5 rounded-xs border-b border-amber-300"
                    >
                      {part}
                    </mark>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 border border-stone-300 rounded-xl shadow-xs overflow-hidden select-text">
      {/* Top Document Header HUD */}
      <div className="bg-stone-900 text-stone-100 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs border-b border-stone-800">
        
        {/* Document Name & Badges */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/40">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-stone-200 truncate max-w-[170px] sm:max-w-[220px]" title={fileName}>
                {fileName}
              </span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-500/30 shrink-0">
                {exam}
              </span>
            </div>
            <div className="text-[10px] text-stone-400 flex items-center gap-2">
              <span>{paper}</span>
              {fileSize && <span>· {formatFileSize(fileSize)}</span>}
              <span>· OCR: {ocrConfidence}</span>
            </div>
          </div>
        </div>

        {/* View Switchers: Booklet Facsimile vs Native PDF (if available) */}
        <div className="flex items-center gap-1.5 bg-stone-800/80 p-0.5 rounded-lg border border-stone-700/60">
          <button
            type="button"
            onClick={() => setViewMode('booklet')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              viewMode === 'booklet'
                ? 'bg-amber-800/80 text-amber-100 shadow-2xs font-bold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
            title="Authentic UPSC/BPSC Ruled Answer Booklet View"
          >
            <BookOpenIcon className="w-3 h-3" />
            <span>Booklet Scan</span>
          </button>

          {pdfDataUrl && (
            <button
              type="button"
              onClick={() => setViewMode('native')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                viewMode === 'native'
                  ? 'bg-amber-800/80 text-amber-100 shadow-2xs font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Embedded Native PDF Reader"
            >
              <Eye className="w-3 h-3" />
              <span>Native PDF</span>
            </button>
          )}
        </div>

        {/* Page Nav & Zoom HUD */}
        <div className="flex items-center gap-2">
          {viewMode === 'booklet' && (
            <div className="flex items-center gap-1 bg-stone-800 px-2 py-0.5 rounded-md border border-stone-700">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="p-1 text-stone-300 hover:text-white disabled:text-stone-600 cursor-pointer disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] text-amber-300 px-1">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= pages.length - 1}
                className="p-1 text-stone-300 hover:text-white disabled:text-stone-600 cursor-pointer disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-1 bg-stone-800 px-1.5 py-0.5 rounded-md border border-stone-700 text-stone-300">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoomLevel <= 75}
              className="p-1 hover:text-white disabled:text-stone-600 cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="font-mono text-[10px] hover:text-amber-300 px-1 cursor-pointer"
              title="Reset zoom to 100%"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 160}
              className="p-1 hover:text-white disabled:text-stone-600 cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>

          {/* Header Evaluation CTA Button */}
          {onRunEvaluation && (
            <button
              type="button"
              onClick={onRunEvaluation}
              disabled={isEvaluating || !answerText.trim()}
              className="px-3 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 disabled:opacity-40 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-amber-500/50"
              title="Run 4-Pass AI Evaluation on this uploaded answer copy"
            >
              {isEvaluating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-900" />
                  <span className="hidden sm:inline">Evaluating...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-stone-950" />
                  <span>Run 4-Pass Evaluation</span>
                </>
              )}
            </button>
          )}

          {/* Split View Toggle */}
          {onToggleSplitView && (
            <button
              type="button"
              onClick={onToggleSplitView}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
              title={isSplitView ? 'Maximize preview' : 'Restore side-by-side split'}
            >
              {isSplitView ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>
          )}

          {/* Close preview */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Close PDF preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Sub-toolbar: Highlight Switcher & Quick Information */}
      <div className="bg-stone-200/80 px-4 py-1.5 flex items-center justify-between text-[11px] text-stone-700 border-b border-stone-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-stone-800">
            {viewMode === 'booklet' ? 'Booklet Page View' : 'Native Document View'}
          </span>
          <span className="text-stone-400">·</span>
          <span>Original answer copy uploaded for evaluation</span>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 hover:text-stone-900 select-none">
            <input
              type="checkbox"
              checked={highlightKeyTerms}
              onChange={(e) => setHighlightKeyTerms(e.target.checked)}
              className="rounded text-amber-800 focus:ring-amber-800 w-3 h-3"
            />
            <span className="text-[10px] font-medium">Highlight Legal Articles & Authorities</span>
          </label>

          {onReUpload && (
            <button
              type="button"
              onClick={onReUpload}
              className="text-[10px] text-amber-900 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <FileUp className="w-3 h-3" />
              <span>Change PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Document Viewer Canvas */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-stone-300/60 flex justify-center items-start min-h-[460px]">
        {viewMode === 'native' && pdfDataUrl ? (
          /* Native PDF Iframe Viewer */
          <div
            className="w-full h-full min-h-[520px] bg-white rounded-lg shadow-md overflow-hidden border border-stone-300 flex flex-col"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            <iframe
              src={pdfDataUrl}
              title={`PDF Preview - ${fileName}`}
              className="w-full h-full min-h-[520px] border-0"
            />
          </div>
        ) : (
          /* High-Fidelity Official Ruled Answer Booklet Page */
          <div
            className="w-full max-w-[580px] bg-[#fdfdf9] border border-stone-400 rounded-sm shadow-md transition-transform duration-100 flex flex-col"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              minHeight: '620px'
            }}
          >
            {/* Booklet Header Bar */}
            <div className="p-4 border-b border-stone-200 bg-[#fafaf5] select-none text-stone-800">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
                <div className="text-left">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-stone-500 font-sans">
                    {exam === 'BPSC'
                      ? 'BIHAR PUBLIC SERVICE COMMISSION'
                      : 'UNION PUBLIC SERVICE COMMISSION'}
                  </div>
                  <div className="text-[11px] font-serif font-bold text-stone-900">
                    MAINS EXAMINATION — DESCRIPTIVE ANSWER BOOKLET
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[9px] font-mono text-stone-500">ROLL NO. 0842917</div>
                  <div className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    OFFICIAL COPY VERIFIED
                  </div>
                </div>
              </div>

              {/* Question metadata strip on Page 1 */}
              {currentPage === 0 ? (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-sans font-semibold text-stone-700 pb-1">
                    <span>QUESTION NO. 1 {directive ? `[Directive: ${directive}]` : ''}</span>
                    <span>MAX MARKS: {paper.toLowerCase().includes('essay') ? '125' : exam === 'BPSC' ? '38' : '15'}</span>
                  </div>
                  <p className="font-serif text-[12px] font-semibold text-stone-900 leading-snug bg-amber-50/60 p-2 rounded border border-amber-200/60">
                    {question}
                  </p>
                </div>
              ) : (
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-stone-500">
                  <span>Q. 1 (CONTINUED)</span>
                  <span>PAGE {currentPage + 1} OF {totalPages}</span>
                </div>
              )}
            </div>

            {/* Answer Booklet Writing Sheet with Red Margin Gutters & Authentic Ruling */}
            <div className="relative flex-1 flex min-h-[460px] bg-[#fdfdf9]">
              {/* Left Margin Gutter with Warning */}
              <div className="w-8 border-r-2 border-rose-300/60 flex items-center justify-center select-none bg-[#fdfdf9] shrink-0 py-4 overflow-hidden">
                <span className="text-[8px] uppercase tracking-widest text-rose-400/80 font-sans font-bold select-none [writing-mode:vertical-rl] rotate-180">
                  DO NOT WRITE IN THIS MARGIN
                </span>
              </div>

              {/* Ruled Lines Writing Area */}
              <div className="flex-1 px-4 sm:px-6 py-4 min-w-0">
                <div
                  className="font-serif text-[13px] leading-[2.1rem] text-[#1a202c]"
                  style={{
                    backgroundImage:
                      'linear-gradient(transparent, transparent 32px, rgba(148, 163, 184, 0.22) 33px)',
                    backgroundSize: '100% 33px',
                    backgroundPosition: '0 10px'
                  }}
                >
                  {renderFormattedContent(activePageText)}
                </div>
              </div>

              {/* Right Margin Gutter with Warning */}
              <div className="w-8 border-l-2 border-rose-300/60 flex items-center justify-center select-none bg-[#fdfdf9] shrink-0 py-4 overflow-hidden">
                <span className="text-[8px] uppercase tracking-widest text-rose-400/80 font-sans font-bold select-none [writing-mode:vertical-rl]">
                  DO NOT WRITE IN THIS MARGIN
                </span>
              </div>
            </div>

            {/* Booklet Footer */}
            <div className="p-3 border-t border-stone-200 bg-[#fafaf5] flex items-center justify-between text-[10px] text-stone-500 font-mono select-none">
              <span>{paper} · {exam}</span>
              <span className="font-bold text-stone-700">
                — Page {currentPage + 1} of {totalPages} —
              </span>
              <span>CONFIDENTIAL</span>
            </div>
          </div>
        )}
      </div>

      {/* Document Footer Bar */}
      <div className="bg-stone-200 border-t border-stone-300 px-4 py-2 flex items-center justify-between text-xs text-stone-700">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px]">
            Transcribed text is synchronized with ruled editor. You can examine directly or edit text first.
          </span>
        </div>

        <div className="flex items-center gap-2">
          {viewMode === 'booklet' && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-stone-600">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-2 py-0.5 rounded bg-white border border-stone-300 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= pages.length - 1}
                className="px-2 py-0.5 rounded bg-white border border-stone-300 hover:bg-stone-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Prominent Direct Evaluation Action Bar inside PDF Preview */}
      <div className="bg-stone-900 border-t border-stone-800 p-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <div className="text-[11px] text-stone-300">
            <span className="font-bold text-amber-300">Document Ready:</span>{' '}
            <span>{answerText.split(/\s+/).filter(Boolean).length} words transcribed · Ready for Evaluation</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {onSwitchToEditor && (
            <button
              type="button"
              onClick={onSwitchToEditor}
              className="px-3 py-2 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg border border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              title="Open ruled paper text editor to view or modify text"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Edit Text in Ruled Sheet</span>
            </button>
          )}

          {onRunEvaluation && (
            <button
              type="button"
              onClick={onRunEvaluation}
              disabled={isEvaluating || !answerText.trim()}
              className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ring-2 ring-amber-400/40"
              title="Start 4-pass AI evaluation on this answer"
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
          )}
        </div>
      </div>
    </div>
  );
};

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
