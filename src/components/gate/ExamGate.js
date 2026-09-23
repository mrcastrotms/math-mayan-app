"use client";

import React, { useState, useEffect, useRef } from "react";
import SectionSelector from "./SectionSelector";
import StudentRosterInput from "./StudentRosterInput";
import TeacherPinGate from "./TeacherPinGate";
import { useGateValidation } from "./hooks/useGateValidation";
import { useAppTheme } from "../../hooks/useAppTheme";

const DEFAULT_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

const THEMES = {
  standard: { bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0", text: "#0f172a", textDim: "#64748b", accent: "#2563eb" },
  sepia: { bg: "#fbf0d9", card: "#f4ecd8", border: "#d3c4a5", text: "#433422", textDim: "#79664f", accent: "#8f5922" },
  dark: { bg: "#020617", card: "#0f172a", border: "#475569", text: "#f8fafc", textDim: "#cbd5e1", accent: "#60a5fa" },
  contrast: { bg: "#000000", card: "#0a0a0a", border: "#ffff00", text: "#ffffff", textDim: "#ffff00", accent: "#00ffff" },
};

export default function ExamGate({
  availableSections = [],
  isLoading = false,
  onExamStart,
  onOpenDashboard,
  themeState,
}) {
  const sections = availableSections.length > 0 ? availableSections : DEFAULT_SECTIONS;

  const [studentName, setStudentName] = useState(() => (
    typeof window !== "undefined" ? localStorage.getItem("exam_student_name") || "" : ""
  ));
  const [storedName, setStoredName] = useState(() => (
    typeof window !== "undefined" ? localStorage.getItem("exam_student_name") || "" : ""
  ));
  const [selectedSectionState, setSelectedSection] = useState(sections[0] || "4A");
  const localThemeState = useAppTheme();
  const activeThemeState = themeState || localThemeState;
  const [showCodeField, setShowCodeField] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [deviceMeta, setDeviceMeta] = useState({ uuid: "", mdns: "" });
  const [isFullscreen, setIsFullscreen] = useState(false);

  const lastTapRef = useRef(0);
  const theme = activeThemeState.theme === "default" ? "standard" : activeThemeState.theme;
  const current = THEMES[theme] || THEMES.standard;

  const selectedSection = sections.includes(selectedSectionState)
    ? selectedSectionState
    : sections[0] || "4A";

  const { resolvedOfficialName, validateAndResolve } = useGateValidation({
    studentName,
    storedName,
    selectedSection,
    accessCode,
    showCodeField,
  });

  const displayGreetingName = resolvedOfficialName || storedName;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      let uuid = localStorage.getItem("exam_device_uuid");
      if (!uuid) {
        uuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "dev-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem("exam_device_uuid", uuid);
      }
      setDeviceMeta((prev) => ({ ...prev, uuid }));

      const handleFullscreenChange = () => {
        setIsFullscreen(Boolean(document.fullscreenElement));
      };
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    } catch (_) {}
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleDoubleClick = (e) => {
    const mainCard = document.getElementById("select-section-card");
    if (mainCard && !mainCard.contains(e.target)) {
      toggleFullscreen();
    }
  };

  const handleLabelInteraction = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setShowCodeField((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleResetUser = () => {
    try { localStorage.removeItem("exam_student_name"); } catch (_) {}
    setStoredName("");
    setStudentName("");
  };

  const handleHardReset = () => {
    const resetCount = Number(sessionStorage.getItem("session_resets") || 0);
    if (resetCount >= 2) {
      const override = window.prompt("Reset limit reached. Enter teacher PIN:");
      if (!["0801", "2026"].includes(override)) {
        if (override !== null) window.alert("Incorrect PIN.");
        return;
      }
    }
    try {
      if (typeof sessionStorage !== "undefined") sessionStorage.clear();
      if (typeof localStorage !== "undefined") {
        ["math_mayan_teacher", "exam_active_view", "activeExamSession", "exam_student_name"].forEach((k) => localStorage.removeItem(k));
      }
    } catch (_) {}
    if (typeof window !== "undefined") {
      sessionStorage.setItem("session_resets", String(resetCount + 1));
      window.location.href = window.location.pathname;
    }
  };

  const handleStartExam = async (e) => {
    e.preventDefault();
    const result = await validateAndResolve();
    if (!result) return;

    try {
      localStorage.setItem("exam_student_name", result.finalStudentName);
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (_) {}

    const currentUuid = deviceMeta.uuid || (typeof localStorage !== "undefined" ? localStorage.getItem("exam_device_uuid") : "dev_anon");

    if (typeof onExamStart === "function") {
      onExamStart({
        studentName: result.finalStudentName,
        section: selectedSection,
        isTester: result.isTester,
        deviceUuid: currentUuid,
        mdnsCandidate: deviceMeta.mdns || "unsupported",
        code: result.isTester ? accessCode : "",
      });
    }
  };

  return (
    <div 
      style={{ minHeight: "100vh", backgroundColor: current.bg, color: current.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "monospace" }}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{ position: "absolute", top: "16px", right: "24px", left: "24px", maxWidth: "520px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
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

          <button type="button" onClick={handleHardReset} style={{ background: "transparent", border: `1px solid ${current.border}`, color: current.textDim, padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }} title="Clear cached session">
            Reset Session
          </button>

          <button type="button" onClick={toggleFullscreen} style={{ background: "transparent", border: `1px solid ${current.border}`, color: current.text, padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }} title="Toggle Fullscreen">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen ⛶"}
          </button>
        </div>

        <button type="button" onClick={onOpenDashboard} style={{ background: "transparent", border: "none", cursor: "pointer", color: current.accent, fontWeight: "bold", fontFamily: "inherit", fontSize: "inherit" }}>
          Welcome
        </button>
      </div>

      <div 
        id="select-section-card"
        style={{ width: "100%", maxWidth: "520px", background: current.card, border: `1px solid ${current.border}`, borderRadius: "12px", padding: "32px 24px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", marginTop: "40px" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: current.textDim, textTransform: "uppercase" }}>mrcastro.vercel.app</span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "4px" }}>Select your section</h2>
          <p style={{ fontSize: "0.75rem", color: current.textDim, marginTop: "2px" }}>Double-click anywhere outside this card to toggle fullscreen.</p>
        </div>

        <form onSubmit={handleStartExam} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <SectionSelector sections={sections} selectedSection={selectedSection} onSelectSection={setSelectedSection} currentTheme={current} />
          <StudentRosterInput studentName={studentName} onChangeName={setStudentName} displayGreetingName={displayGreetingName} onResetUser={handleResetUser} onLabelInteraction={handleLabelInteraction} currentTheme={current} />
          <TeacherPinGate showCodeField={showCodeField} accessCode={accessCode} onChangeAccessCode={setAccessCode} currentTheme={current} />

          <button type="submit" disabled={isLoading} style={{ padding: "16px", background: current.accent, color: "#ffffff", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "1px", borderRadius: "8px", border: "none", cursor: isLoading ? "not-allowed" : "pointer", marginTop: "8px", opacity: isLoading ? 0.7 : 1 }}>
            START
          </button>
        </form>
      </div>
    </div>
  );
}
