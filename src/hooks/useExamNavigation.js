import { useState, useEffect, useCallback } from "react";

export function useExamNavigation(questions, appText, student) {
  const getStorageKey = (keyName) =>
    `exam_${keyName}_${student?.uid || "anon"}`;

  const [studentAnswers, setStudentAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [skipsUsed, setSkipsUsed] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [demerits, setDemerits] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasLoadedBackup, setHasLoadedBackup] = useState(false);

  // 1. LOAD BACKUP: Only triggers after student logs in
  useEffect(() => {
    if (typeof window !== "undefined" && student?.uid && !hasLoadedBackup) {
      const savedAnswers = window.localStorage.getItem(
        getStorageKey("answers"),
      );
      if (savedAnswers) setStudentAnswers(JSON.parse(savedAnswers));

      const savedIndex = window.localStorage.getItem(getStorageKey("index"));
      if (savedIndex) setCurrentQuestionIndex(parseInt(savedIndex, 10));

      const savedSkips = window.localStorage.getItem(getStorageKey("skips"));
      if (savedSkips) setSkipsUsed(parseInt(savedSkips, 10));

      setHasLoadedBackup(true);
    }
  }, [student?.uid, hasLoadedBackup]);

  // 2. SAVE BACKUP: Constantly backs up their progress
  useEffect(() => {
    if (typeof window !== "undefined" && student?.uid && hasLoadedBackup) {
      window.localStorage.setItem(
        getStorageKey("answers"),
        JSON.stringify(studentAnswers),
      );
      window.localStorage.setItem(
        getStorageKey("index"),
        currentQuestionIndex.toString(),
      );
      window.localStorage.setItem(getStorageKey("skips"), skipsUsed.toString());
    }
  }, [
    studentAnswers,
    currentQuestionIndex,
    skipsUsed,
    student?.uid,
    hasLoadedBackup,
  ]);

  const currentQ = questions[currentQuestionIndex] || null;
  const questionsAttempted = currentQuestionIndex;
  const showEndExamButton = currentQuestionIndex >= questions.length;

  const handlePadClick = (val) => {
    setCurrentInput((prev) => {
      if (prev.length >= 15) return prev;
      return prev + val;
    });
  };

  const handleBackspace = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setCurrentInput("");
  };

  const moveToNextQuestion = () => {
    setCurrentInput("");
    setCurrentQuestionIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleSubmitQuestion = useCallback(() => {
    if (!currentInput.trim() || isTransitioning) return;
    setIsTransitioning(true);

    const cleanInput = currentInput.replace(/,/g, "").trim();
    const cleanCorrect = String(currentQ?.correctAnswer || "")
      .replace(/,/g, "")
      .trim();

    const isCorrect = cleanInput === cleanCorrect;

    const answerRecord = {
      question: currentQ,
      studentInput: currentInput,
      correctAnswer: currentQ?.correctAnswer,
      isCorrect,
    };

    setStudentAnswers((prev) => [...prev, answerRecord]);
    moveToNextQuestion();
  }, [currentInput, currentQ, isTransitioning]);

  const handlePassQuestion = useCallback(() => {
    if (isTransitioning) return;
    if (skipsUsed >= 2) {
      alert("You have already skipped. You must attempt this one.");
      return;
    }

    setIsTransitioning(true);
    setSkipsUsed((prev) => prev + 1);

    const answerRecord = {
      question: currentQ,
      studentInput: "Skipped",
      correctAnswer: currentQ?.correctAnswer,
      isCorrect: false,
    };

    setStudentAnswers((prev) => [...prev, answerRecord]);
    moveToNextQuestion();
  }, [skipsUsed, currentQ, isTransitioning]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const key = e.key;

      if (/^[0-9,.]$/.test(key)) {
        e.preventDefault();
        handlePadClick(key);
      } else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (key === "Enter") {
        e.preventDefault();
        handleSubmitQuestion();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmitQuestion]);

  const resetExamFlow = () => {
    setStudentAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentInput("");
    setDemerits(0);
    setSkipsUsed(0);
    setHasLoadedBackup(false);

    if (typeof window !== "undefined" && student?.uid) {
      window.localStorage.removeItem(getStorageKey("answers"));
      window.localStorage.removeItem(getStorageKey("index"));
      window.localStorage.removeItem(getStorageKey("skips"));
    }
  };

  return {
    currentQ,
    questionsAttempted,
    currentInput,
    handlePadClick,
    handleBackspace,
    handleClear,
    handleSubmitQuestion,
    handlePassQuestion,
    studentAnswers,
    demerits,
    setDemerits,
    showEndExamButton,
    resetExamFlow,
  };
}
