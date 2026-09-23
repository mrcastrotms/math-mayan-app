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

  const resolvedOfficialName = useMemo(() => {
    const target = studentName || storedName;
    if (!target || sectionRoster.length === 0) return "";
    const match = matchStudentToRoster(target, sectionRoster);
    return match?.matched ? match.officialName : "";
  }, [studentName, storedName, sectionRoster]);

  const validateAndResolve = async () => {
    const trimmed = (studentName || storedName || "").trim();
    if (!trimmed) {
      window.alert("Please enter a name.");
      return null;
    }

    // Secret test bypass: code 00000 allows ANY name to pass as a dummy run
    const isTester = Boolean(showCodeField && accessCode === "00000");

    if (isTester) {
      return {
        isValid: true,
        finalStudentName: trimmed,
        isTester: true,
      };
    }

    // Normal student flow: enforce roster match
    if (sectionRoster.length === 0) {
      window.alert("Roster is still loading. Please wait a moment and try again.");
      return null;
    }

    const match = matchStudentToRoster(trimmed, sectionRoster);
    if (!match?.matched || !match.officialName) {
      window.alert("Name not found in this section's official roster. Please select your correct name.");
      return null;
    }

    return {
      isValid: true,
      finalStudentName: match.officialName,
      isTester: false,
    };
  };

  return {
    resolvedOfficialName,
    validateAndResolve,
    isLoadingRoster,
  };
}
