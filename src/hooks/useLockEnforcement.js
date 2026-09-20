"use client";

import { useEffect } from "react";

export function useLockEnforcement({ mounted, view, isTesterMode, stateRef }) {
  useEffect(() => {
    if (!mounted || view !== "exam") return;
    if (isTesterMode) return;

    const previousOverflow = document.documentElement.style.overscrollBehaviorX;
    const previousBodyOverflow = document.body.style.overscrollBehaviorX;
    const historyMarker = `${window.location.pathname}${window.location.search}`;
    const handleBeforeUnload = (event) => {
      if (!stateRef.current?.examFinished) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const handlePopState = () => {
      window.history.pushState({ examGuard: true }, "", historyMarker);
      if (!stateRef.current?.isLocked) {
        stateRef.current?.setIsLocked?.(true);
        stateRef.current?.handleAddDemerit?.();
      }
    };
    document.documentElement.style.overscrollBehaviorX = "none";
    document.body.style.overscrollBehaviorX = "none";
    window.history.pushState({ examGuard: true }, "", historyMarker);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    const enforceLock = () => {
      if (!document.fullscreenElement || document.hidden) {
        if (!stateRef.current?.isLocked) {
          stateRef.current?.setIsLocked?.(true);
          if (typeof stateRef.current?.handleAddDemerit === "function") {
            stateRef.current.handleAddDemerit();
          } else if (typeof stateRef.current?.setDemerits === "function") {
            stateRef.current.setDemerits((prev) => (prev || 0) + 1);
          }
        }
      }
    };

    document.addEventListener("fullscreenchange", enforceLock);
    document.addEventListener("webkitfullscreenchange", enforceLock);
    document.addEventListener("visibilitychange", enforceLock);

    return () => {
      document.documentElement.style.overscrollBehaviorX = previousOverflow;
      document.body.style.overscrollBehaviorX = previousBodyOverflow;
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("fullscreenchange", enforceLock);
      document.removeEventListener("webkitfullscreenchange", enforceLock);
      document.removeEventListener("visibilitychange", enforceLock);
    };
  }, [mounted, view, isTesterMode, stateRef]);
}
