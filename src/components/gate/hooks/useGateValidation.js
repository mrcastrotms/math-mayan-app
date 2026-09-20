"use client";

import { useState, useEffect, useMemo } from "react";
import { matchStudentToRoster } from "../../../utils/rosterUtils";

export function useGateValidation({
  studentName,
  storedName,
  selectedSection,
  accessCode,
  showCodeField,
}) {
  const [sectionRoster, setSectionRoster] = useState([]);
  const [isLoadingRoster, setIsLoadingRoster] = useState(false);

  useEffect(() => {
    if (!selectedSection) return;
    let isCancelled = false;

    async function loadRoster() {
      setIsLoadingRoster(true);
      try {
        const res = await fetch(`/api/roster?section=${selectedSection}`);
        if (!res.ok) throw new Error("Roster fetch failed");
        const data = await res.json();
        if (!isCancelled) {
          setSectionRoster(data.students || []);
        }
      } catch (err) {
        console.error("Failed to load section roster:", err);
      } finally {
        if (!isCancelled) setIsLoadingRoster(false);
      }
    }

    loadRoster();
    return () => {
      isCancelled = true;
    };
  }, [selectedSection]);

  const isMrCastro = (name) => {
    const normalized = (name || "").trim().toLowerCase();
    return (
      normalized === "mr. castro" ||
      normalized === "mr castro" ||
      normalized === "césar castro" ||
      normalized === "cesar castro"
    );
  };

  const resolvedOfficialName = useMemo(() => {
    const target = studentName || storedName;
    if (!target || sectionRoster.length === 0) return "";
    const match = matchStudentToRoster(target, sectionRoster);
    return match?.matched ? match.officialName : "";
  }, [studentName, storedName, sectionRoster]);

  const validateAndResolve = async () => {
    const trimmed = (studentName || "").trim();
    if (!trimmed) return null;

    const isTester = Boolean(
      showCodeField && accessCode === "00000" && isMrCastro(trimmed),
    );

    let finalStudentName = trimmed;
    if (!isTester && sectionRoster.length > 0) {
      const match = matchStudentToRoster(trimmed, sectionRoster);
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
    resolvedOfficialName,
    validateAndResolve,
    isLoadingRoster,
  };
}
