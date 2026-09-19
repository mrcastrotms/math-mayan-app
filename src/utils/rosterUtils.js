// src/utils/rosterUtils.js
import rosterData from "../data/classRoster.json";

/**
 * Normalizes text:
 * - Inserts spaces before capital letters if joined without space (DominicPadilla -> Dominic Padilla)
 * - Strips accents/diacritics
 * - Collapses repeated letters (maarcela -> marcela)
 * - Strips special punctuation and trims spaces
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

/**
 * Standard Levenshtein distance for fuzzy typo tolerance.
 */
function levenshteinDistance(a, b) {
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
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Checks if tokenA fuzzy-matches tokenB:
 * - Direct equality or substring containment for words >= 4 chars
 * - Or edit distance <= 2 for words >= 8 chars, <= 1 for words >= 5 chars
 */
function tokenMatches(t1, t2) {
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

/**
 * Scores how well an input name matches a roster candidate.
 * Returns ratio of matched input tokens to total valid input tokens.
 */
function calculateMatchScore(inputNorm, candidateNorm) {
  const inputTokens = inputNorm.split(" ").filter((w) => w.length > 1);
  const candidateTokens = candidateNorm.split(" ").filter((w) => w.length > 1);

  if (inputTokens.length === 0 || candidateTokens.length === 0) return 0;

  let totalScore = 0;
  inputTokens.forEach((inTok) => {
    if (candidateTokens.includes(inTok)) {
      totalScore += 1.0; // Perfect match
    } else if (candidateTokens.some((canTok) => tokenMatches(inTok, canTok))) {
      totalScore += 0.8; // Fuzzy / typo match
    }
  });

  return totalScore / inputTokens.length;
}

export function matchStudentToRoster(inputName, section) {
  if (!inputName || !section) return null;
  const sectionRoster = rosterData[section];
  if (!sectionRoster || !Array.isArray(sectionRoster)) return null;

  const normalizedInput = normalizeString(inputName);

  let bestMatch = null;
  let highestScore = 0;
  let ambiguityCount = 0;

  sectionRoster.forEach((rawEntry) => {
    const natural = formatToNaturalName(rawEntry);
    const norm = normalizeString(`${rawEntry} ${natural}`);

    const score = calculateMatchScore(normalizedInput, norm);

    if (score >= 0.5 && score > highestScore) {
      highestScore = score;
      bestMatch = rawEntry;
      ambiguityCount = 1;
    } else if (score >= 0.5 && score === highestScore) {
      ambiguityCount++;
    }
  });

  if (bestMatch && highestScore >= 0.5 && ambiguityCount === 1) {
    return {
      matched: true,
      officialName: formatToNaturalName(bestMatch),
      rawRosterName: bestMatch,
      section,
    };
  }

  return { matched: false };
}

export function getSectionStudents(section) {
  const list = rosterData[section] || [];
  return list.map(formatToNaturalName);
}

/**
 * Merges raw submissions with the official roster for a section (or all sections).
 * Records flagged as isDeleted or deleted are filtered out so that:
 * 1. The student shows as "NO_ATTEMPT" in the gradebook.
 * 2. The Firestore document, QR code, and public ?report= link remain functional.
 * 3. The entire combined list is sorted alphabetically by FIRST NAME (natural order: A -> Z).
 */
export function mergeRosterWithSubmissions(sectionFilter, submissions = []) {
  const activeSubmissions = (submissions || []).filter(
    (s) => !s.isDeleted && !s.deleted,
  );

  const targetSections =
    sectionFilter && sectionFilter !== "All"
      ? [sectionFilter]
      : Object.keys(rosterData);

  const mergedRows = [];
  const matchedSubmissionIds = new Set();

  targetSections.forEach((section) => {
    const rawSectionList = rosterData[section] || [];

    rawSectionList.forEach((rawEntry) => {
      const naturalOfficial = formatToNaturalName(rawEntry);
      const normOfficial = normalizeString(`${rawEntry} ${naturalOfficial}`);

      let bestSub = null;
      let highestScore = 0;

      activeSubmissions.forEach((sub) => {
        if (matchedSubmissionIds.has(sub.id)) return;
        if (sub.section && sub.section !== section) return;

        const subName = sub.studentName || sub.name || "";
        const normSub = normalizeString(subName);
        if (!normSub) return;

        const score = calculateMatchScore(normSub, normOfficial);

        if (score >= 0.5 && score > highestScore) {
          highestScore = score;
          bestSub = sub;
        }
      });

      if (bestSub) {
        matchedSubmissionIds.add(bestSub.id);
        mergedRows.push({
          ...bestSub,
          officialName: naturalOfficial,
          rawRosterName: rawEntry,
          rawTypedName: bestSub.studentName || bestSub.name,
          section,
          status: "SUBMITTED",
        });
      } else {
        mergedRows.push({
          id: `no-attempt-${section}-${normalizeString(naturalOfficial).replace(/\s+/g, "-")}`,
          officialName: naturalOfficial,
          rawRosterName: rawEntry,
          studentName: naturalOfficial,
          rawTypedName: null,
          section,
          activityType: "—",
          score: null,
          timestamp: null,
          status: "NO_ATTEMPT",
          answers: [],
          demerits: [],
        });
      }
    });
  });

  // Include any stray submissions that did not match the official roster
  activeSubmissions.forEach((s) => {
    if (!matchedSubmissionIds.has(s.id)) {
      if (sectionFilter === "All" || s.section === sectionFilter) {
        mergedRows.push({
          ...s,
          officialName: s.studentName || s.name,
          rawTypedName: s.studentName || s.name,
          status: "SUBMITTED",
        });
      }
    }
  });

  // Sort strictly by FIRST NAME (natural name: A -> Z)
  return mergedRows.sort((a, b) => {
    const nameA = a.officialName || a.studentName || "";
    const nameB = b.officialName || b.studentName || "";
    return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
  });
}

/**
 * Returns exclusively soft-deleted submissions for the Hidden archive view,
 * sorted alphabetically by First Name.
 */
export function getHiddenSubmissions(sectionFilter, submissions = []) {
  const hiddenOnly = (submissions || []).filter(
    (s) => s.isDeleted || s.deleted,
  );

  return hiddenOnly
    .filter((s) => sectionFilter === "All" || s.section === sectionFilter)
    .map((sub) => ({
      ...sub,
      officialName: sub.studentName || sub.name,
      rawTypedName: sub.studentName || sub.name,
      status: "HIDDEN",
    }))
    .sort((a, b) => {
      const nameA = a.officialName || a.studentName || "";
      const nameB = b.officialName || b.studentName || "";
      return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
    });
}
