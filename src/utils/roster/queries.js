import {
  normalizeString,
  formatToNaturalName,
  calculateMatchScore,
} from "./matching";

export function matchStudentToRoster(inputName, sectionRoster = []) {
  if (!inputName || !Array.isArray(sectionRoster) || sectionRoster.length === 0) {
    return { matched: false };
  }

  const normalizedInput = normalizeString(inputName);

  let bestMatch = null;
  let highestScore = 0;
  let ambiguityCount = 0;

  sectionRoster.forEach((candidate) => {
    // Supports both extensible student objects and string fallbacks
    const rawEntry = typeof candidate === "string" ? candidate : candidate.rawName;
    const natural = typeof candidate === "object" && candidate.displayName
      ? candidate.displayName
      : formatToNaturalName(rawEntry);

    const norm = normalizeString(`${rawEntry} ${natural}`);
    const score = calculateMatchScore(normalizedInput, norm);

    if (score >= 0.5 && score > highestScore) {
      highestScore = score;
      bestMatch = { rawEntry, natural, candidate };
      ambiguityCount = 1;
    } else if (score >= 0.5 && score === highestScore) {
      ambiguityCount++;
    }
  });

  if (bestMatch && highestScore >= 0.5 && ambiguityCount === 1) {
    return {
      matched: true,
      officialName: bestMatch.natural,
      rawRosterName: bestMatch.rawEntry,
      studentData: typeof bestMatch.candidate === "object" ? bestMatch.candidate : null,
    };
  }

  return { matched: false };
}

export function getSectionStudents(sectionRoster = []) {
  if (!Array.isArray(sectionRoster)) return [];
  return sectionRoster.map((item) => {
    if (typeof item === "string") return formatToNaturalName(item);
    return item.displayName || formatToNaturalName(item.rawName);
  });
}
