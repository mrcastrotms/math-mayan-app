export const ATTENDANCE_THRESHOLD_MS = 10 * 60 * 1000;

export function dateKeyFromDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function attendanceStatus(record, now = Date.now()) {
  const joinedAt = Number(record?.joinedAtMs || 0);
  const lastSeenAt = Number(record?.lastSeenAtMs || joinedAt);
  const duration = Math.max(0, Math.min(now, lastSeenAt) - joinedAt);
  if (duration >= ATTENDANCE_THRESHOLD_MS || record?.qualifiedAtMs) return "present";
  if (joinedAt > 0) return "in-progress";
  return "absent";
}

export function relativeBehaviorScores(records = []) {
  const normalized = records.map((record) => ({
    ...record,
    merits: Number(record.merits || 0),
    demerits: Number(record.demerits || 0),
  }));
  const values = normalized.map((record) => record.merits - record.demerits);
  const highest = values.length ? Math.max(...values) : 0;
  const lowest = values.length ? Math.min(...values) : 0;
  const range = highest - lowest;

  return normalized.map((record, index) => ({
    ...record,
    behaviorScore:
      range === 0 ? 85 : Math.round(70 + ((values[index] - lowest) / range) * 30),
  }));
}
