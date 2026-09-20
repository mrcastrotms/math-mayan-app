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

export function sectionGrade(section = "") {
  const match = String(section).match(/\d+/);
  return match ? match[0] : String(section || "Unknown");
}

export function historicalStudentRows(attendance = [], behavior = [], { dateKey = "", grade = "all" } = {}) {
  const filtered = (items) =>
    items.filter((item) => (!dateKey || item.dateKey === dateKey) && (grade === "all" || sectionGrade(item.section) === grade));
  const rows = new Map();
  const add = (item) => {
    const key = `${item.uid || item.studentName || "unknown"}_${item.section || ""}`;
    const existing = rows.get(key) || {
      id: key,
      uid: item.uid,
      studentName: item.studentName || item.uid || "Unknown student",
      section: item.section || "Unknown",
      grade: sectionGrade(item.section),
      attendanceDays: 0,
      behaviorScore: null,
      merits: 0,
      demerits: 0,
      dates: [],
    };
    rows.set(key, existing);
    return existing;
  };
  filtered(attendance).forEach((item) => {
    const row = add(item);
    if (item.qualifiedAtMs || item.status === "present") row.attendanceDays += 1;
    if (item.dateKey && !row.dates.includes(item.dateKey)) row.dates.push(item.dateKey);
  });
  filtered(behavior).forEach((item) => {
    const row = add(item);
    row.merits += Number(item.merits || 0);
    row.demerits += Number(item.demerits || 0);
    row.behaviorScore = item.behaviorScore ?? row.behaviorScore;
    if (item.dateKey && !row.dates.includes(item.dateKey)) row.dates.push(item.dateKey);
  });
  return [...rows.values()].sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export function historicalDailyTotals(attendance = [], behavior = [], grade = "all") {
  const dates = new Set([...attendance, ...behavior].map((item) => item.dateKey).filter(Boolean));
  return [...dates].sort().map((dateKey) => {
    const rows = historicalStudentRows(attendance, behavior, { dateKey, grade });
    return {
      dateKey,
      present: rows.filter((row) => row.attendanceDays > 0).length,
      students: rows.length,
      merits: rows.reduce((sum, row) => sum + row.merits, 0),
      demerits: rows.reduce((sum, row) => sum + row.demerits, 0),
    };
  });
}
