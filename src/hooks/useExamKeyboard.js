// src/hooks/useExamKeyboard.js
import { useEffect } from "react";

export function useExamKeyboard({ onInput, onBackspace, onSubmit }) {
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
