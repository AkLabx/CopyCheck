/**
 * Utility functions for handling PDF uploads, validation, and OCR text sanitation.
 */

export interface PdfValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePdfFile(file: { name: string; size: number; type?: string }): PdfValidationResult {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  const isPdfExtension = file.name.toLowerCase().endsWith('.pdf');
  const isPdfMime = !file.type || file.type === 'application/pdf' || file.type === '';

  if (!isPdfExtension && !isPdfMime) {
    return { valid: false, error: 'Only PDF documents (.pdf) are supported for exam answer sheets.' };
  }

  // Max 25 MB limit
  const MAX_SIZE_BYTES = 25 * 1024 * 1024;
  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds 25 MB limit. Please compress your PDF.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The uploaded PDF file is empty (0 bytes).' };
  }

  return { valid: true };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function detectPaperTypeFromName(fileName: string): {
  exam: 'UPSC' | 'BPSC';
  paper: string;
  isEssay: boolean;
  suggestedMarks: number;
  suggestedWordLimit: number;
} {
  const lower = fileName.toLowerCase();
  const isBpsc = lower.includes('bpsc') || lower.includes('bihar');
  const exam: 'UPSC' | 'BPSC' = isBpsc ? 'BPSC' : 'UPSC';

  if (lower.includes('essay') || lower.includes('nibandh')) {
    return {
      exam,
      paper: exam === 'BPSC' ? 'BPSC Essay Paper' : 'UPSC Essay Paper',
      isEssay: true,
      suggestedMarks: exam === 'BPSC' ? 100 : 125,
      suggestedWordLimit: exam === 'BPSC' ? 750 : 1000
    };
  }

  if (lower.includes('gs1') || lower.includes('gs-1') || lower.includes('gs 1')) {
    return {
      exam,
      paper: exam === 'BPSC' ? 'BPSC GS Paper 1' : 'UPSC GS Paper 1 (History & Society)',
      isEssay: false,
      suggestedMarks: exam === 'BPSC' ? 38 : 15,
      suggestedWordLimit: exam === 'BPSC' ? 400 : 250
    };
  }

  if (lower.includes('gs3') || lower.includes('gs-3') || lower.includes('gs 3')) {
    return {
      exam,
      paper: 'UPSC GS Paper 3 (Economy & Environment)',
      isEssay: false,
      suggestedMarks: 15,
      suggestedWordLimit: 250
    };
  }

  if (lower.includes('gs4') || lower.includes('gs-4') || lower.includes('gs 4') || lower.includes('ethics')) {
    return {
      exam,
      paper: 'UPSC GS Paper 4 (Ethics & Integrity)',
      isEssay: false,
      suggestedMarks: 20,
      suggestedWordLimit: 250
    };
  }

  return {
    exam,
    paper: exam === 'BPSC' ? 'BPSC GS Paper 2' : 'UPSC GS Paper 2 (Polity & Governance)',
    isEssay: false,
    suggestedMarks: exam === 'BPSC' ? 38 : 15,
    suggestedWordLimit: exam === 'BPSC' ? 400 : 250
  };
}

/**
 * Sanitizes OCR extracted text by stripping common scanner noise, duplicate whitespace,
 * and page numbering headers/footers like "Page 1 of 4" or "UPSC Copy 2024".
 */
export function cleanExtractedOcrText(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Remove standalone page number lines: e.g. "Page 1 of 6" or "- 2 -" or "[Page 3]"
    .replace(/^\s*(?:page|\-)?\s*\d+\s*(?:of\s*\d+)?\s*(?:\-)?\s*$/gim, '')
    // Remove scanner watermarks or top margin notes
    .replace(/^\s*(?:DO NOT WRITE IN THIS MARGIN|इस हाशिया में न लिखें)\s*$/gim, '')
    // Normalize excessive blank lines (>2) into standard double newlines
    .replace(/\n{3,}/g, '\n\n')
    // Trim leading and trailing whitespace
    .trim();
}

/**
 * Splits extracted answer or essay text across realistic page boundaries (~140-180 words per page),
 * preserving whole paragraphs where possible.
 */
export function splitAnswerIntoPages(text: string, targetWordsPerPage = 160): string[] {
  if (!text || !text.trim()) {
    return [''];
  }

  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length <= 1) {
    const words = text.trim().split(/\s+/);
    if (words.length <= targetWordsPerPage) {
      return [text.trim()];
    }
    // Break into chunks of targetWordsPerPage words
    const pages: string[] = [];
    for (let i = 0; i < words.length; i += targetWordsPerPage) {
      pages.push(words.slice(i, i + targetWordsPerPage).join(' '));
    }
    return pages;
  }

  const pages: string[] = [];
  let currentPageParagraphs: string[] = [];
  let currentWordCount = 0;

  for (const para of paragraphs) {
    const paraWordCount = para.trim().split(/\s+/).length;

    if (currentPageParagraphs.length > 0 && currentWordCount + paraWordCount > targetWordsPerPage * 1.3) {
      pages.push(currentPageParagraphs.join('\n\n'));
      currentPageParagraphs = [para];
      currentWordCount = paraWordCount;
    } else {
      currentPageParagraphs.push(para);
      currentWordCount += paraWordCount;
    }
  }

  if (currentPageParagraphs.length > 0) {
    pages.push(currentPageParagraphs.join('\n\n'));
  }

  return pages.length > 0 ? pages : [text.trim()];
}

