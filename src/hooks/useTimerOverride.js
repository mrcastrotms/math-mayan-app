import { useState } from "react";

export function useTimerOverride(timeLeft, handleNinjaOneMinute) {
  const [overrideTimeLeft, setOverrideTimeLeft] = useState(null);
  const [showTimerModal, setShowTimerModal] = useState(false);

  const handleTimerDoubleClick = () => setShowTimerModal(true);

  const handleTimerPinSubmit = (pin) => {
    if (pin === "2026") {
      setOverrideTimeLeft(60);
      handleNinjaOneMinute?.();
      setShowTimerModal(false);
    } else {
      alert("Invalid Teacher PIN");
    }
  };

  const effectiveTimeLeft = overrideTimeLeft ?? timeLeft ?? 2400;

  return {
    showTimerModal,
    setShowTimerModal,
    handleTimerDoubleClick,
    handleTimerPinSubmit,
    effectiveTimeLeft,
    resetTimerOverride: () => setOverrideTimeLeft(null),
  };
}
