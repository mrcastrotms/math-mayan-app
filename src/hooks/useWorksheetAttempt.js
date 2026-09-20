import { useEffect, useRef, useState } from "react";
import {
  loadWorksheetAttempt,
  saveWorksheetAttempt,
  saveWorksheetGrade,
} from "../services/worksheetService";
import { isWorksheetClosed, scoreWorksheet } from "../utils/worksheetUtils.mjs";

export function useWorksheetAttempt(worksheet, student) {
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [hintsUsed, setHintsUsed] = useState(0);
  const saveTimer = useRef(null);

  useEffect(() => {
    let active = true;
    if (!worksheet?.id || !student?.uid) return undefined;
    loadWorksheetAttempt(worksheet.id, student.uid)
      .then((attempt) => {
        if (!active) return;
        setAnswers(attempt?.answers || {});
        setHintsUsed(attempt?.hintsUsed || 0);
        setStatus(attempt?.status === "submitted" ? "submitted" : "ready");
      })
      .catch(() => {
        if (active) {
          setError("Unable to load your saved progress.");
          setStatus("ready");
        }
      });
    return () => { active = false; };
  }, [worksheet?.id, student?.uid]);

  const saveProgress = (nextAnswers) => {
    if (!worksheet?.id || !student?.uid || isWorksheetClosed(worksheet.dueDate)) return;
    setAnswers(nextAnswers);
    setStatus("saving");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveWorksheetAttempt(worksheet.id, student.uid, {
        section: student.section,
        answers: nextAnswers,
        status: "in_progress",
      })
        .then(() => setStatus("saved"))
        .catch(() => {
          setError("Progress could not be saved. Check your connection.");
          setStatus("ready");
        });
    }, 350);
  };

  const submit = async () => {
    if (isWorksheetClosed(worksheet.dueDate)) {
      setError("This assignment is closed.");
      return false;
    }
    const result = scoreWorksheet(worksheet.questions, answers);
    setStatus("submitting");
    try {
      await saveWorksheetAttempt(worksheet.id, student.uid, {
        section: student.section,
        answers,
        score: result.score,
        status: "submitted",
        submittedAt: new Date(),
      });
      await saveWorksheetGrade({ student, worksheet, answers, result, hintsUsed });
      setStatus("submitted");
      return true;
    } catch {
      setError("Submission failed. Your saved progress is still available.");
      setStatus("ready");
      return false;
    }
  };

  const requestHint = async (question) => {
    if (hintsUsed >= 4 || !question) return "";
    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.prompt,
          scratchwork: answers[question.id] || "",
          previousHints: [],
          hintsUsed,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      const nextHints = hintsUsed + 1;
      setHintsUsed(nextHints);
      await saveWorksheetAttempt(worksheet.id, student.uid, {
        section: student.section,
        answers,
        hintsUsed: nextHints,
        maxHints: 4,
        status: "in_progress",
      });
      return data.hint || "";
    } catch (error) {
      setError("Hint unavailable right now.");
      return "";
    }
  };

  useEffect(() => {
    if (!worksheet?.dueDate || status === "submitted" || status === "submitting") return undefined;
    const remaining = new Date(worksheet.dueDate).getTime() - Date.now();
    const timer = setTimeout(() => {
      submit();
    }, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [worksheet?.dueDate, status]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  return {
    answers,
    saveProgress,
    submit,
    result: scoreWorksheet(worksheet?.questions, answers),
    status,
    error,
    hintsUsed,
    requestHint,
  };
}
