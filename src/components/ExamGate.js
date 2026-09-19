// src/components/ExamGate.js
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { matchStudentToRoster } from "../utils/rosterUtils";

const DEFAULT_SECTIONS = ["4A", "4B", "4C", "4D", "4E", "5B"];

export default function ExamGate({
  availableSections = [],
  isLoading = false,
  onExamStart,
  onOpenDashboard,
}) {
  const sections =
    availableSections && availableSections.length > 0
      ? availableSections
      : DEFAULT_SECTIONS;

  // Session & Identity State
  const [studentName, setStudentName] = useState("");
  const [storedName, setStoredName] = useState("");
  const [selectedSection, setSelectedSection] = useState(sections[0] || "4A");
  const [theme, setTheme] = useState("standard");

  // Secret Bypass State
  const [showCodeField, setShowCodeField] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [isTesterMode, setIsTesterMode] = useState(false);
  const [bypassNotice, setBypassNotice] = useState("");

  // Exam Runtime & Countdown
  const [examActive, setExamActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [deviceMeta, setDeviceMeta] = useState({ uuid: "", mdns: "" });

  const lastTapRef = useRef(0);

  // Sync selected section if available sections update asynchronously
  useEffect(() => {
    if (sections.length > 0 && !sections.includes(selectedSection)) {
      setSelectedSection(sections[0]);
    }
  }, [sections, selectedSection]);

  // Read stored credentials & generate persistent device UUID (Client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const cached = localStorage.getItem("exam_student_name");
      if (cached) {
        setStoredName(cached);
        setStudentName(cached);
      }

      let uuid = localStorage.getItem("exam_device_uuid");
      if (!uuid) {
        uuid =
          typeof crypto !== "undefined" &&
          typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : "dev-" +
              Math.random().toString(36).substring(2, 10) +
              Date.now().toString(36);
        localStorage.setItem("exam_device_uuid", uuid);
      }
      setDeviceMeta((prev) => ({ ...prev, uuid }));
    } catch (_) {}
  }, []);

  // 45-Minute Countdown Interval
  useEffect(() => {
    if (!examActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alert("Time limit reached. Assessment locked.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examActive]);

  // Resolve official roster name from JSON whenever name or section changes
  const resolvedOfficialName = useMemo(() => {
    const targetName = studentName || storedName;
    if (!targetName || !selectedSection) return "";
    const match = matchStudentToRoster(targetName, selectedSection);
    return match?.matched ? match.officialName : "";
  }, [studentName, storedName, selectedSection]);

  const displayGreetingName = resolvedOfficialName || storedName;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Double-tap/click detection on the "Full Name" label
  const handleLabelInteraction = (e) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setShowCodeField((prev) => !prev);
    }
    lastTapRef.current = now;
  };

  const handleResetUser = () => {
    try {
      localStorage.removeItem("exam_student_name");
    } catch (_) {}
    setStoredName("");
    setStudentName("");
  };

  const handleHardReset = () => {
    try {
      if (typeof sessionStorage !== "undefined") sessionStorage.clear();
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("math_mayan_teacher");
        localStorage.removeItem("exam_active_view");
        localStorage.removeItem("activeExamSession");
        localStorage.removeItem("exam_student_name");
      }
    } catch (err) {
      console.warn("Could not clear storage:", err);
    }
    if (typeof window !== "undefined") {
      window.location.href = window.location.pathname;
    }
  };

  // SSR-Safe WebRTC mDNS Extraction with socket cleanup
  const extractMdns = async () => {
    if (typeof window === "undefined" || !window.RTCPeerConnection) {
      return "unsupported";
    }

    return new Promise((resolve) => {
      let pc = null;
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        try {
          if (pc) {
            pc.onicecandidate = null;
            pc.close();
          }
        } catch (_) {}
        resolve(result);
      };

      try {
        pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel("telemetry");

        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            finish("no_candidate");
            return;
          }
          const match = e.candidate.candidate.match(
            /([a-f0-9-]+\.local|\d+\.\d+\.\d+\.\d+)/i,
          );
          if (match) {
            finish(match[1]);
          }
        };

        pc.createOffer()
          .then((o) => pc.setLocalDescription(o))
          .catch(() => finish("blocked"));

        setTimeout(() => finish("timeout"), 500);
      } catch (_) {
        finish("error");
      }
    });
  };

  // Fullscreen + Initiation
  const handleStartExam = async (e) => {
    e.preventDefault();
    const trimmed = studentName.trim();
    if (!trimmed) return;

    // Tester Bypass Check
    const normalized = trimmed.toLowerCase();
    const isMrCastro =
      normalized === "mr. castro" ||
      normalized === "mr castro" ||
      normalized === "césar castro" ||
      normalized === "cesar castro";

    const testerGranted = showCodeField && accessCode === "00000" && isMrCastro;

    // Match against official JSON roster if not a tester
    let finalStudentName = trimmed;
    if (!testerGranted) {
      const rosterMatch = matchStudentToRoster(trimmed, selectedSection);
      if (rosterMatch?.matched && rosterMatch.officialName) {
        finalStudentName = rosterMatch.officialName;
      }
    }

    setIsTesterMode(testerGranted);
    if (testerGranted) {
      setBypassNotice("Welcome Mr. Castro");
    }

    // Cache verified name for returning visits
    try {
      localStorage.setItem("exam_student_name", finalStudentName);
    } catch (_) {}

    // Request Fullscreen
    try {
      const docEl = document.documentElement;
      if (!document.fullscreenElement) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          await docEl.webkitRequestFullscreen();
        }
      }
    } catch (err) {
      console.warn("Fullscreen bypassed or restricted:", err);
    }

    // Capture Candidate & Active UUID
    const mdnsCandidate = await extractMdns();
    const currentUuid =
      deviceMeta.uuid ||
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("exam_device_uuid")
        : "dev_anon");

    setDeviceMeta({ uuid: currentUuid, mdns: mdnsCandidate });
    setExamActive(true);

    if (typeof onExamStart === "function") {
      onExamStart({
        studentName: finalStudentName,
        section: selectedSection,
        isTester: testerGranted,
        deviceUuid: currentUuid,
        mdnsCandidate,
        code: testerGranted ? accessCode : "",
      });
    }
  };

  // Color Palettes
  const getTheme = () => {
    switch (theme) {
      case "sepia":
        return {
          bg: "#fbf0d9",
          card: "#f4ecd8",
          border: "#d3c4a5",
          text: "#433422",
          textDim: "#79664f",
          accent: "#8f5922",
        };
      case "contrast":
        return {
          bg: "#000000",
          card: "#0a0a0a",
          border: "#ffff00",
          text: "#ffffff",
          textDim: "#ffff00",
          accent: "#00ffff",
        };
      default:
        return {
          bg: "#f8fafc",
          card: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          textDim: "#64748b",
          accent: "#2563eb",
        };
    }
  };

  const current = getTheme();

  // Active Lockdown Exam View
  if (examActive) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: current.bg,
          color: current.text,
          padding: "24px",
          fontFamily: "monospace",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "16px",
            borderBottom: `2px solid ${current.border}`,
            marginBottom: "24px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 800 }}>
              Section {selectedSection} — Mathematics Assessment
            </h1>
            <p
              style={{
                fontSize: "0.85rem",
                color: current.textDim,
                marginTop: "4px",
              }}
            >
              Candidate: {resolvedOfficialName || studentName}{" "}
              {isTesterMode && (
                <span style={{ color: current.accent }}>[TESTER]</span>
              )}
            </p>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "0.75rem",
                textTransform: "uppercase",
                color: current.textDim,
              }}
            >
              Time Remaining
            </div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 900,
                color: timeLeft < 300 ? "#da3633" : current.text,
              }}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
        </header>

        {bypassNotice && (
          <div
            style={{
              background: "rgba(35, 134, 54, 0.2)",
              border: `1px solid ${current.accent}`,
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "20px",
              fontWeight: 700,
            }}
          >
            {bypassNotice} — Unconstrained tester verification active.
          </div>
        )}

        <main
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            background: current.card,
            padding: "24px",
            borderRadius: "8px",
            border: `1px solid ${current.border}`,
          }}
        >
          <p>Assessment session running in locked environment.</p>
          <div
            style={{
              marginTop: "16px",
              fontSize: "0.75rem",
              color: current.textDim,
            }}
          >
            Device UUID: {deviceMeta.uuid} | Network: {deviceMeta.mdns}
          </div>
        </main>
      </div>
    );
  }

  // Initial Form / Gate View
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: current.bg,
        color: current.text,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        fontFamily: "monospace",
      }}
    >
      {/* Top Controls */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          fontSize: "0.85rem",
        }}
      >
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setTheme("standard")}
            style={{
              background: theme === "standard" ? current.border : "transparent",
              border: `1px solid ${current.border}`,
              color: current.text,
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Standard
          </button>
          <button
            type="button"
            onClick={() => setTheme("sepia")}
            style={{
              background: theme === "sepia" ? "#8f5922" : "transparent",
              border: "1px solid #d3c4a5",
              color: theme === "sepia" ? "#ffffff" : "#433422",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Sepia
          </button>
          <button
            type="button"
            onClick={() => setTheme("contrast")}
            style={{
              background: theme === "contrast" ? "#ffff00" : "transparent",
              border: "1px solid #ffff00",
              color: theme === "contrast" ? "#000000" : "#ffffff",
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            High Contrast
          </button>

          <button
            type="button"
            onClick={handleHardReset}
            style={{
              background: "transparent",
              border: `1px solid ${current.border}`,
              color: current.textDim,
              padding: "4px 8px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.75rem",
            }}
            title="Clear cached session and reset view"
          >
            Reset Session
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
            textDecoration: "none",
            fontWeight: "bold",
            fontFamily: "inherit",
            fontSize: "inherit",
          }}
        >
          Teacher Dashboard
        </button>
      </div>

      {/* Main Intake Card */}
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          background: current.card,
          border: `1px solid ${current.border}`,
          borderRadius: "12px",
          padding: "32px 24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ marginBottom: "20px" }}>
          <span
            style={{
              fontSize: "0.8rem",
              color: current.textDim,
              textTransform: "uppercase",
            }}
          >
            mrcastro.vercel.app
          </span>
          <h2
            style={{ fontSize: "1.35rem", fontWeight: 800, marginTop: "4px" }}
          >
            Select your section and enter your details
          </h2>
        </div>

        <form
          onSubmit={handleStartExam}
          style={{ display: "flex", flexDirection: "column", gap: "20px" }}
        >
          {/* Section Picker */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.85rem",
                marginBottom: "8px",
                color: current.textDim,
              }}
            >
              Select your class section:
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              {sections.map((sec) => (
                <button
                  type="button"
                  key={sec}
                  onClick={() => setSelectedSection(sec)}
                  style={{
                    padding: "10px",
                    borderRadius: "6px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background:
                      selectedSection === sec ? current.accent : "transparent",
                    color: selectedSection === sec ? "#ffffff" : current.text,
                    border: `1px solid ${selectedSection === sec ? current.accent : current.border}`,
                  }}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name Field + Double-Tap Target */}
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
                onClick={handleLabelInteraction}
                onTouchEnd={handleLabelInteraction}
                style={{
                  fontSize: "0.85rem",
                  color: current.textDim,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                {displayGreetingName
                  ? `Welcome back, ${displayGreetingName}!`
                  : "Write your full name:"}
              </label>

              {displayGreetingName && (
                <button
                  type="button"
                  onClick={handleResetUser}
                  style={{
                    background: "none",
                    border: "none",
                    color: current.accent,
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
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g., Student Name"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "6px",
                background: current.bg,
                border: `1px solid ${current.border}`,
                color: current.text,
                fontSize: "1rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Hidden Code Input (Reveals only after double-tap) */}
          {showCodeField && (
            <div
              style={{
                background: "rgba(255, 255, 255, 0.02)",
                padding: "12px",
                borderRadius: "6px",
                border: `1px dashed ${current.border}`,
              }}
            >
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  marginBottom: "4px",
                  color: current.textDim,
                }}
              >
                Code:
              </label>
              <input
                type="password"
                maxLength={5}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="•••••"
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  background: current.bg,
                  border: `1px solid ${current.border}`,
                  color: current.text,
                  letterSpacing: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          )}

          {/* Fullscreen & Assessment Launch */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "16px",
              background: current.accent,
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1.1rem",
              letterSpacing: "1px",
              borderRadius: "8px",
              border: "none",
              cursor: isLoading ? "not-allowed" : "pointer",
              marginTop: "8px",
              opacity: isLoading ? 0.7 : 1,
            }}
          >
            START
          </button>
        </form>
      </div>
    </div>
  );
}
