"use client";

import React from "react";

export default function TeacherPinGate({
  showCodeField,
  accessCode,
  onChangeAccessCode,
  currentTheme,
}) {
  if (!showCodeField) return null;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.02)",
        padding: "12px",
        borderRadius: "6px",
        border: `1px dashed ${currentTheme.border}`,
      }}
    >
      <label
        style={{
          display: "block",
          fontSize: "0.75rem",
          marginBottom: "4px",
          color: currentTheme.textDim,
        }}
      >
        Code:
      </label>
      <input
        type="password"
        maxLength={5}
        value={accessCode}
        onChange={(e) => onChangeAccessCode(e.target.value)}
        placeholder="•••••"
        style={{
          width: "100%",
          padding: "8px 12px",
          borderRadius: "4px",
          background: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          color: currentTheme.text,
          letterSpacing: "4px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
