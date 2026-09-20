/**
 * Normalizes an identifier string into a clean Firestore document ID-safe slug.
 * Strips accents/diacritics and removes unsafe characters.
 */
export function slugifyIdentifier(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Builds a deterministic Firestore doc ID for an exam submission.
 * Returns null for teacher/test bypass runs ("00000") to allow repeated testing.
 */
export function buildExamDocId({ sessionCode, section, studentIdentifier, isTestRun = false }) {
  const cleanCode = slugifyIdentifier(sessionCode);
  if (!cleanCode || cleanCode === "00000" || isTestRun) {
    return null;
  }
  const cleanSection = slugifyIdentifier(section);
  const cleanStudent = slugifyIdentifier(studentIdentifier);
  if (!cleanSection || !cleanStudent) return null;
  return `exam_${cleanCode}_${cleanSection}_${cleanStudent}`;
}

/**
 * Builds a deterministic Firestore doc ID for a classwork submission.
 */
export function buildClassworkDocId({ worksheetId, studentIdentifier }) {
  const cleanWorkId = slugifyIdentifier(worksheetId);
  const cleanStudent = slugifyIdentifier(studentIdentifier);
  if (!cleanWorkId || !cleanStudent) return null;
  return `cw_${cleanWorkId}_${cleanStudent}`;
}

/**
 * Evaluates whether an existing exam_results record represents a valid completed submission.
 */
export function isPriorSubmissionActive(record) {
  if (!record) return false;
  if (record.isDeleted || record.deleted) return false;
  if (record.status === "NO_ATTEMPT" || record.status === "HIDDEN") return false;
  return record.score !== null && record.score !== undefined;
}
