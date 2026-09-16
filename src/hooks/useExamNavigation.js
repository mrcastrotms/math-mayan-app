import { useState, useEffect, useCallback } from "react";

export function useExamNavigation(questions, appText) {
  // 1. CRASH BACKUP: Load answers from browser memory if they closed the tab
  const [studentAnswers, setStudentAnswers] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("exam_backup_answers");
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  // Load their exact question number from browser memory
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("exam_backup_index");
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  // Load their skip count from browser memory
  const [skipsUsed, setSkipsUsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("exam_backup_skips");
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [currentInput, setCurrentInput] = useState("");
  const [demerits, setDemerits] = useState(0);

  // Continuously save their progress secretly in the background
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "exam_backup_answers",
        JSON.stringify(studentAnswers),
      );
      window.localStorage.setItem(
        "exam_backup_index",
        currentQuestionIndex.toString(),
      );
      window.localStorage.setItem("exam_backup_skips", skipsUsed.toString());
    }
  }, [studentAnswers, currentQuestionIndex, skipsUsed]);

  const currentQ = questions[currentQuestionIndex] || null;
  const questionsAttempted = currentQuestionIndex;

  // Only show the Finish button if they have answered every single question
  const showEndExamButton = currentQuestionIndex >= questions.length;

  const handlePadClick = (val) => {
    setCurrentInput((prev) => prev + val);
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
  };

  // 2. COMMA FORGIVENESS & SUBMIT
  const handleSubmitQuestion = useCallback(() => {
    if (!currentInput.trim()) return;

    // Strip commas from both the student's input and the database answer before comparing
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
  }, [currentInput, currentQ]);

  // 3. THE 2-SKIP LIMIT
  const handlePassQuestion = useCallback(() => {
    if (skipsUsed >= 2) {
      alert(
        "Out of Skips! You have already skipped 2 questions. You must attempt this one.",
      );
      return;
    }

    setSkipsUsed((prev) => prev + 1);

    const answerRecord = {
      question: currentQ,
      studentInput: "Skipped",
      correctAnswer: currentQ?.correctAnswer,
      isCorrect: false,
    };

    setStudentAnswers((prev) => [...prev, answerRecord]);
    moveToNextQuestion();
  }, [skipsUsed, currentQ]);

  // 4. CHROMEBOOK PHYSICAL KEYBOARD SUPPORT
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Do not interfere if they are typing in a real text box (like the teacher PIN override)
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      const key = e.key;

      // Only allow numbers, commas, and decimals. Blocks letters entirely.
      if (/^[0-9,.]$/.test(key)) {
        e.preventDefault();
        handlePadClick(key);
      }
      // Bind physical Backspace key
      else if (key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      }
      // Bind physical Enter key to submit the question instantly
      else if (key === "Enter") {
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
    // Wipe the backup memory so the next student starts fresh
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("exam_backup_answers");
      window.localStorage.removeItem("exam_backup_index");
      window.localStorage.removeItem("exam_backup_skips");
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
