"use client";

import { useEffect } from "react";

export function useLockEnforcement({ mounted, view, isTesterMode, stateRef }) {
  useEffect(() => {
    if (!mounted || view !== "exam") return;
    if (isTesterMode) return;

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
      document.removeEventListener("fullscreenchange", enforceLock);
      document.removeEventListener("webkitfullscreenchange", enforceLock);
      document.removeEventListener("visibilitychange", enforceLock);
    };
  }, [mounted, view, isTesterMode, stateRef]);
}
