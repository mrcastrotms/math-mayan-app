export function computeEnhancedScore(answers, demerits, examDuration) {
  if (!answers || answers.length === 0) {
    return 40;
  }
  const minRequired = examDuration <= 600 ? 8 : 12;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const gradedOutOf = Math.max(answers.length, minRequired);
  const accuracy = correctCount / gradedOutOf;

  let finalScore = 60 + accuracy * 40;
  finalScore -= (demerits || 0) * 5;
  return Math.max(50, Math.min(100, Math.round(finalScore)));
}
