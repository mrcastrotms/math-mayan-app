import STYLES from "../styles/gradebookStyles.json";
export {
  formatSafeScore,
  formatRecordDate,
  getRecordTimestampMs,
  getDuplicateSubmissionKey,
  buildDuplicateSubmissionMap,
} from "./gradebookUtils.mjs";
import { formatSafeScore } from "./gradebookUtils.mjs";

export function getScoreBadgeClass(score) {
  const safe = formatSafeScore(score);
  if (safe >= 80) return STYLES.scoreGreen;
  if (safe >= 70) return STYLES.scoreYellow;
  return STYLES.scoreRed;
}
