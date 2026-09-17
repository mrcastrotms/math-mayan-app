// src/utils/rosterUtils.js
import rosterData from "../data/classRoster.json";

function normalizeString(str = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatToNaturalName(rosterEntry = "") {
  if (!rosterEntry.includes(",")) return rosterEntry.trim();
  const [lastNames, firstNames] = rosterEntry.split(",").map((s) => s.trim());
  return `${firstNames} ${lastNames}`.trim();
}

export function matchStudentToRoster(inputName, section) {
  if (!inputName || !section) return null;
  const sectionRoster = rosterData[section];
  if (!sectionRoster || !Array.isArray(sectionRoster)) return null;

  const normalizedInput = normalizeString(inputName);
  const inputWords = normalizedInput.split(" ").filter((w) => w.length > 1);
  if (inputWords.length === 0) return null;

  const candidates = sectionRoster.filter((rawEntry) => {
    const natural = formatToNaturalName(rawEntry);
    const norm = normalizeString(`${rawEntry} ${natural}`);
    return inputWords.every((word) => norm.includes(word));
  });

  if (candidates.length === 1) {
    const rawMatch = candidates[0];
    return {
      matched: true,
      officialName: formatToNaturalName(rawMatch),
      rawRosterName: rawMatch,
      section,
    };
  }

  if (candidates.length > 1) {
    return {
      matched: false,
      error: "ambiguous",
      candidates: candidates.map(formatToNaturalName),
    };
  }

  return { matched: false, error: "not_found" };
}

export function getSectionStudents(section) {
  const list = rosterData[section] || [];
  return list.map(formatToNaturalName);
}
