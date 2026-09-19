// src/hooks/useViewPersistence.js
import { useState, useSyncExternalStore } from "react";

const subscribeClientReady = (onStoreChange) => {
  const timer = setTimeout(onStoreChange, 0);
  return () => clearTimeout(timer);
};

export function useViewPersistence(initialFallback = "start") {
  const persistedView = useSyncExternalStore(
    subscribeClientReady,
    () => {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get("view") ||
        sessionStorage.getItem("exam_active_view") ||
        initialFallback
      );
    },
    () => initialFallback,
  );
  const [requestedView, setRequestedView] = useState(null);
  const view = requestedView || persistedView;

  const navigateTo = (viewName) => {
    setRequestedView(viewName);
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

  return { view, navigateTo, isMounted: true };
}
