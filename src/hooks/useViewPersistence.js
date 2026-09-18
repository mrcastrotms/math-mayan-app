// src/hooks/useViewPersistence.js
import { useState, useEffect } from "react";

export function useViewPersistence(initialFallback = "start") {
  const [view, setView] = useState(initialFallback);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const params = new URLSearchParams(window.location.search);
    const savedView =
      params.get("view") ||
      sessionStorage.getItem("exam_active_view") ||
      initialFallback;

    if (savedView !== initialFallback) {
      setView(savedView);
    }
  }, [initialFallback]);

  const navigateTo = (viewName) => {
    setView(viewName);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("exam_active_view", viewName);
      const url = new URL(window.location.href);
      if (viewName === "start") {
        url.searchParams.delete("view");
      } else {
        url.searchParams.set("view", viewName);
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  return { view, navigateTo, isMounted };
}
