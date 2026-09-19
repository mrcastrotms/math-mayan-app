"use client";

import React, { useState, useEffect, useRef } from "react";
import SectionSelector from "./SectionSelector";
import StudentRosterInput from "./StudentRosterInput";
import TeacherPinGate from "./TeacherPinGate";
import { useGateValidation } from "./hooks/useGateValidation";

const DEFAULT_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

const THEMES = {
  standard: { bg: "#f8fafc", card: "#ffffff", border: "#e2e8f0", text: "#0f172a", textDim: "#64748b", accent: "#2563eb" },
  sepia: { bg: "#fbf0d9", card: "#f4ecd8", border: "#d3c4a5", text: "#433422", textDim: "#79664f", accent: "#8f5922" },
  contrast: { bg: "#000000", card: "#0a0a0a", border: "#ffff00", text: "#ffffff", textDim: "#ffff00", accent: "#00ffff" },
};

export default function ExamGate({
  availableSections = [],
  isLoading = false,
  onExamStart,
  onOpenDashboard,
}) {
  const sections = availableSections.length > 0 ? availableSections : DEFAULT_SECTIONS;

  const [studentName, setStudentName] = useState(() => (
    typeof window !== "undefined" ? localStorage.getItem("exam_student_name") || "" : ""
  ));
  const [storedName, setStoredName] = useState(() => (
    typeof window !== "undefined" ? localStorage.getItem("exam_student_name") || "" : ""
  ));
  const [selectedSectionState, setSelectedSection] = useState(sections[0] || "4A");
  const [theme, setTheme] = useState("standard");
  const [showCodeField, setShowCodeField] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [deviceMeta, setDeviceMeta] = useState({ uuid: "", mdns: "" });

  const lastTapRef = useRef(0);
  const current = THEMES[theme] || THEMES.standard;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("math_app_theme");
      if (saved === "standard" || saved === "sepia" || saved === "contrast") {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch {}
  }, []);

  const handleThemeChange = (nextTheme) => {
    setTheme(nextTheme);
    try {
      localStorage.setItem("math_app_theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    } catch {}
  };

  const { rosterOptions, resolvedOfficialName, validateAndResolve } = useGateValidation({
    studentName,
    storedName,
    selectedSection,
    accessCode,
    showCodeField,
  });

  const displayGreetingName = resolvedOfficialName || storedName;

  const selectedSection = sections.includes(selectedSectionState)
    ? selectedSectionState
    : sections[0] || "4A";

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const cached = localStorage.getItem("exam_student_name");
      let uuid = localStorage.getItem("exam_device_uuid");
      if (!uuid) {
        uuid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : "dev-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        localStorage.setItem("exam_device_uuid", uuid);
      }
      setDeviceMeta((prev) => ({ ...prev, uuid }));
    } catch (_) {}
  }, []);

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
    try {
      if (typeof sessionStorage !== "undefined") sessionStorage.clear();
      if (typeof localStorage !== "undefined") {
        ["math_mayan_teacher", "exam_active_view", "activeExamSession", "exam_student_name"].forEach((k) => localStorage.removeItem(k));
      }
    } catch (_) {}
    if (typeof window !== "undefined") window.location.href = window.location.pathname;
  };

  const handleStartExam = async (e) => {
    e.preventDefault();
    let result;
    try {
      result = await validateAndResolve();
    } catch {
      setError("Roster validation is unavailable. Please try again.");
      return;
    }
    if (!result) return;
    if (!result.isValid) {
      setError("Name not recognized on class roster. Check your spelling.");
      return;
    }

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
    <div style={{ minHeight: "100vh", backgroundColor: current.bg, color: current.text, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", fontFamily: "monospace" }}>
      <div style={{ width: "100%", maxWidth: "520px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", fontSize: "0.85rem" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {["standard", "sepia", "contrast"].map((t) => (
            <button key={t} type="button" onClick={() => handleThemeChange(t)} aria-pressed={theme === t} style={{ background: theme === t ? current.border : "transparent", border: `1px solid ${current.border}`, color: current.text, padding: "8px 10px", minHeight: "44px", borderRadius: "4px", cursor: "pointer", textTransform: "capitalize" }}>
              {t === "standard" ? "Standard" : t === "contrast" ? "High Contrast" : "Sepia"}
            </button>
          ))}
          <button type="button" onClick={handleHardReset} style={{ background: "transparent", border: `1px solid ${current.border}`, color: current.textDim, padding: "4px 8px", borderRadius: "4px", cursor: "pointer", fontSize: "0.75rem" }} title="Clear cached session">
            Reset Session
          </button>
        </div>
        <button type="button" onClick={onOpenDashboard} style={{ background: "transparent", border: "none", cursor: "pointer", color: current.accent, fontWeight: "bold", fontFamily: "inherit", fontSize: "inherit" }}>
          Welcome
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: "520px", background: current.card, border: `1px solid ${current.border}`, borderRadius: "12px", padding: "32px 24px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
        <div style={{ marginBottom: "20px" }}>
          <span style={{ fontSize: "0.8rem", color: current.textDim, textTransform: "uppercase" }}>mrcastro.vercel.app</span>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "4px" }}>Select your section</h2>
        </div>

        <form onSubmit={handleStartExam} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <SectionSelector sections={sections} selectedSection={selectedSection} onSelectSection={setSelectedSection} currentTheme={current} />
          <StudentRosterInput studentName={studentName} onChangeName={setStudentName} rosterOptions={rosterOptions} displayGreetingName={displayGreetingName} onResetUser={handleResetUser} onLabelInteraction={handleLabelInteraction} currentTheme={current} />
          <TeacherPinGate showCodeField={showCodeField} accessCode={accessCode} onChangeAccessCode={setAccessCode} currentTheme={current} />

          <button type="submit" disabled={isLoading} style={{ padding: "16px", background: current.accent, color: "#ffffff", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "1px", borderRadius: "8px", border: "none", cursor: isLoading ? "not-allowed" : "pointer", marginTop: "8px", opacity: isLoading ? 0.7 : 1 }}>
            START
          </button>
        </form>
      </div>
    </div>
  );
}
