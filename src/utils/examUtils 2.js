// PURE TIME FORMATTER
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// PURE SCORING ALGORITHM
export const calculateFinalScore = (studentAnswers, demerits) => {
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
};

// PURE MULTIPLE-CHOICE TRANSLATOR (For reports)
export const formatReadableAnswer = (ans) => {
  if (ans.studentInput === "Skipped") return "Skipped";
  const isChoice =
    ans.correctAnswer === "1" ||
    ans.correctAnswer === "2" ||
    ans.correctAnswer === "3";
  if (isChoice) {
    if (ans.question.includes("Is"))
      return ans.studentInput === "1" ? "1 (Yes)" : "2 (No)";
    if (ans.studentInput === "1") return "1 (Option A)";
    if (ans.studentInput === "2") return "2 (Option B)";
    if (ans.studentInput === "3") return "3 (Option C)";
  }
  return ans.studentInput;
};

// PURE ADAPTIVE SEARCH ALGORITHM ("Try Harder")
export const findNextHardQuestionIndex = (questions, currentAttempted) => {
  let added = 1;
  while (added < questions.length) {
    const checkIndex = (currentAttempted + added) % questions.length;
    if (questions[checkIndex].difficulty === "hard") {
      return currentAttempted + added;
    }
    added++;
  }
  return currentAttempted + 1;
};
