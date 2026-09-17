// src/hooks/useViewPersistence.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "exam_active_view";

export function useViewPersistence(initialFallback = "start") {
  const [view, setView] = useState(initialFallback);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const params = new URLSearchParams(window.location.search);
      const savedView =
        params.get("view") ||
        sessionStorage.getItem(STORAGE_KEY) ||
        initialFallback;

      if (savedView !== initialFallback) {
        setView(savedView);
      }
    } catch {}
  }, [initialFallback]);

  const navigateTo = useCallback((viewName) => {
    setView(viewName);
    if (typeof window === "undefined") return;

    try {
      sessionStorage.setItem(STORAGE_KEY, viewName);
      const url = new URL(window.location.href);
      if (viewName === "start") {
        url.searchParams.delete("view");
      } else {
        url.searchParams.set("view", viewName);
      }
      window.history.replaceState({}, "", url.toString());
    } catch {}
  }, []);

  return { view, navigateTo, isMounted };
}
