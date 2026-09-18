// src/utils/navigationUtils.js
export function cleanAnswerString(val) {
  return String(val ?? "")
    .replace(/,/g, "")
    .trim();
}

export function createAnswerRecord(currentQ, input, isSkipped = false) {
  if (isSkipped) {
    return {
      question: currentQ,
      studentInput: "Skipped",
      correctAnswer: currentQ?.correctAnswer,
      isCorrect: false,
    };
  }

  const cleanInput = cleanAnswerString(input);
  const cleanCorrect = cleanAnswerString(currentQ?.correctAnswer);

  return {
    question: currentQ,
    studentInput: input,
    correctAnswer: currentQ?.correctAnswer,
    isCorrect: cleanInput === cleanCorrect,
  };
}
