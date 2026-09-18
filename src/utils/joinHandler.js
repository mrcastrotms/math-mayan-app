// src/utils/joinHandler.js
export function handleStudentJoin({ name, code, uid, section, state, router }) {
  state?.setCustomStudentName?.(name);
  state?.setSessionCodeInput?.(code);
  state?.setSelectedSection?.(section);
  state?.setStudent?.({ name, uid, section });

  if (code === "00000") {
    const allowed =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        process.env.NEXT_PUBLIC_ENABLE_BYPASS === "true");

    if (allowed) {
      if (!window.location.search.includes("bypass=true")) {
        router.push("/?bypass=true");
      } else {
        state?.setExamStarted?.(true);
      }
    } else {
      // In production, start exam without setting bypass query
      state?.setExamStarted?.(true);
    }
  } else {
    state?.handleVerifyAndStart?.(code, section);
  }
}
