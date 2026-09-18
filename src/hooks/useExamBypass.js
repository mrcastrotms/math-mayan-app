"use client";
import { useEffect } from "react";

export function useExamBypass(onJoinSuccess) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // only allow bypass on localhost or when explicitly enabled via env
    const allowed =
      window.location.hostname === "localhost" ||
      process.env.NEXT_PUBLIC_ENABLE_BYPASS === "true";
    if (!allowed) return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("bypass") === "true") {
      onJoinSuccess("Test Student", "00000", "test-uid-00000", "4A");
    }
  }, [onJoinSuccess]);
}
