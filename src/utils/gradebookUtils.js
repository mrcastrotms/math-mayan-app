// src/utils/gradebookUtils.js
import STYLES from "../styles/gradebookStyles.json";

/* =========================================================================
   1. GRADEBOOK RECORD & SCORE FORMATTING
   ========================================================================= */

export function formatSafeScore(score) {
  if (typeof score === "number" && !isNaN(score)) return score;
  if (typeof score === "string" && !isNaN(parseFloat(score))) {
    return parseFloat(score);
  }
  return 0;
}

export function formatRecordDate(timestamp) {
  if (timestamp?.toDate) return timestamp.toDate().toLocaleDateString();
  if (timestamp) return new Date(timestamp).toLocaleDateString();
  return "Unknown Date";
}

export function getScoreBadgeClass(score) {
  const safe = formatSafeScore(score);
  if (safe >= 80) return STYLES.scoreGreen;
  if (safe >= 70) return STYLES.scoreYellow;
  return STYLES.scoreRed;
}

/* =========================================================================
   2. STUDENT ANSWER FORMATTING
   ========================================================================= */

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
