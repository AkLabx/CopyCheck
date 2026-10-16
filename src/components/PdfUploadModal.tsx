import React, { useState, useRef } from 'react';
import { validatePdfFile, formatFileSize, detectPaperTypeFromName } from '../utils/pdfHelper.ts';
import { FileUp, FileText, CheckCircle2, AlertCircle, Loader2, X, Sparkles, ArrowRight, BookOpen, Layers } from 'lucide-react';

export interface ExtractedPdfPayload {
  fileName: string;
  fileSize: number;
  detectedExam: 'UPSC' | 'BPSC';
  detectedPaper: string;
  detectedQuestion: string;
  detectedDirective: string;
  extractedAnswerText: string;
  wordCount: number;
  ocrConfidence: string;
  transcriptionNotes: string;
  autoEvaluateImmediately?: boolean;
  pdfDataUrl?: string | null;
  pageCountEstimated?: number;
}

interface PdfUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPdfExtracted: (payload: ExtractedPdfPayload) => void;
  initialPaperCategory?: 'auto' | 'gs' | 'essay';
}

export const PdfUploadModal: React.FC<PdfUploadModalProps> = ({
  isOpen,
  onClose,
  onPdfExtracted,
  initialPaperCategory = 'auto'
}) => {
  const [paperCategory, setPaperCategory] = useState<'auto' | 'gs' | 'essay'>(initialPaperCategory);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedPdfPayload | null>(null);

  // Editable fields in preview state
  const [editedExam, setEditedExam] = useState<'UPSC' | 'BPSC'>('UPSC');
  const [editedPaper, setEditedPaper] = useState<string>('GS Paper 2');
  const [editedQuestion, setEditedQuestion] = useState<string>('');
  const [editedDirective, setEditedDirective] = useState<string>('Critically Examine');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setErrorMessage(null);
    setExtractedData(null);

    const validation = validatePdfFile({
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid PDF file.');
      return;
    }

    setIsLoading(true);
    setLoadingStep('Reading PDF document bytes...');

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          setLoadingStep('Executing Multimodal OCR & Handwriting Extraction for ' + (paperCategory === 'gs' ? 'GS Paper...' : paperCategory === 'essay' ? 'Essay Paper...' : 'Answer Booklet...'));

          const response = await fetch('/api/upload-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              base64Data,
              fileName: file.name,
              fileSize: file.size,
              paperCategory
            })
          });

          if (!response.ok) {
            throw new Error(`PDF processing failed with status ${response.status}`);
          }

          const data: ExtractedPdfPayload = await response.json();
          const fullData: ExtractedPdfPayload = {
            ...data,
            pdfDataUrl: base64Data,
            pageCountEstimated: data.pageCountEstimated || 1
          };
          setExtractedData(fullData);
          setEditedExam(data.detectedExam);
          setEditedPaper(data.detectedPaper);
          setEditedQuestion(data.detectedQuestion);
          setEditedDirective(data.detectedDirective || 'Discuss');
        } catch (err: any) {
          console.error('Error processing PDF:', err);
          setErrorMessage(err.message || 'Failed to process and transcribe PDF.');
        } finally {
          setIsLoading(false);
          setLoadingStep('');
        }
      };

      reader.onerror = () => {
        setIsLoading(false);
        setErrorMessage('Failed to read file from local storage.');
      };

      reader.readAsDataURL(file);
    } catch (e: any) {
      setIsLoading(false);
      setErrorMessage(e.message || 'File upload error.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleLoadSamplePdf = async (type: 'essay' | 'gs') => {
    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep(
      type === 'gs'
        ? 'Transcribing Sample UPSC GS Paper 2 Answer Copy (Inter-State Council)...'
        : 'Transcribing Sample UPSC Essay Answer Copy (Anthropocene & Ecology)...'
    );

    try {
      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: type === 'gs' ? 'sample-gs-pdf-data' : 'sample-pdf-data',
          fileName:
            type === 'gs'
              ? 'UPSC_GS2_InterStateCouncil_Federalism_Sample.pdf'
              : 'UPSC_Essay_Chateaubriand_Anthropocene.pdf',
          fileSize: type === 'gs' ? 285000 : 485000,
          sampleType: type,
          paperCategory: type
        })
      });

      const data: ExtractedPdfPayload = await response.json();
      const fullData: ExtractedPdfPayload = {
        ...data,
        pdfDataUrl: null,
        pageCountEstimated: data.pageCountEstimated || (type === 'essay' ? 3 : 2)
      };
      setExtractedData(fullData);
      setEditedExam(data.detectedExam);
      setEditedPaper(data.detectedPaper);
      setEditedQuestion(data.detectedQuestion);
      setEditedDirective(data.detectedDirective || 'Discuss');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load sample PDF.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleApplyToDesk = (autoEvaluateImmediately = false) => {
    if (extractedData) {
      onPdfExtracted({
        ...extractedData,
        detectedExam: editedExam,
        detectedPaper: editedPaper,
        detectedQuestion: editedQuestion,
        detectedDirective: editedDirective,
        autoEvaluateImmediately
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <FileUp className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Upload Essay or GS Paper PDF Copy
              </h3>
              <p className="text-xs text-stone-500">
                Upload your handwritten scanned answer sheet or typed PDF for UPSC & BPSC Mains evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {!extractedData ? (
          /* Dropzone & Category Selector State */
          <div className="space-y-4">
            
            {/* Paper Category Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-stone-700">
                Target Paper Category:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaperCategory('gs')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    paperCategory === 'gs'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700 text-xs'
                  }`}
                >
                  <span className="block text-xs font-semibold">📑 GS Paper</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">GS 1, 2, 3, 4 / BPSC GS</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperCategory('essay')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    paperCategory === 'essay'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700 text-xs'
                  }`}
                >
                  <span className="block text-xs font-semibold">📄 Essay Paper</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">UPSC / BPSC (750-1200w)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaperCategory('auto')}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    paperCategory === 'auto'
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 font-bold ring-1 ring-amber-500'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700 text-xs'
                  }`}
                >
                  <span className="block text-xs font-semibold">✨ Auto-Detect</span>
                  <span className="text-[10px] text-stone-500 block leading-tight">Detects exam & syllabus</span>
                </button>
              </div>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-600 bg-amber-50/50 scale-[0.99]'
                  : 'border-stone-300 hover:border-stone-400 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-white shadow-2xs border border-stone-200 text-stone-700">
                  {isLoading ? (
                    <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                  ) : (
                    <FileText className="w-6 h-6 text-stone-800" />
                  )}
                </div>

                {isLoading ? (
                  <div className="space-y-1">
                    <span className="font-semibold text-xs text-stone-900 block">
                      Transcribing Answer Sheet with Gemini Multimodal OCR...
                    </span>
                    <span className="text-[11px] text-stone-500 animate-pulse">
                      {loadingStep}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="font-semibold text-xs text-stone-900 block">
                      Click to choose PDF or drag & drop file here
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Supports handwritten UPSC/BPSC answer booklets & typed PDF essays (Max 25 MB)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Demo Options: Essay and GS Paper */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <span className="text-[11px] font-semibold text-stone-500 block">
                Quick Test with Authentic Answer Copies:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleLoadSamplePdf('gs')}
                  disabled={isLoading}
                  className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <div className="truncate">
                    <span className="block text-xs font-bold">Try Sample GS Paper 2 PDF</span>
                    <span className="text-[10px] text-amber-800/80 block truncate">Inter-State Council & Federalism</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadSamplePdf('essay')}
                  disabled={isLoading}
                  className="p-2 rounded-lg border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-900 font-semibold flex items-center gap-2 transition-colors text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <div className="truncate">
                    <span className="block text-xs font-bold">Try Sample Essay PDF</span>
                    <span className="text-[10px] text-amber-800/80 block truncate">Chateaubriand & Anthropocene (1000w)</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Extracted OCR Confirmation State */
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span className="font-semibold text-xs text-emerald-950">
                    PDF Document Successfully Transcribed
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {extractedData.ocrConfidence} Confidence
                </span>
              </div>

              {/* Detected & Editable Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-stone-500 block text-[10px]">Target Exam</span>
                  <select
                    value={editedExam}
                    onChange={(e) => setEditedExam(e.target.value as 'UPSC' | 'BPSC')}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                  >
                    <option value="UPSC">UPSC IAS Mains</option>
                    <option value="BPSC">BPSC CSE Mains</option>
                  </select>
                </div>

                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-stone-500 block text-[10px]">Paper</span>
                  <input
                    type="text"
                    value={editedPaper}
                    onChange={(e) => setEditedPaper(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                  />
                </div>

                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-stone-500 block text-[10px]">Directive</span>
                  <select
                    value={editedDirective}
                    onChange={(e) => setEditedDirective(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent focus:outline-none"
                  >
                    <option value="Critically Examine">Critically Examine</option>
                    <option value="Critically Analyze">Critically Analyze</option>
                    <option value="Discuss">Discuss</option>
                    <option value="Elucidate">Elucidate</option>
                    <option value="Examine">Examine</option>
                    <option value="Evaluate">Evaluate</option>
                    <option value="Elaborate with Multidimensional Perspectives">Elaborate Perspectives</option>
                  </select>
                </div>

                <div className="p-2 bg-white rounded border border-emerald-200">
                  <span className="text-stone-500 block text-[10px]">Word Count</span>
                  <strong className="text-stone-900 tabular-nums">{extractedData.wordCount} words</strong>
                </div>
              </div>

              {/* Detected Question Prompt */}
              <div className="p-2.5 bg-white rounded border border-emerald-200 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Question Prompt / Essay Topic (Edit if necessary):
                </span>
                <textarea
                  value={editedQuestion}
                  onChange={(e) => setEditedQuestion(e.target.value)}
                  rows={2}
                  className="w-full font-serif text-stone-800 font-medium text-xs bg-stone-50/50 p-1.5 rounded border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
              </div>

              {/* Answer Preview */}
              <div className="p-2.5 bg-white rounded border border-emerald-200 text-xs">
                <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
                  Transcribed Answer Preview:
                </span>
                <p className="font-serif text-stone-700 italic max-h-28 overflow-y-auto leading-relaxed whitespace-pre-line text-[11px] bg-stone-50/40 p-2 rounded border border-stone-100">
                  {extractedData.extractedAnswerText.slice(0, 450)}...
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExtractedData(null)}
                className="text-xs text-stone-500 hover:text-stone-800"
              >
                Upload different PDF
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleApplyToDesk(false)}
                  className="w-1/2 sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-lg transition-colors border border-stone-300"
                >
                  Load into Ruled Booklet
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyToDesk(true)}
                  className="w-1/2 sm:w-auto px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Evaluate Immediately</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
