// src/hooks/useViewPersistence.js
import { useState, useEffect } from "react";

export function useViewPersistence(initialFallback = "start") {
  const [view, setView] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("view") ||
        sessionStorage.getItem("exam_active_view") ||
        initialFallback
      );
    }
    return initialFallback;
  });

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

  return { view, navigateTo };
}
