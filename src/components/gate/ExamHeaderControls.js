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
  return (
    <div style={{ position: "absolute", top: "16px", right: "24px", left: "24px", maxWidth: "520px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        {/* Theme Dropdown */}
        <select
          value={theme}
          disabled={activeThemeState.themeLocked}
          onChange={(e) => activeThemeState.changeTheme(e.target.value === "standard" ? "default" : e.target.value)}
          aria-label="Choose theme"
          style={{ background: current.card, border: `1px solid ${current.border}`, color: current.text, padding: "4px 8px", borderRadius: "4px", cursor: activeThemeState.themeLocked ? "not-allowed" : "pointer", opacity: activeThemeState.themeLocked ? 0.6 : 1, fontFamily: "inherit", fontSize: "inherit" }}
        >
          <option value="standard">Standard</option>
          <option value="dark">Dark</option>
          <option value="sepia">Sepia</option>
          <option value="contrast">High Contrast</option>
        </select>

        {activeThemeState.themeLocked && <span role="status" style={{ color: current.textDim, fontSize: "0.75rem" }}>Locked</span>}

        <button type="button" onClick={onHardReset} style={{ background: "transparent", border: `1px solid ${current.border}`, color: current.textDim, padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }} title="Clear cached session">
          Reset Session
        </button>

        {/* One-Way Fullscreen Button (Disabled & Grayed when active) */}
        <button
          type="button"
          onClick={toggleFullscreen}
          disabled={isFullscreen}
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
          title={isFullscreen ? "Fullscreen active (use ESC to exit)" : "Enter Fullscreen"}
        >
          {isFullscreen ? "Fullscreen Active" : "Fullscreen ⛶"}
        </button>
      </div>

      <button type="button" onClick={onOpenDashboard} style={{ background: "transparent", border: "none", cursor: "pointer", color: current.accent, fontWeight: "bold", fontFamily: "inherit", fontSize: "inherit" }}>
        Welcome
      </button>
    </div>
  );
}
