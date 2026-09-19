import { useState } from "react";

export function useTimerOverride(timeLeft, handleNinjaOneMinute) {
  const [showTimerModal, setShowTimerModal] = useState(false);

  const handleTimerDoubleClick = () => setShowTimerModal(true);

  const handleTimerPinSubmit = (pin) => {
    if (pin === "2026") {
      if (handleNinjaOneMinute) handleNinjaOneMinute();
      setShowTimerModal(false);
    } else {
      alert("Invalid Teacher PIN");
    }
  };

  const effectiveTimeLeft = timeLeft ?? 2400;

  return {
    showTimerModal,
    setShowTimerModal,
    handleTimerDoubleClick,
    handleTimerPinSubmit,
    effectiveTimeLeft,
  };
}
