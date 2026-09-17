// src/utils/bypassUtils.js
"use client";
import { useEffect } from "react";

export function useExamBypass(onJoinSuccess) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("bypass") === "true") {
        onJoinSuccess("Test Student", "00000", "test-uid-00000", "4A");
      }
    }
  }, [onJoinSuccess]);
}

export function handleMasterBypass({
  cleanCode,
  name,
  selectedSection,
  availableSections,
  onJoinSuccess,
  setError,
}) {
  if (cleanCode === "00000") {
    if (!name.trim()) {
      setError("Please type your name.");
      return true;
    }
    const chosenSec = selectedSection || availableSections[0] || "4A";
    onJoinSuccess(name.trim(), "00000", "test-uid-00000", chosenSec);
    return true;
  }
  return false;
}
