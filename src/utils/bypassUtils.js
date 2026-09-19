// src/utils/bypassUtils.js
export function handleMasterBypass({
  cleanCode,
  name,
  selectedSection,
  availableSections,
  onJoinSuccess,
  setError,
}) {
  if (cleanCode === "00000") {
    if (!name.trim()) {
      setError("Please type your name.");
      return true;
    }

    // only allow bypass on localhost or when explicitly enabled via env
    const allowed =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        process.env.NEXT_PUBLIC_ENABLE_BYPASS === "true");

    if (!allowed) {
      setError("Bypass is disabled in this environment.");
      return true;
    }

    const chosenSec = selectedSection || availableSections[0] || "4A";
    onJoinSuccess(name.trim(), "00000", "test-uid-00000", chosenSec);
    return true;
  }
  return false;
}
