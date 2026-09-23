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
      return {
        isValid: false,
        title: "Name Required",
        error: "Please write your name to get started.",
      };
    }

    // Secret test bypass: code 00000 allows ANY name for dummy run
    const isTester = Boolean(showCodeField && accessCode === "00000");

    if (isTester) {
      return {
        isValid: true,
        finalStudentName: trimmed,
        isTester: true,
      };
    }

    // Normal student flow: roster match validation
    if (sectionRoster.length === 0) {
      return {
        isValid: false,
        title: "Loading Roster",
        error:
          "The roster is still loading. Please wait a moment and try again.",
      };
    }

    const match = matchStudentToRoster(trimmed, sectionRoster);
    if (!match?.matched || !match.officialName) {
      return {
        isValid: false,
        title: "Name Not Found",
        error: "Please write your name correctly",
      };
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
