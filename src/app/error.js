"use client";
import React from "react";
export default function GlobalError({ error }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "#450a0a", color: "white", padding: "40px", fontFamily: "monospace", overflow: "auto" }}>
      <h1 style={{ fontSize: "2rem", color: "#ef4444", marginBottom: "1rem" }}>🚨 EXAM APP CRASHED 🚨</h1>
      <p style={{ fontSize: "1.25rem", marginBottom: "2rem" }}>Copy this exact red text and paste it to the AI:</p>
      <div style={{ backgroundColor: "rgba(0,0,0,0.5)", padding: "20px", borderRadius: "10px", border: "1px solid #ef4444" }}>
        <h2 style={{ fontSize: "1.5rem", color: "#f87171", marginBottom: "0.5rem" }}>{error?.name}</h2>
        <h3 style={{ fontSize: "1.25rem", color: "#fca5a5", marginBottom: "1rem" }}>{error?.message}</h3>
        <pre style={{ fontSize: "0.875rem", color: "#fecaca", whiteSpace: "pre-wrap" }}>{error?.stack}</pre>
      </div>
    </div>
  );
}
