// src/hooks/useAppTheme.js
import { useState, useEffect, useCallback } from "react";
import { THEME_CONFIG } from "../utils/themeStyles";

const STORAGE_KEY = "math_app_theme";
const VALID_THEMES = ["default", "sepia", "contrast"];

export function useAppTheme() {
  const [theme, setTheme] = useState("default");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && VALID_THEMES.includes(saved)) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "default");
      }
    } catch (e) {}
    setIsReady(true);
  }, []);

  const changeTheme = (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
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
    isReady,
    changeTheme,
    getThemeClasses,
  };
}
