/**
 * Service Layer for Academic GPA and CGPA Calculations
 * Enforces official Abia State College of Nursing Sciences & NMCN 5-Point Grading Scale.
 */

export const GRADE_POINTS_MAP = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const calculateGradeFromScore = (score) => {
  const numScore = Number(score);
  if (numScore >= 70) return { grade: 'A', gradePoint: 5, remark: 'EXCELLENT' };
  if (numScore >= 60) return { grade: 'B', gradePoint: 4, remark: 'VERY GOOD' };
  if (numScore >= 50) return { grade: 'C', gradePoint: 3, remark: 'GOOD' };
  if (numScore >= 45) return { grade: 'D', gradePoint: 2, remark: 'FAIR PASS' };
  if (numScore >= 40) return { grade: 'E', gradePoint: 1, remark: 'PASS' };
  return { grade: 'F', gradePoint: 0, remark: 'FAIL (CARRYOVER)' };
};

export const getAcademicStanding = (cgpa) => {
  const numericCgpa = Number(cgpa);
  if (numericCgpa >= 4.5) return 'Distinction / First Class Standing';
  if (numericCgpa >= 3.5) return 'Upper Credit / High Standing';
  if (numericCgpa >= 2.4) return 'Lower Credit / Good Standing';
  if (numericCgpa >= 1.5) return 'Pass Standing';
  return 'Probationary Standing';
};

export const calculateStudentGpaSummary = (results = []) => {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      totalCourses: 0,
      totalUnitsAttempted: 0,
      totalUnitsEarned: 0,
      totalGradePoints: 0,
      gpa: '0.00',
      cgpa: '0.00',
      academicStanding: 'Good Standing',
      passRate: 100,
    };
  }

  let totalUnitsAttempted = 0;
  let totalUnitsEarned = 0;
  let totalGradePoints = 0;
  let passedCount = 0;

  results.forEach((r) => {
    const units = Number(r.course?.units || r.units || 3);
    const scoreInfo = r.score !== undefined ? calculateGradeFromScore(r.score) : { gradePoint: GRADE_POINTS_MAP[r.grade] || 0 };
    const gradePoint = scoreInfo.gradePoint;
    const grade = r.grade || scoreInfo.grade;

    totalUnitsAttempted += units;
    totalGradePoints += gradePoint * units;

    if (grade !== 'F') {
      totalUnitsEarned += units;
      passedCount += 1;
    }
  });

  const cgpaNum = totalUnitsAttempted > 0 ? totalGradePoints / totalUnitsAttempted : 0;
  const cgpa = cgpaNum.toFixed(2);

  return {
    totalCourses: results.length,
    totalUnitsAttempted,
    totalUnitsEarned,
    totalGradePoints,
    gpa: cgpa,
    cgpa,
    academicStanding: getAcademicStanding(cgpaNum),
    passRate: Math.round((passedCount / results.length) * 100),
  };
};
