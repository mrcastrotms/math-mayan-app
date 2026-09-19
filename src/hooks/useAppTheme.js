// src/hooks/useAppTheme.js
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { THEME_CONFIG } from "../utils/themeStyles";

const STORAGE_KEY = "math_app_theme";
const VALID_THEMES = ["default", "sepia", "contrast"];

const subscribeClientReady = (onStoreChange) => {
  const timer = setTimeout(onStoreChange, 0);
  return () => clearTimeout(timer);
};

export function useAppTheme() {
  const storedTheme = useSyncExternalStore(
    subscribeClientReady,
    () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && VALID_THEMES.includes(saved) ? saved : "default";
    } catch (e) {
      return "default";
    }
    },
    () => "default",
  );
  const [selectedTheme, setSelectedTheme] = useState(null);
  const theme = selectedTheme || storedTheme;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    if (!VALID_THEMES.includes(newTheme)) return;
    setSelectedTheme(newTheme);
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
    isReady: true,
    changeTheme,
    getThemeClasses,
  };
}
