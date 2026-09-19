import { useState } from "react";
import { verifyTeacherPin } from "../utils/teacherAuth";

export function useTimerOverride(timeLeft, handleNinjaOneMinute) {
  const [showTimerModal, setShowTimerModal] = useState(false);

  const handleTimerDoubleClick = () => setShowTimerModal(true);

  const handleTimerPinSubmit = async (pin) => {
    if (await verifyTeacherPin(pin)) {
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
