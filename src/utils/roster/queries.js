import rosterData from "../../data/classRoster.json";
import {
  normalizeString,
  formatToNaturalName,
  calculateMatchScore,
} from "./matching";

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
