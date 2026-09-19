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
    setError("Test bypass codes are disabled.");
    return true;
  }
  return false;
}
