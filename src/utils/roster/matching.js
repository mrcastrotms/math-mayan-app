/**
 * String normalization and fuzzy-matching algorithms for student names.
 */

export function normalizeString(str = "") {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/(.)\1+/g, "$1")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function tokenMatches(t1, t2) {
  if (t1 === t2) return true;
  if (
    t1.length >= 4 &&
    t2.length >= 4 &&
    (t1.includes(t2) || t2.includes(t1))
  ) {
    return true;
  }
  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen >= 5) {
    const dist = levenshteinDistance(t1, t2);
    if (dist <= (maxLen >= 8 ? 2 : 1)) return true;
  }
  return false;
}

export function formatToNaturalName(rosterEntry = "") {
  if (!rosterEntry.includes(",")) return rosterEntry.trim();
  const [lastNames, firstNames] = rosterEntry.split(",").map((s) => s.trim());
  return `${firstNames} ${lastNames}`.trim();
}

export function calculateMatchScore(inputNorm, candidateNorm) {
  const inputTokens = inputNorm.split(" ").filter((w) => w.length > 1);
  const candidateTokens = candidateNorm.split(" ").filter((w) => w.length > 1);

  if (inputTokens.length === 0 || candidateTokens.length === 0) return 0;

  let totalScore = 0;
  inputTokens.forEach((inTok) => {
    if (candidateTokens.includes(inTok)) {
      totalScore += 1.0;
    } else if (candidateTokens.some((canTok) => tokenMatches(inTok, canTok))) {
      totalScore += 0.8;
    }
  });

  return totalScore / inputTokens.length;
}
