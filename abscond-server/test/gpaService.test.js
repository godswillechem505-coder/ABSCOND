import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGradeFromScore,
  getAcademicStanding,
  calculateStudentGpaSummary,
} from '../src/services/gpaService.js';

test('GPA Service - Grade Calculation', async (t) => {
  await t.test('calculates grade A for scores >= 70', () => {
    const res = calculateGradeFromScore(75);
    assert.equal(res.grade, 'A');
    assert.equal(res.gradePoint, 5);
    assert.equal(res.remark, 'EXCELLENT');
  });

  await t.test('calculates grade B for scores 60 - 69', () => {
    const res = calculateGradeFromScore(65);
    assert.equal(res.grade, 'B');
    assert.equal(res.gradePoint, 4);
    assert.equal(res.remark, 'VERY GOOD');
  });

  await t.test('calculates grade C for scores 50 - 59', () => {
    const res = calculateGradeFromScore(52);
    assert.equal(res.grade, 'C');
    assert.equal(res.gradePoint, 3);
  });

  await t.test('calculates grade D for scores 45 - 49', () => {
    const res = calculateGradeFromScore(48);
    assert.equal(res.grade, 'D');
    assert.equal(res.gradePoint, 2);
  });

  await t.test('calculates grade E for scores 40 - 44', () => {
    const res = calculateGradeFromScore(41);
    assert.equal(res.grade, 'E');
    assert.equal(res.gradePoint, 1);
  });

  await t.test('calculates grade F for scores < 40', () => {
    const res = calculateGradeFromScore(35);
    assert.equal(res.grade, 'F');
    assert.equal(res.gradePoint, 0);
  });
});

test('GPA Service - Academic Standing Classification', async (t) => {
  await t.test('classifies Distinction for CGPA >= 4.5', () => {
    assert.match(getAcademicStanding(4.8), /Distinction/);
  });

  await t.test('classifies Upper Credit for CGPA 3.5 - 4.49', () => {
    assert.match(getAcademicStanding(3.75), /Upper Credit/);
  });

  await t.test('classifies Lower Credit for CGPA 2.4 - 3.49', () => {
    assert.match(getAcademicStanding(2.8), /Lower Credit/);
  });

  await t.test('classifies Pass for CGPA 1.5 - 2.39', () => {
    assert.match(getAcademicStanding(1.9), /Pass/);
  });

  await t.test('classifies Probation for CGPA < 1.5', () => {
    assert.match(getAcademicStanding(1.2), /Probationary/);
  });
});

test('GPA Service - calculateStudentGpaSummary', async (t) => {
  await t.test('handles empty results gracefully', () => {
    const summary = calculateStudentGpaSummary([]);
    assert.equal(summary.totalCourses, 0);
    assert.equal(summary.cgpa, '0.00');
  });

  await t.test('calculates accurate weighted GPA from list of results', () => {
    const results = [
      { score: 80, grade: 'A', units: 3 }, // 5 * 3 = 15
      { score: 65, grade: 'B', units: 3 }, // 4 * 3 = 12
      { score: 55, grade: 'C', units: 2 }, // 3 * 2 = 6
    ];
    // Total Grade Points = 15 + 12 + 6 = 33
    // Total Units = 3 + 3 + 2 = 8
    // CGPA = 33 / 8 = 4.125 -> 4.13
    const summary = calculateStudentGpaSummary(results);
    assert.equal(summary.totalCourses, 3);
    assert.equal(summary.totalUnitsAttempted, 8);
    assert.equal(summary.totalUnitsEarned, 8);
    assert.equal(summary.cgpa, '4.13');
    assert.equal(summary.passRate, 100);
  });

  await t.test('accounts for failed courses in units earned and pass rate', () => {
    const results = [
      { score: 80, grade: 'A', units: 3 },
      { score: 30, grade: 'F', units: 3 }, // Fail
    ];
    const summary = calculateStudentGpaSummary(results);
    assert.equal(summary.totalUnitsAttempted, 6);
    assert.equal(summary.totalUnitsEarned, 3);
    assert.equal(summary.passRate, 50);
  });
});
