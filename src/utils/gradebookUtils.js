import STYLES from "../styles/gradebookStyles.json";

export function formatSafeScore(score) {
  if (typeof score === "number" && !isNaN(score)) return score;
  if (typeof score === "string" && !isNaN(parseFloat(score)))
    return parseFloat(score);
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
