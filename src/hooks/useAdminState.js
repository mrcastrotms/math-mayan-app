"use client";
import { useState } from "react";

export function useAdminState() {
  const [isAdminMode, setIsAdminModeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("math_mayan_teacher") === "true";
    }
    return false;
  });

  const setIsAdminMode = (value) => {
    setIsAdminModeState(value);
    if (typeof window !== "undefined") {
      if (value) {
        localStorage.setItem("math_mayan_teacher", "true");
      } else {
        localStorage.removeItem("math_mayan_teacher");
      }
    }
  };

  return { isAdminMode, setIsAdminMode };
}
