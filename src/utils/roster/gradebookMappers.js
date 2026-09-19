import {
  normalizeString,
  formatToNaturalName,
  calculateMatchScore,
} from "./matching";

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === "—") return "";
  
  if (typeof dateStr === "object") {
    if (typeof dateStr.toDate === "function") {
      dateStr = dateStr.toDate();
    } else if (dateStr.seconds) {
      dateStr = new Date(dateStr.seconds * 1000);
    }
  }
  
  if (dateStr instanceof Date) {
    return dateStr.toISOString().split("T")[0];
  }
  
  const str = String(dateStr).split(",")[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) return str.split("T")[0];

  const parts = str.split("/");
  if (parts.length === 3) {
    let [m, d, y] = parts;
    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split("T")[0];
  }
  
  return str;
}

export function mergeRosterWithSubmissions(
  sectionFilter,
  submissions = [],
  rosterDirectory = {},
  activityFilter = "All",
  dateFilter = "",
) {
  const activeSubmissions = (submissions || []).filter((s) => {
    if (s.isDeleted || s.deleted) return false;
    
    // Case-insensitive section filter
    if (sectionFilter && sectionFilter !== "All" && s.section) {
      if (s.section.toLowerCase() !== sectionFilter.toLowerCase()) return false;
    }

    // Case-insensitive activity filter
    if (activityFilter && activityFilter !== "All") {
      const subAct = (s.activityType || s.activity || "").trim();
      if (activityFilter === "Other") {
        const standardTypes = ["classwork", "quiz", "assessment", "test", "exam", "assessment / exam"];
        if (standardTypes.includes(subAct.toLowerCase())) return false;
      } else {
        if (subAct.toLowerCase() !== activityFilter.toLowerCase()) return false;
      }
    }

    // Date filter
    if (dateFilter) {
      const subDateRaw = s.date || s.timestamp || s.createdAt;
      const subDateNorm = normalizeDate(subDateRaw);
      if (subDateNorm !== dateFilter) return false;
    }

    return true;
  });

  const targetSections =
    sectionFilter && sectionFilter !== "All"
      ? [sectionFilter]
      : Object.keys(rosterDirectory);

  const mergedRows = [];
  const matchedSubmissionIds = new Set();

  targetSections.forEach((section) => {
    const rawSectionList = rosterDirectory[section] || rosterDirectory[section.toLowerCase()] || [];
    rawSectionList.forEach((rawEntry) => {
      const naturalOfficial = typeof rawEntry === "string" ? formatToNaturalName(rawEntry) : (rawEntry.displayName || formatToNaturalName(rawEntry.rawName));
      const rawRosterString = typeof rawEntry === "string" ? rawEntry : (rawEntry.rawName || rawEntry.displayName);
      const normOfficial = normalizeString(`${rawRosterString} ${naturalOfficial}`);

      let bestSub = null;
      let highestScore = 0;

      activeSubmissions.forEach((sub) => {
        if (matchedSubmissionIds.has(sub.id)) return;
        
        // Case-insensitive section matching for submissions
        if (sub.section && sub.section.toLowerCase() !== section.toLowerCase()) return;

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
          rawRosterName: rawRosterString,
          rawTypedName: bestSub.studentName || bestSub.name,
          section,
          status: "SUBMITTED",
        });
      } else {
        mergedRows.push({
          id: `no-attempt-${section}-${normalizeString(naturalOfficial).replace(/\s+/g, "-")}`,
          officialName: naturalOfficial,
          rawRosterName: rawRosterString,
          studentName: naturalOfficial,
          rawTypedName: null,
          section,
          activityType: activityFilter !== "All" ? activityFilter : "—",
          score: null,
          date: dateFilter ? dateFilter : "—",
          status: "NO_ATTEMPT",
          answers: [],
          demerits: [],
        });
      }
    });
  });

  activeSubmissions.forEach((s) => {
    if (!matchedSubmissionIds.has(s.id)) {
      if (sectionFilter === "All" || (s.section && s.section.toLowerCase() === sectionFilter.toLowerCase())) {
        mergedRows.push({
          ...s,
          officialName: s.studentName || s.name,
          rawTypedName: s.studentName || s.name,
          section: s.section || sectionFilter,
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
    .filter((s) => sectionFilter === "All" || (s.section && s.section.toLowerCase() === sectionFilter.toLowerCase()))
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
