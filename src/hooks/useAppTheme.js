// src/hooks/useAppTheme.js
import { useState, useEffect, useCallback } from "react";
import { THEME_CONFIG } from "../utils/themeStyles";

const STORAGE_KEY = "math_app_theme";

export function useAppTheme() {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (
        saved &&
        (saved === "default" || saved === "sepia" || saved === "contrast")
      ) {
        setTheme(saved);
      }
    } catch (e) {}
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (e) {}
  };

  const getThemeClasses = useCallback(() => {
    const globalStyles = THEME_CONFIG?.global || {};
    const variantStyles =
      THEME_CONFIG?.variants?.[theme] || THEME_CONFIG?.variants?.default || {};

    return {
      ...globalStyles,
      ...variantStyles,
    };
  }, [theme]);

  return {
    theme,
    changeTheme,
    getThemeClasses,
  };
}
