"use client";

import React from "react";

export default function SectionSelector({
  sections = [],
  selectedSection,
  onSelectSection,
  currentTheme,
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "0.85rem",
          marginBottom: "8px",
          color: currentTheme.textDim,
        }}
      ></label>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}
      >
        {sections.map((sec) => {
          const isSelected = selectedSection === sec;
          return (
            <button
              type="button"
              key={sec}
              onClick={() => onSelectSection(sec)}
              style={{
                padding: "10px",
                borderRadius: "6px",
                fontWeight: 700,
                cursor: "pointer",
                background: isSelected ? currentTheme.accent : "transparent",
                color: isSelected ? "#ffffff" : currentTheme.text,
                border: `1px solid ${isSelected ? currentTheme.accent : currentTheme.border}`,
              }}
            >
              {sec}
            </button>
          );
        })}
      </div>
    </div>
  );
}
