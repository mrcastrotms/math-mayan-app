export function appendAnswerInput(currentInput, value, maxLength = 15) {
  const next = `${currentInput || ""}${value || ""}`;
  return next.slice(0, maxLength);
}
