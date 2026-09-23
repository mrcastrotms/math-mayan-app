"use client";

import React from "react";

export default function GateErrorModal({ isOpen, onClose, title, message, currentTheme }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 100,
        fontFamily: "monospace",
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: currentTheme.card,
          border: `2px solid ${currentTheme.accent}`,
          borderRadius: "16px",
          padding: "36px 28px",
          boxShadow: "0 24px 50px rgba(0,0,0,0.6)",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: "2.8rem", marginBottom: "14px", lineHeight: 1 }}>⚠️</div>
        <h3 style={{ fontSize: "1.6rem", fontWeight: 900, color: currentTheme.text, marginBottom: "14px", letterSpacing: "-0.5px" }}>
          {title || "Notice"}
        </h3>
        <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: currentTheme.textDim, marginBottom: "30px", fontWeight: 700 }}>
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: currentTheme.accent,
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "1.1rem",
            letterSpacing: "1px",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
          }}
        >
          TRY AGAIN
        </button>
      </div>
    </div>
  );
}
