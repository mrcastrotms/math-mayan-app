"use client";

import { useMemo } from "react";
import { matchStudentToRoster, getSectionStudents } from "../../../utils/rosterUtils";

export function useGateValidation({ studentName, storedName, selectedSection, accessCode, showCodeField }) {
  const isMrCastro = (name) => {
    const normalized = (name || "").trim().toLowerCase();
    return (
      normalized === "mr. castro" ||
      normalized === "mr castro" ||
      normalized === "césar castro" ||
      normalized === "cesar castro"
    );
  };

  const rosterOptions = useMemo(() => {
    return getSectionStudents(selectedSection);
  }, [selectedSection]);

  const resolvedOfficialName = useMemo(() => {
    const target = studentName || storedName;
    if (!target || !selectedSection) return "";
    const match = matchStudentToRoster(target, selectedSection);
    return match?.matched ? match.officialName : "";
  }, [studentName, storedName, selectedSection]);

  const validateAndResolve = () => {
    const trimmed = (studentName || "").trim();
    if (!trimmed) return null;

    const isTester = Boolean(showCodeField && accessCode === "00000" && isMrCastro(trimmed));
    let finalStudentName = trimmed;

    if (!isTester) {
      const match = matchStudentToRoster(trimmed, selectedSection);
      if (match?.matched && match.officialName) {
        finalStudentName = match.officialName;
      }
    }

    return {
      isValid: true,
      finalStudentName,
      isTester,
    };
  };

  return {
    rosterOptions,
    resolvedOfficialName,
    validateAndResolve,
  };
}
