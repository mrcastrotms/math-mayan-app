"use client";

import React from "react";

export default function ExamHeaderControls({
  theme,
  activeThemeState,
  current,
  onHardReset,
  isFullscreen,
  toggleFullscreen,
  onOpenDashboard,
}) {
  const currentSelectValue = theme === "default" ? "standard" : theme;

  const handleThemeChange = (e) => {
    const val = e.target.value;
    const targetTheme = val === "standard" ? "default" : val;
    activeThemeState.changeTheme(targetTheme);
  };

  return (
    <div style={{ position: "absolute", top: "16px", right: "24px", left: "24px", maxWidth: "520px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <select
          aria-label="Choose theme"
          value={currentSelectValue}
          onChange={handleThemeChange}
          disabled={activeThemeState.themeLocked}
          style={{
            background: current.card,
            border: `1px solid ${current.border}`,
            color: current.text,
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: activeThemeState.themeLocked ? "not-allowed" : "pointer",
            opacity: activeThemeState.themeLocked ? 0.6 : 1,
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
        >
          <option value="standard">Standard</option>
          <option value="dark">Dark</option>
          <option value="sepia">Sepia</option>
          <option value="contrast">High Contrast</option>
        </select>

        <button
          type="button"
          onClick={onHardReset}
          title="Clear cached session"
          style={{
            background: "transparent",
            border: `1px solid ${current.border}`,
            color: current.textDim,
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.75rem",
          }}
        >
          Reset Session
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          disabled={isFullscreen}
          title={isFullscreen ? "Fullscreen active (use ESC to exit)" : "Enter Fullscreen"}
          style={{
            background: isFullscreen ? current.border : "transparent",
            border: `1px solid ${current.border}`,
            color: isFullscreen ? current.textDim : current.text,
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: isFullscreen ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            opacity: isFullscreen ? 0.6 : 1,
          }}
        >
          {isFullscreen ? "Fullscreen Active" : "Fullscreen ⛶"}
        </button>
      </div>

      <button
        type="button"
        onClick={onOpenDashboard}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: current.accent,
          fontWeight: "bold",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      >
        Welcome
      </button>
    </div>
  );
}
