"use client";

import React from "react";

export default function StudentRosterInput({
  studentName,
  onChangeName,
  displayGreetingName,
  onResetUser,
  onLabelInteraction,
  currentTheme,
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <label
          onClick={onLabelInteraction}
          onTouchEnd={onLabelInteraction}
          style={{
            fontSize: "0.85rem",
            color: currentTheme.textDim,
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          {displayGreetingName
            ? `Welcome back, ${displayGreetingName}!`
            : "Full name:"}
        </label>

        {displayGreetingName && (
          <button
            type="button"
            onClick={onResetUser}
            style={{
              background: "none",
              border: "none",
              color: currentTheme.accent,
              fontSize: "0.75rem",
              textDecoration: "underline",
              cursor: "pointer",
            }}
          >
            Not you?
          </button>
        )}
      </div>

      <input
        type="text"
        required
        value={studentName}
        autoComplete="off"
        onChange={(e) => onChangeName(e.target.value)}
        placeholder=""
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "6px",
          background: currentTheme.bg,
          border: `1px solid ${currentTheme.border}`,
          color: currentTheme.text,
          fontSize: "1rem",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}
