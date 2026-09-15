import { useState, useEffect } from "react";

export function useTimer(
  examStarted,
  examFinished,
  isLocked,
  initialDuration,
  onTimeUp,
) {
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [secondsOnCurrentQuestion, setSecondsOnCurrentQuestion] = useState(0);

  useEffect(() => {
    let timer;
    if (examStarted && !examFinished && !isLocked && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((p) => p - 1);
        setSecondsOnCurrentQuestion((p) => p + 1);
      }, 1000);
    } else if (timeLeft === 0 && !examFinished) {
      onTimeUp();
    }
    return () => clearInterval(timer);
  }, [examStarted, examFinished, isLocked, timeLeft]);

  const resetQuestionTimer = () => setSecondsOnCurrentQuestion(0);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return {
    timeLeft,
    setTimeLeft,
    secondsOnCurrentQuestion,
    resetQuestionTimer,
    formatTime,
  };
}
