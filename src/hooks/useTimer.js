import { useState, useEffect, useRef } from "react";

export function useTimer(
  examStarted,
  examFinished,
  isLocked,
  examDuration,
  handleFinishExam,
) {
  const [timeLeft, setTimeLeft] = useState(examDuration);
  const [secondsOnCurrentQuestion, setSecondsOnCurrentQuestion] = useState(0);

  // We use a ref so the interval always has the latest submit function
  // without triggering infinite re-renders.
  const submitExamRef = useRef(handleFinishExam);
  useEffect(() => {
    submitExamRef.current = handleFinishExam;
  }, [handleFinishExam]);

  useEffect(() => {
    let interval = null;

    if (examStarted && !examFinished && !isLocked) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          // THE FIX: If the timer hits zero, stop the clock and FORCE SUBMIT!
          if (prev <= 1) {
            clearInterval(interval);
            submitExamRef.current();
            return 0;
          }
          return prev - 1;
        });
        setSecondsOnCurrentQuestion((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [examStarted, examFinished, isLocked]);

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
