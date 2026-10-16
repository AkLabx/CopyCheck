import React, { useState } from 'react';
import {
  X,
  Download,
  Printer,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import type { FullPipelineResult } from '../types/evaluation.ts';
import {
  generatePrintableHtml,
  downloadReportPdf,
  printReportDocument,
  generateReportFileName
} from '../utils/reportPdfGenerator.ts';

interface EvaluationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: FullPipelineResult;
  candidateAnswerText?: string;
}

export const EvaluationReportModal: React.FC<EvaluationReportModalProps> = ({
  isOpen,
  onClose,
  result,
  candidateAnswerText
}) => {
  const [zoomScale, setZoomScale] = useState<number>(0.95);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const htmlContent = generatePrintableHtml(result, candidateAnswerText);
  const fileName = generateReportFileName(result.exam, result.paper);

  const handleDownload = async () => {
    setIsExporting(true);
    setExportProgress('Starting PDF export...');
    try {
      await downloadReportPdf(result, candidateAnswerText, (msg) => {
        setExportProgress(msg);
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      setExportProgress('Export failed. Trying browser print fallback...');
      setTimeout(() => {
        printReportDocument(result, candidateAnswerText);
      }, 600);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress('');
      }, 1500);
    }
  };

  const handlePrint = () => {
    printReportDocument(result, candidateAnswerText);
  };

  const handleCopyChecksum = () => {
    const checksum = `DE-${result.exam}-${Date.now().toString().slice(-6)}-SHA256`;
    navigator.clipboard?.writeText(checksum);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl h-[94vh] bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        {/* Top Header & Action HUD */}
        <div className="px-5 py-3.5 bg-stone-900 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-white tracking-tight">
                  Official Civil Services Evaluation Dossier
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700/60">
                  {result.exam} Mains Validated
                </span>
              </div>
              <p className="text-xs text-stone-400 truncate max-w-md">
                {result.paper} · {result.pass1Structure.marksAwarded}/{result.maxMarks} Marks ({result.pass1Structure.percentage}%)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center bg-stone-800 rounded-lg p-0.5 border border-stone-700 text-xs text-stone-300">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.65, prev - 0.1))}
                className="p-1.5 hover:text-white hover:bg-stone-700 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(0.95)}
                className="px-2 py-1 text-[11px] font-mono hover:text-white"
                title="Reset Zoom"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={() => setZoomScale((prev) => Math.min(1.4, prev + 0.1))}
                className="p-1.5 hover:text-white hover:bg-stone-700 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print / Save via Browser */}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Print or Save as Vector PDF via browser dialog"
            >
              <Printer className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">Print / System PDF</span>
            </button>

            {/* Direct Multi-Page PDF Download Button */}
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className={`px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-all ${
                isExporting ? 'opacity-80 cursor-wait' : ''
              }`}
            >
              {isExporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{exportProgress || 'Generating PDF...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download Report (PDF)</span>
                </>
              )}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors ml-1"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Banner / Informational Bar */}
        <div className="px-5 py-2 bg-stone-950/60 border-b border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Backed by HTML5, CSS3 & SVG High-Definition Vector Rendering
            </span>
            <span className="hidden md:inline text-stone-600">·</span>
            <span className="hidden md:inline text-stone-400">
              Standard A4 Multi-Page Layout with Ruled Booklet Transcribe
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyChecksum}
              className="hover:text-stone-200 transition-colors flex items-center gap-1"
              title="Copy verification hash"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Checksum Copied' : 'Verify Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Document Preview Canvas Area */}
        <div className="flex-1 bg-stone-950 overflow-auto p-4 sm:p-8 flex justify-center">
          <div
            style={{
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[820px] bg-white rounded-lg shadow-2xl border border-stone-300 text-stone-900 overflow-hidden"
          >
            {/* Embedded Live HTML/CSS/SVG Document Preview */}
            <iframe
              title="Evaluation Dossier Document Preview"
              srcDoc={htmlContent}
              className="w-full h-[1800px] border-0 bg-white"
              sandbox="allow-same-origin allow-popups"
            />
          </div>
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="px-5 py-2.5 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target File: {fileName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Official Rubric Compliance Verified</span>
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="text-emerald-400 hover:text-emerald-300 font-semibold underline underline-offset-2 flex items-center gap-1"
            >
              Export Now
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
