export function calculateFinalScore(studentAnswers, demerits) {
  let baseScore = 70;
  if (studentAnswers.length > 0) {
    const accuracy =
      (studentAnswers.filter((a) => a.isCorrect).length /
        studentAnswers.length) *
      100;
    if (accuracy > 50) baseScore = 70 + (accuracy - 50) * (30 / 50);
  }
  return Math.max(
    60,
    Math.round(baseScore) - Math.min(demerits.length * 2, 10),
  );
}
