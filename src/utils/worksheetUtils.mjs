export function normalizeWorksheetAnswer(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[x×·⋅]/g, "*")
    .replace(/[÷⁄]/g, "/")
    .replace(/[−–—]/g, "-")
    .replace(/\s+/g, "")
    .replace(/,/g, "")
    .trim();
}

export function isWorksheetAnswerCorrect(answer, question) {
  const accepted = question?.acceptedAnswers?.length
    ? question.acceptedAnswers
    : [question?.correctAnswer];
  const normalized = normalizeWorksheetAnswer(answer);
  return Boolean(normalized) && accepted.some(
    (candidate) => normalizeWorksheetAnswer(candidate) === normalized,
  );
}

export function getWorksheetStatus(attempt, dueDate, now = Date.now()) {
  if (attempt?.status === "submitted") return "Submitted";
  if (attempt?.answers && Object.keys(attempt.answers).length > 0) return "In Progress";
  if (dueDate && new Date(dueDate).getTime() <= now) return "Closed";
  return "Not Started";
}

export function isWorksheetClosed(dueDate, now = Date.now()) {
  return Boolean(dueDate && new Date(dueDate).getTime() <= now);
}

export function canAdvanceWorksheetQuestion(answer) {
  return String(answer ?? "").trim().length > 0;
}

export function scoreWorksheet(questions = [], answers = {}) {
  const answered = questions.filter((question) =>
    Object.prototype.hasOwnProperty.call(answers, question.id),
  );
  const correct = answered.filter((question) =>
    isWorksheetAnswerCorrect(answers[question.id], question),
  ).length;
  return {
    correct,
    answered: answered.length,
    total: questions.length,
    score: questions.length ? Math.round((correct / questions.length) * 100) : 0,
  };
}
