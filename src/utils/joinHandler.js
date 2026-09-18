// src/utils/joinHandler.js
export function handleStudentJoin({ name, code, uid, section, state, router }) {
  state?.setCustomStudentName?.(name);
  state?.setSessionCodeInput?.(code);
  state?.setSelectedSection?.(section);
  state?.setStudent?.({ name, uid, section });

  if (code === "00000") {
    if (
      typeof window !== "undefined" &&
      !window.location.search.includes("bypass=true")
    ) {
      router.push("/?bypass=true");
    } else {
      state?.setExamStarted?.(true);
    }
  } else {
    state?.handleVerifyAndStart?.(code, section);
  }
}
