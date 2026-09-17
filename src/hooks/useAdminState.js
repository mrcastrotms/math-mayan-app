"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "math_mayan_teacher";

export function useAdminState() {
  const [isAdminMode, setIsAdminModeState] = useState(false);

  useEffect(() => {
    try {
      setIsAdminModeState(localStorage.getItem(STORAGE_KEY) === "true");
    } catch {}
  }, []);

  const setIsAdminMode = (value) => {
    setIsAdminModeState(value);
    try {
      if (value) {
        localStorage.setItem(STORAGE_KEY, "true");
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  return { isAdminMode, setIsAdminMode };
}
