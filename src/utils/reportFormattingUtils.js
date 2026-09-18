// src/utils/reportFormattingUtils.js
export function formatReadableAnswer(ans) {
  if (!ans?.studentInput || ans.studentInput === "Skipped") return "Skipped";

  if (
    ans.instruction &&
    (ans.studentInput === "1" ||
      ans.studentInput === "2" ||
      ans.studentInput === "3" ||
      ans.studentInput === "4")
  ) {
    const regex = new RegExp(
      `${ans.studentInput}\\s*(?:for|\\)|\\-)\\s*([^\\.\\,\\;]+)`,
      "i",
    );
    const match = ans.instruction.match(regex);
    if (match && match[1]) {
      return `${ans.studentInput} (${match[1].trim()})`;
    }
  }

  if (ans.instruction && ans.instruction.includes("Yes")) {
    return ans.studentInput === "1" ? "1 (Yes)" : "2 (No)";
  }

  return ans.studentInput;
}
