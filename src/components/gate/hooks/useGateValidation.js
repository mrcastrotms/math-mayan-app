"use client";

import { useMemo } from "react";

export function useGateValidation({
  studentName,
  storedName,
  selectedSection,
  accessCode,
  showCodeField,
}) {
  const rosterOptions = useMemo(() => [], []);
  const resolvedOfficialName = storedName || "";

  const validateAndResolve = async () => {
    const trimmed = (studentName || "").trim();
    if (!trimmed) return null;
    const response = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: selectedSection, name: trimmed }),
    });
    if (!response.ok) throw new Error("Roster validation failed");
    const result = await response.json();
    return {
      isValid: Boolean(result.matched),
      finalStudentName: result.officialName || trimmed,
      isTester: false,
    };
  };

  return {
    rosterOptions,
    resolvedOfficialName,
    validateAndResolve,
  };
}
