/**
 * Normalizes an answer string by stripping commas, spaces, and converting to lowercase.
 */
export function normalizeAnswer(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/,/g, "").trim().toLowerCase();
}

/**
 * Evaluates a single record's answers, detects if comma stripping fixes any
 * answers, and computes the corrected scaled score.
 *
 * @param {Object} record - The Firebase exam_results record
 * @returns {Object} { needsUpdate: boolean, updatedAnswers: Array, newScore: number }
 */
export function recalculateRecordScore(record) {
  let needsUpdate = false;
  let newCorrectCount = 0;

  const rawAnswers = record.answers || record.studentAnswers || [];

  const updatedAnswers = rawAnswers.map((ans) => {
    const studentVal = ans.studentInput ?? ans.userAnswer;
    const correctVal = ans.correctAnswer ?? ans.answer;

    if (studentVal === undefined || correctVal === undefined) {
      if (ans.isCorrect) newCorrectCount++;
      return ans;
    }

    const cleanInput = normalizeAnswer(studentVal);
    const cleanCorrect = normalizeAnswer(correctVal);

    const newIsCorrect = cleanInput === cleanCorrect;

    if (newIsCorrect !== ans.isCorrect) {
      needsUpdate = true;
    }

    if (newIsCorrect) {
      newCorrectCount++;
    }

    return { ...ans, isCorrect: newIsCorrect };
  });

  if (!needsUpdate) {
    return { needsUpdate: false, updatedAnswers, newScore: record.score };
  }

  // Activity floor calculation
  const isShortActivity =
    record.activityType === "Classwork" || record.activityType === "Quiz";
  const minRequired = isShortActivity ? 8 : 20;
  const gradedOutOf = Math.max(updatedAnswers.length, minRequired);
  const accuracy = gradedOutOf > 0 ? newCorrectCount / gradedOutOf : 0;

  // 40-50-60-100 mathematical scale with demerit penalty
  let newScore = 60 + accuracy * 40;
  newScore -= (record.demerits || 0) * 5;
  newScore = Math.max(50, Math.min(100, Math.round(newScore)));

  if (updatedAnswers.length === 0) {
    newScore = 40; // Blank test floor
  }

  return {
    needsUpdate: true,
    updatedAnswers,
    newScore,
  };
}
