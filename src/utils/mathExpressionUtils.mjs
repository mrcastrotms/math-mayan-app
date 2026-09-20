export function normalizeMathLatex(value) {
  return String(value ?? "")
    .replace(/\\;/g, "\\text{ }")
    .replace(/sqrt\(([^)]+)\)/gi, "\\sqrt{$1}")
    .replace(/(\d+)\^(\d+)/g, "$1^{$2}")
    .replace(/[×·]/g, "\\times")
    .replace(/\*/g, "\\times");
}
