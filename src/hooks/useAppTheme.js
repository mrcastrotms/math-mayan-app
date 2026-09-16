"use client";
import { useState, useEffect } from "react";
import { THEME_CONFIG } from "../utils/themeStyles";

export function useAppTheme() {
  const [theme, setTheme] = useState("default");

  useEffect(() => {
    const saved = localStorage.getItem("math_app_theme") || "default";
    setTheme(saved);
  }, []);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("math_app_theme", newTheme);
  };

  const getThemeClasses = () => {
    return {
      ...THEME_CONFIG.global,
      ...(THEME_CONFIG.variants[theme] || THEME_CONFIG.variants.default),
    };
  };

  return { theme, changeTheme, getThemeClasses };
}
