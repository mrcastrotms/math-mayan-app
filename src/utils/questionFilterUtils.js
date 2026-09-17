// src/utils/questionFilterUtils.js
export function filterActiveQuestions(
  examQuestions = [],
  activeActivityType = "",
) {
  const isSpecialTier =
    activeActivityType.includes("Classwork") ||
    activeActivityType.includes("Quiz");

  const filtered = examQuestions.filter(
    (q) => !isSpecialTier || q.tier === "classwork" || !q.tier,
  );

  return filtered.length ? filtered : examQuestions;
}
