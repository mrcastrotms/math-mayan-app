import { useState, useEffect, useCallback } from "react";

export function useExamNavigation(questions, appText, student) {
  // Added student here

  // 1. SECURE BACKUP: Locked to the specific student's UID
  const getStorageKey = (keyName) =>
    `exam_${keyName}_${student?.uid || "anon"}`;

  const [studentAnswers, setStudentAnswers] = useState(() => {
    if (typeof window !== "undefined" && student?.uid) {
      const saved = window.localStorage.getItem(getStorageKey("answers"));
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (typeof window !== "undefined" && student?.uid) {
      const saved = window.localStorage.getItem(getStorageKey("index"));
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [skipsUsed, setSkipsUsed] = useState(() => {
    if (typeof window !== "undefined" && student?.uid) {
      const saved = window.localStorage.getItem(getStorageKey("skips"));
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [currentInput, setCurrentInput] = useState("");
  const [demerits, setDemerits] = useState(0);

  // Anti-Spam state for the Enter key
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Continuously save progress, locked to their unique ID
  useEffect(() => {
    if (typeof window !== "undefined" && student?.uid) {
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
  }, [studentAnswers, currentQuestionIndex, skipsUsed, student]);

  const currentQ = questions[currentQuestionIndex] || null;
  const questionsAttempted = currentQuestionIndex;
  const showEndExamButton = currentQuestionIndex >= questions.length;

  const handlePadClick = (val) => {
    // THE CRASH FIX: Hard cap at 15 characters
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
    // Lift the anti-spam lock after the next question renders
    setTimeout(() => setIsTransitioning(false), 100);
  };

  const handleSubmitQuestion = useCallback(() => {
    if (!currentInput.trim() || isTransitioning) return;
    setIsTransitioning(true); // Lock it to prevent double-mashing

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
      alert(
        "Out of Skips! You have already skipped 2 questions. You must attempt this one.",
      );
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

  // CHROMEBOOK PHYSICAL KEYBOARD SUPPORT
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

    // Clean up their specific backup memory
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
