// src/hooks/useExamLocalStorage.js
import { useState, useEffect, useCallback } from "react";

export function useExamLocalStorage(studentUid) {
  const getStorageKey = useCallback(
    (keyName) => `exam_${keyName}_${studentUid || "anon"}`,
    [studentUid],
  );

  const [studentAnswers, setStudentAnswers] = useState(() => {
    if (typeof window !== "undefined" && studentUid) {
      try {
        const saved = window.localStorage.getItem(`exam_answers_${studentUid}`);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return [];
  });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    if (typeof window !== "undefined" && studentUid) {
      const saved = window.localStorage.getItem(`exam_index_${studentUid}`);
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  const [skipsUsed, setSkipsUsed] = useState(() => {
    if (typeof window !== "undefined" && studentUid) {
      const saved = window.localStorage.getItem(`exam_skips_${studentUid}`);
      if (saved) return parseInt(saved, 10);
    }
    return 0;
  });

  useEffect(() => {
    if (typeof window !== "undefined" && studentUid) {
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
    studentUid,
    getStorageKey,
  ]);

  const clearStorage = () => {
    if (typeof window !== "undefined" && studentUid) {
      window.localStorage.removeItem(getStorageKey("answers"));
      window.localStorage.removeItem(getStorageKey("index"));
      window.localStorage.removeItem(getStorageKey("skips"));
    }
  };

  return {
    studentAnswers,
    setStudentAnswers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    skipsUsed,
    setSkipsUsed,
    clearStorage,
  };
}
