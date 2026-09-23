"use client";

import React, { useState, useEffect, useRef } from "react";
import SectionSelector from "./SectionSelector";
import StudentRosterInput from "./StudentRosterInput";
import TeacherPinGate from "./TeacherPinGate";
import ExamHeaderControls from "./ExamHeaderControls";
import GateErrorModal from "./GateErrorModal";
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
  const [modalState, setModalState] = useState({ isOpen: false, title: "", message: "" });
  const [ciStatus, setCiStatus] = useState("success");

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

  // Poll latest GitHub Actions workflow test status for mrcastrotms/math-mayan-app
  useEffect(() => {
    async function checkCiHealth() {
      try {
        const res = await fetch("https://api.github.com/repos/mrcastrotms/math-mayan-app/actions/runs?per_page=1");
        if (!res.ok) return;
        const data = await res.json();
        const latestRun = data?.workflow_runs?.[0];
        if (latestRun) {
          if (latestRun.conclusion === "failure") {
            setCiStatus("failure");
          } else if (latestRun.conclusion === "success") {
            setCiStatus("success");
          } else if (latestRun.status === "in_progress" || latestRun.status === "queued") {
            setCiStatus("running");
          }
        }
      } catch (_) {}
    }
    checkCiHealth();
  }, []);

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
    }
  };

  const handleDoubleClick = (e) => {
    const mainCard = document.getElementById("select-section-card");
    if (mainCard && !mainCard.contains(e.target)) {
      if (!document.fullscreenElement) {
        toggleFullscreen();
      }
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
    if (!result || !result.isValid) {
      if (result?.error) {
        setModalState({
          isOpen: true,
          title: result.title || "Check Your Name",
          message: result.error,
        });
      }
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

  const rawSha = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || "";
  const commitSha = rawSha ? rawSha.substring(0, 7) : "local";
  const rawTime = process.env.NEXT_PUBLIC_BUILD_TIME;
  const buildTime = rawTime
    ? new Date(rawTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : "Live";
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "v3.4";

  // CI status colors
  const ciColors = {
    success: { bg: "rgba(16, 185, 129, 0.12)", border: "#10b981", text: "#10b981", dot: "#10b981" },
    failure: { bg: "rgba(239, 68, 68, 0.12)", border: "#ef4444", text: "#ef4444", dot: "#ef4444" },
    running: { bg: "rgba(245, 158, 11, 0.12)", border: "#f59e0b", text: "#f59e0b", dot: "#f59e0b" },
  };
  const activeCi = ciColors[ciStatus] || ciColors.success;

  return (
    <div 
      style={{ minHeight: "100vh", backgroundColor: current.bg, color: current.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px", fontFamily: "monospace" }}
      onDoubleClick={handleDoubleClick}
    >
      <ExamHeaderControls
        theme={theme}
        activeThemeState={activeThemeState}
        current={current}
        onHardReset={handleHardReset}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onOpenDashboard={onOpenDashboard}
      />

      <div 
        id="select-section-card"
        style={{ width: "100%", maxWidth: "520px", background: current.card, border: `1px solid ${current.border}`, borderRadius: "12px", padding: "32px 24px", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", marginTop: "40px" }}
      >
        <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "0.8rem", color: current.textDim, textTransform: "uppercase" }}>mrcastro.vercel.app</span>
              
              {/* Release & CI Status Badge */}
              <span 
                title={ciStatus === "failure" ? "CI tests failing on GitHub" : ciStatus === "running" ? "CI tests in progress" : "All GitHub CI tests passing"}
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "9999px",
                  letterSpacing: "0.5px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  border: `1px solid ${activeCi.border}`,
                  backgroundColor: activeCi.bg,
                  color: activeCi.text,
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: activeCi.dot, boxShadow: `0 0 6px ${activeCi.dot}` }} />
                {appVersion}
              </span>
            </div>

            <h2 style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "6px" }}>Select your section</h2>
            <p style={{ fontSize: "0.75rem", color: current.textDim, marginTop: "2px" }}>Double-click anywhere outside this card to enter fullscreen.</p>
          </div>

          <div style={{ textAlign: "right", fontSize: "0.7rem", background: current.bg, border: `1px solid ${current.border}`, padding: "6px 10px", borderRadius: "6px", color: current.textDim, flexShrink: 0 }}>
            <div style={{ fontWeight: "bold", color: current.text }}>SHA: {commitSha}</div>
            <div>Built: {buildTime}</div>
          </div>
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

      <GateErrorModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        title={modalState.title}
        message={modalState.message}
        currentTheme={current}
      />
    </div>
  );
}
