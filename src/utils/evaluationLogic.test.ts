import test from 'node:test';
import assert from 'node:assert/strict';
import {
  splitIntoSentences,
  calculateWordCount,
  calculateWordPenalty,
  determineGradeBand,
  computeFinalMarks,
  computePeerPercentile
} from './evaluationLogic.ts';

test('splitIntoSentences handles abbreviations and decimals without wrongful splits', () => {
  const text = 'Poverty alleviation requires constitutional safeguards under Art. 21. For e.g., the MGNREGA scheme helped rural workers. The inflation was around 4.5% last year. Dr. Ambedkar emphasized social democracy.';
  const sentences = splitIntoSentences(text);
  assert.equal(sentences.length, 4);
  assert.match(sentences[0], /Art\. 21/);
  assert.match(sentences[1], /e\.g\./);
  assert.match(sentences[2], /4\.5%/);
  assert.match(sentences[3], /Dr\. Ambedkar/);
});

test('calculateWordCount returns accurate token length', () => {
  assert.equal(calculateWordCount(''), 0);
  assert.equal(calculateWordCount('Cooperative federalism is essential for Indian polity.'), 7);
  assert.equal(calculateWordCount('   Multiple   spaces   between words   '), 4);
});

test('calculateWordPenalty rewards within +/- 10% and penalizes extreme under/over writing', () => {
  // Within target (150 words limit, 155 words written)
  const optimal = calculateWordPenalty(155, 150);
  assert.equal(optimal.penaltyMarks, 0);
  assert.equal(optimal.status, 'optimal');

  // Severely under-written (80 words written for 150 limit)
  const under = calculateWordPenalty(80, 150);
  assert.equal(under.penaltyMarks, 2.0);
  assert.equal(under.status, 'under_limit');

  // Excessive words (220 words written for 150 limit)
  const excessive = calculateWordPenalty(220, 150);
  assert.equal(excessive.penaltyMarks, 1.5);
  assert.equal(excessive.status, 'excessive');
});

test('computeFinalMarks accurately scales to UPSC marks and assigns grade band', () => {
  const criteriaScores = {
    structureAndFlow: 7,
    directiveAdherence: 7.5,
    factualAndEvidenceDepth: 8,
    linguisticSophistication: 7,
    argumentBalance: 7.5
  };

  const result10Marks = computeFinalMarks(criteriaScores, 10, 0);
  // Weighted score: 8*0.30 + 7*0.20 + 7.5*0.20 + 7.5*0.15 + 7*0.15 = 2.4 + 1.4 + 1.5 + 1.125 + 1.05 = 7.475 => ~7.5
  assert.equal(result10Marks.totalMarks, 7.5);
  assert.equal(result10Marks.percentage, 75);
  assert.equal(result10Marks.gradeBand, 'Topper Grade (AIR 1-100)');

  const result15Marks = computeFinalMarks(criteriaScores, 15, 0.5);
  // raw marks: 7.475/10 * 15 = 11.21 - 0.5 = 10.7
  assert.ok(result15Marks.totalMarks >= 10.5 && result15Marks.totalMarks <= 11);
  assert.equal(result15Marks.gradeBand, 'Topper Grade (AIR 1-100)');
});

test('computePeerPercentile maps civil services marks to realistic bell curve', () => {
  assert.equal(computePeerPercentile(6.5, 10), 99.4);
  assert.equal(computePeerPercentile(5.0, 10), 86.0);
  assert.equal(computePeerPercentile(3.0, 10), 25.0);
});
