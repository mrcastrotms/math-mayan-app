import rosterData from "../../data/classRoster.json";
import {
  normalizeString,
  formatToNaturalName,
  calculateMatchScore,
} from "./matching";

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

  return mergedRows.sort((a, b) => {
    const nameA = a.officialName || a.studentName || "";
    const nameB = b.officialName || b.studentName || "";
    return nameA.localeCompare(nameB, "es", { sensitivity: "base" });
  });
}

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
