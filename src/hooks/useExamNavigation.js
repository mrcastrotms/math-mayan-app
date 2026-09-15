import { useState } from "react";

export function useExamNavigation(examQuestions = [], appText = {}) {
  const [questionsAttempted, setQuestionsAttempted] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [studentAnswers, setStudentAnswers] = useState([]);
  const [demerits, setDemerits] = useState([]);
  const [lastHarderTriggerIndex, setLastHarderTriggerIndex] = useState(-99);
  const [overrideQuestion, setOverrideQuestion] = useState(null);

  const auditCopy = appText.audit || {
    mastered: "Mastered",
    skipped: "Skipped",
  };
  const activeCopy = appText.active || { loadingText: "Loading..." };

  const getConsecutiveCorrect = () => {
    let count = 0;
    for (let i = studentAnswers.length - 1; i >= 0; i--) {
      if (studentAnswers[i].isCorrect) count++;
      else break;
    }
    return count;
  };

  const consecutiveCorrect = getConsecutiveCorrect();
  const canTriggerHarder =
    consecutiveCorrect >= 5 &&
    questionsAttempted - lastHarderTriggerIndex >= 5 &&
    !overrideQuestion;

  const getCurrentQuestion = () => {
    if (overrideQuestion) return overrideQuestion;
    if (!examQuestions || examQuestions.length === 0) {
      return {
        question: activeCopy.loadingText,
        instruction: "",
        correctAnswer: "",
      };
    }
    return examQuestions[questionsAttempted % examQuestions.length];
  };

  const handleSubmitQuestion = (resetTimerCallback) => {
    const currentQ = getCurrentQuestion();
    const isCorrect = currentInput === currentQ.correctAnswer;

    setStudentAnswers([
      ...studentAnswers,
      {
        questionNumber: questionsAttempted + 1,
        question: currentQ.question,
        instruction: currentQ.instruction || "",
        studentInput: currentInput,
        correctAnswer: currentQ.correctAnswer,
        isCorrect,
        observation: isCorrect ? auditCopy.mastered : currentQ.observation,
      },
    ]);
    setCurrentInput("");
    setOverrideQuestion(null);
    setQuestionsAttempted((p) => p + 1);
    resetTimerCallback();
  };

  const handlePassQuestion = (resetTimerCallback) => {
    const currentQ = getCurrentQuestion();
    setStudentAnswers([
      ...studentAnswers,
      {
        questionNumber: questionsAttempted + 1,
        question: currentQ.question,
        instruction: currentQ.instruction || "",
        studentInput: "Skipped",
        correctAnswer: currentQ.correctAnswer,
        isCorrect: false,
        observation: auditCopy.skipped,
      },
    ]);
    setCurrentInput("");
    setOverrideQuestion(null);
    setQuestionsAttempted((p) => p + 1);
    resetTimerCallback();
  };

  const handleTryHarder = (resetTimerCallback) => {
    if (!examQuestions || examQuestions.length === 0) return;
    const hardQuestions = examQuestions.filter((q) => q.difficulty === "hard");
    if (hardQuestions.length === 0) return;
    const randomHard =
      hardQuestions[Math.floor(Math.random() * hardQuestions.length)];

    setOverrideQuestion(randomHard);
    setLastHarderTriggerIndex(questionsAttempted);
    resetTimerCallback();
  };

  const handleSimulateCorrect = (resetTimerCallback) => {
    const currentQ = getCurrentQuestion();
    setStudentAnswers([
      ...studentAnswers,
      {
        questionNumber: questionsAttempted + 1,
        question: currentQ.question,
        instruction: currentQ.instruction || "",
        studentInput: currentQ.correctAnswer,
        correctAnswer: currentQ.correctAnswer,
        isCorrect: true,
        observation: auditCopy.mastered,
      },
    ]);
    setCurrentInput("");
    setOverrideQuestion(null);
    setQuestionsAttempted((p) => p + 1);
    resetTimerCallback();
  };

  const resetExamFlow = () => {
    setStudentAnswers([]);
    setDemerits([]);
    setQuestionsAttempted(0);
    setLastHarderTriggerIndex(-99);
    setOverrideQuestion(null);
    setCurrentInput("");
  };

  return {
    questionsAttempted,
    currentInput,
    setCurrentInput,
    studentAnswers,
    demerits,
    setDemerits,
    canTriggerHarder,
    getCurrentQuestion,
    handleSubmitQuestion,
    handlePassQuestion,
    handleTryHarder,
    handleSimulateCorrect,
    resetExamFlow,
  };
}
