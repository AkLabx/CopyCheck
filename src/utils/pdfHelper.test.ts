import test from 'node:test';
import assert from 'node:assert/strict';
import { validatePdfFile, formatFileSize, cleanExtractedOcrText, detectPaperTypeFromName, splitAnswerIntoPages } from './pdfHelper.ts';

test('validatePdfFile accepts valid pdf under 25MB and rejects non-pdf or oversized files', () => {
  assert.equal(validatePdfFile({ name: 'upsc_essay_paper.pdf', size: 1024 * 500, type: 'application/pdf' }).valid, true);
  assert.equal(validatePdfFile({ name: 'upsc_gs2_copy.PDF', size: 2 * 1024 * 1024 }).valid, true);
  
  // Non-pdf
  const nonPdf = validatePdfFile({ name: 'image.png', size: 500, type: 'image/png' });
  assert.equal(nonPdf.valid, false);
  assert.match(nonPdf.error || '', /Only PDF/);

  // Oversized
  const oversized = validatePdfFile({ name: 'huge_scan.pdf', size: 30 * 1024 * 1024, type: 'application/pdf' });
  assert.equal(oversized.valid, false);
  assert.match(oversized.error || '', /exceeds 25 MB/);

  // Empty file
  const empty = validatePdfFile({ name: 'empty.pdf', size: 0, type: 'application/pdf' });
  assert.equal(empty.valid, false);
});

test('formatFileSize correctly formats bytes to KB and MB', () => {
  assert.equal(formatFileSize(0), '0 B');
  assert.equal(formatFileSize(1024), '1 KB');
  assert.equal(formatFileSize(1.5 * 1024 * 1024), '1.5 MB');
});

test('cleanExtractedOcrText strips page headers, margin watermarks, and cleans whitespace', () => {
  const dirty = `
DO NOT WRITE IN THIS MARGIN
Page 1 of 3

Democratic institutions require public trust.
- 2 -

Civil society acts as an indispensable watchdog.
`;
  const cleaned = cleanExtractedOcrText(dirty);
  assert.doesNotMatch(cleaned, /DO NOT WRITE IN THIS MARGIN/);
  assert.doesNotMatch(cleaned, /Page 1 of 3/);
  assert.doesNotMatch(cleaned, /- 2 -/);
  assert.match(cleaned, /Democratic institutions require public trust\./);
  assert.match(cleaned, /Civil society acts as an indispensable watchdog\./);
});

test('detectPaperTypeFromName detects essay and GS papers for UPSC and BPSC', () => {
  const essay = detectPaperTypeFromName('Candidate_UPSC_Essay_Mock.pdf');
  assert.equal(essay.exam, 'UPSC');
  assert.equal(essay.isEssay, true);
  assert.equal(essay.suggestedMarks, 125);
  assert.equal(essay.suggestedWordLimit, 1000);

  const gs2 = detectPaperTypeFromName('Candidate_GS2_Governance.pdf');
  assert.equal(gs2.exam, 'UPSC');
  assert.equal(gs2.isEssay, false);
  assert.equal(gs2.suggestedMarks, 15);
  assert.equal(gs2.suggestedWordLimit, 250);

  const bpscGs = detectPaperTypeFromName('BPSC_69th_GS1_History.pdf');
  assert.equal(bpscGs.exam, 'BPSC');
  assert.equal(bpscGs.suggestedMarks, 38);
  assert.equal(bpscGs.suggestedWordLimit, 400);
});

test('splitAnswerIntoPages splits long answers into multiple distinct pages', () => {
  const p1 = 'Paragraph one has multiple sentences that describe the constitutional framework of Indian federalism and inter-state relations under Article 263.';
  const p2 = 'Paragraph two details the structural impediments such as advisory recommendations, prolonged dormancy between meetings, and eclipse by NITI Aayog.';
  const p3 = 'Paragraph three outlines the revitalisation roadmap recommended by Sarkaria Commission and Punchhi Commission for cooperative federalism.';
  const fullText = `${p1}\n\n${p2}\n\n${p3}`;

  // With target 25 words per page, should split across multiple pages
  const pages = splitAnswerIntoPages(fullText, 25);
  assert.ok(pages.length >= 2, `Expected >= 2 pages, got ${pages.length}`);
  assert.ok(pages[0].includes('Paragraph one'));
  assert.ok(pages[pages.length - 1].includes('Paragraph three'));
});

