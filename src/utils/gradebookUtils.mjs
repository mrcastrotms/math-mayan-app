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

export function getRecordTimestampMs(timestamp) {
  if (!timestamp) return 0;
  if (typeof timestamp.toMillis === "function") return timestamp.toMillis();
  if (typeof timestamp.toDate === "function") return timestamp.toDate().getTime();
  if (typeof timestamp.seconds === "number") {
    return timestamp.seconds * 1000 + (timestamp.nanoseconds ? Math.floor(timestamp.nanoseconds / 1e6) : 0);
  }
  if (timestamp instanceof Date) return timestamp.getTime();
  if (typeof timestamp === "number") return timestamp;
  const parsed = new Date(timestamp).getTime();
  return isNaN(parsed) ? 0 : parsed;
}

export function getDuplicateSubmissionKey(record) {
  if (!record) return "";
  const student = (record.uid || record.officialName || record.studentName || "").trim().toLowerCase();
  const section = (record.section || "").trim().toUpperCase();
  const activity = (record.activityType || record.activity || "Exam").trim().toLowerCase();
  if (!student) return "";
  return `${student}::${section}::${activity}`;
}

export function buildDuplicateSubmissionMap(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return new Map();
  }

  // 1. Group records that have actual attempts by composite key
  const groups = new Map();
  records.forEach((record, index) => {
    const hasAttempt =
      record &&
      record.status !== "NO_ATTEMPT" &&
      record.score !== null &&
      record.score !== undefined;

    if (!hasAttempt) return;

    const key = getDuplicateSubmissionKey(record);
    if (!key) return;

    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({ record, originalIndex: index });
  });

  // 2. Compute attempt rankings for groups with count > 1
  const resultMap = new Map();

  for (const items of groups.values()) {
    if (items.length <= 1) continue;

    // Sort ascending: earliest attempt first, latest attempt last
    const sorted = [...items].sort((a, b) => {
      const timeA = getRecordTimestampMs(a.record?.timestamp);
      const timeB = getRecordTimestampMs(b.record?.timestamp);
      if (timeA !== timeB) return timeA - timeB;
      return a.originalIndex - b.originalIndex;
    });

    const total = sorted.length;
    sorted.forEach((item, idx) => {
      const recordKey = item.record.id || `${item.record.section}-${item.originalIndex}`;
      const attemptNumber = idx + 1;
      const isEarliest = idx === 0;
      const isLatest = idx === total - 1;

      let badgeText = `Attempt ${attemptNumber}`;
      if (isEarliest) {
        badgeText = "Attempt 1 (Earliest)";
      } else if (isLatest) {
        badgeText = `Attempt ${attemptNumber} (Latest)`;
      }

      resultMap.set(recordKey, {
        isDuplicate: true,
        totalAttempts: total,
        attemptNumber,
        isEarliest,
        isLatest,
        badgeText,
      });
    });
  }

  return resultMap;
}
