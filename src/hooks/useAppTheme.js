// src/hooks/useAppTheme.js
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { THEME_CONFIG } from "../utils/themeStyles";
import { normalizeTheme, VALID_THEMES } from "../utils/themeUtils.mjs";
import { subscribeToStudentTheme } from "../services/liveSyncService";

const STORAGE_KEY = "math_app_theme";
export function useAppTheme({ studentUid } = {}) {
  const storedTheme = useSyncExternalStore(
    () => () => {},
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
  const [themeOverride, setThemeOverride] = useState(null);
  const theme = selectedTheme || storedTheme;
  const effectiveTheme = normalizeTheme(themeOverride?.theme || theme);
  const themeLocked = Boolean(themeOverride?.locked);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, [effectiveTheme]);

  useEffect(() => {
    if (!studentUid) return undefined;
    return subscribeToStudentTheme(studentUid, setThemeOverride);
  }, [studentUid]);

  const changeTheme = (newTheme) => {
    if (themeLocked || !VALID_THEMES.includes(newTheme)) return;
    setSelectedTheme(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch (e) {}
  };

  const getThemeClasses = useCallback(() => {
    const globalStyles = THEME_CONFIG?.global || {};
    const variantStyles =
      THEME_CONFIG?.variants?.[effectiveTheme] ||
      THEME_CONFIG?.variants?.default ||
      {};

    return {
      ...globalStyles,
      ...variantStyles,
    };
  }, [effectiveTheme]);

  return {
    theme: effectiveTheme,
    themeLocked,
    enforcedTheme: themeOverride?.theme || null,
    isReady: true,
    changeTheme,
    getThemeClasses,
  };
}
