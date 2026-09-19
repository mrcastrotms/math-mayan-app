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
      // Immediately start the exam and set query param without blocking the transition
      state?.setExamStarted?.(true);
      if (!window.location.search.includes("bypass=true")) {
        router.replace("/?bypass=true");
      }
    } else {
      state?.setExamStarted?.(true);
    }
  } else {
    state?.handleVerifyAndStart?.(code, section);
  }
}
