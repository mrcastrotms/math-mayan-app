// src/hooks/useCachedSections.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "math_app_sections";
const DEFAULT_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export function useCachedSections(availableSections = []) {
  const [cachedSections, setCachedSections] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  useEffect(() => {
    if (availableSections?.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(availableSections));
      if (!cachedSections) setCachedSections(availableSections);
    }
  }, [availableSections, cachedSections]);

  const displaySections =
    cachedSections || availableSections || DEFAULT_SECTIONS;
  const isLoading =
    !cachedSections && (!availableSections || availableSections.length === 0);

  return { displaySections, isLoading };
}
