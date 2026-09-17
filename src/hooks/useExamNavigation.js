// src/hooks/useExamNavigation.js
import { useState, useCallback, useEffect } from "react";
import { useExamLocalStorage } from "./useExamLocalStorage";

/* =========================================================================
   1. ANSWER RECORD HELPERS
   ========================================================================= */

function cleanAnswerString(val) {
  return String(val ?? "")
    .replace(/,/g, "")
    .trim();
}

function createAnswerRecord(currentQ, input, isSkipped = false) {
  if (isSkipped) {
    return {
      question: currentQ,
      studentInput: "Skipped",
      correctAnswer: currentQ?.correctAnswer,
      isCorrect: false,
    };
  }

  const cleanInput = cleanAnswerString(input);
  const cleanCorrect = cleanAnswerString(currentQ?.correctAnswer);

  return {
    question: currentQ,
    studentInput: input,
    correctAnswer: currentQ?.correctAnswer,
    isCorrect: cleanInput === cleanCorrect,
  };
}

/* =========================================================================
   2. KEYBOARD LISTENER HOOK
   ========================================================================= */

function useExamKeyboard({ onInput, onBackspace, onSubmit }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      if (/^[0-9,.]$/.test(e.key)) {
        e.preventDefault();
        onInput(e.key);
      } else if (e.key === "Backspace") {
        e.preventDefault();
        onBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onInput, onBackspace, onSubmit]);
}

/* =========================================================================
   3. PRIMARY NAVIGATION HOOK
   ========================================================================= */

export function useExamNavigation(questions = [], appText, student) {
  const {
    studentAnswers,
    setStudentAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    skipsUsed,
    setSkipsUsed,
    clearStorage,
  } = useExamLocalStorage(student?.uid);

  const [currentInput, setCurrentInput] = useState("");
  const [demerits, setDemerits] = useState(0);

  const currentQ = questions[currentQuestionIndex] || null;
  const questionsAttempted = currentQuestionIndex;
  const showEndExamButton = currentQuestionIndex >= questions.length;

  const handlePadClick = useCallback((val) => {
    setCurrentInput((prev) => (prev.length >= 15 ? prev : prev + val));
  }, []);

  const handleBackspace = useCallback(
    () => setCurrentInput((prev) => prev.slice(0, -1)),
    [],
  );
  const handleClear = useCallback(() => setCurrentInput(""), []);

  const moveToNextQuestion = () => {
    setCurrentInput("");
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleSubmitQuestion = useCallback(() => {
    if (!currentInput.trim()) return;
    setStudentAnswers((prev) => [
      ...prev,
      createAnswerRecord(currentQ, currentInput),
    ]);
    moveToNextQuestion();
  }, [currentInput, currentQ, setStudentAnswers]);

  const handlePassQuestion = useCallback(() => {
    if (skipsUsed >= 2) {
      alert("You have already skipped. You must attempt this one.");
      return;
    }
    setSkipsUsed((prev) => prev + 1);
    setStudentAnswers((prev) => [
      ...prev,
      createAnswerRecord(currentQ, null, true),
    ]);
    moveToNextQuestion();
  }, [skipsUsed, currentQ, setSkipsUsed, setStudentAnswers]);

  useExamKeyboard({
    onInput: handlePadClick,
    onBackspace: handleBackspace,
    onSubmit: handleSubmitQuestion,
  });

  const resetExamFlow = () => {
    setStudentAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentInput("");
    setDemerits(0);
    setSkipsUsed(0);
    clearStorage();
  };

  return {
    currentQ,
    currentQuestionIndex,
    setCurrentQuestionIndex,
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
