// src/hooks/useCachedSections.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "math_app_sections";
const FALLBACK_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export function useCachedSections(availableSections = []) {
  const [cachedSections, setCachedSections] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined" && availableSections?.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(availableSections));
      } catch {}
    }
  }, [availableSections]);

  const displaySections =
    availableSections?.length > 0
      ? availableSections
      : cachedSections?.length > 0
        ? cachedSections
        : FALLBACK_SECTIONS;

  const isLoading = !availableSections?.length && !cachedSections?.length;

  return {
    displaySections,
    isLoading,
    setCachedSections,
  };
}
