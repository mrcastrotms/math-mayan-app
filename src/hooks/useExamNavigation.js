// src/hooks/useExamNavigation.js
import { useState, useCallback } from "react";
import { createAnswerRecord } from "../utils/navigationUtils";
import { useExamKeyboard } from "./useExamKeyboard";
import { useExamLocalStorage } from "./useExamLocalStorage";

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
  const [merits, setMerits] = useState(0);
  const [behaviorEvents, setBehaviorEvents] = useState([]);
  const addBehaviorEvent = useCallback((type, reason) => {
    const event = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      reason,
      timestamp: new Date().toISOString(),
    };
    setBehaviorEvents((prev) => [...prev, event]);
    if (type === "merit") setMerits((prev) => prev + 1);
    else setDemerits((prev) => prev + 1);
  }, []);
  const handleAddDemerit = useCallback(
    (reason = "Does not follow directions") =>
      addBehaviorEvent("demerit", reason),
    [addBehaviorEvent],
  );

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
    setMerits(0);
    setBehaviorEvents([]);
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
    merits,
    setMerits,
    behaviorEvents,
    addBehaviorEvent,
    handleAddDemerit,
    showEndExamButton,
    resetExamFlow,
  };
}
