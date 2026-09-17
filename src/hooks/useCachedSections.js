// src/hooks/useCachedSections.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "math_app_sections";
const FALLBACK_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export function useCachedSections(availableSections = []) {
  // 1. Synchronously grab cached list on mount
  const [cachedSections, setCachedSections] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // 2. Persist live incoming sections to localStorage when available
  useEffect(() => {
    if (typeof window !== "undefined" && availableSections?.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(availableSections));
    }
  }, [availableSections]);

  // 3. Derive display list purely during render (No setState in effect)
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
