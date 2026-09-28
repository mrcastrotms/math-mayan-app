"use client";
import React, { useState, useEffect } from "react";

export default function ZearnHubView({ onBack, studentName: propStudentName, section: propSection }) {
  const getInitialName = () => {
    if (propStudentName && propStudentName !== "Student") return propStudentName;
    try {
      return localStorage.getItem("exam_student_name") || sessionStorage.getItem("exam_student_name") || "";
    } catch (_) {
      return "";
    }
  };

  const getInitialSection = () => {
    if (propSection && propSection !== "4A") return propSection;
    try {
      return localStorage.getItem("exam_student_section") || sessionStorage.getItem("exam_student_section") || "";
    } catch (_) {
      return "";
    }
  };

  const [studentName, setStudentName] = useState(getInitialName);
  const [studentSection, setStudentSection] = useState(getInitialSection);
  const [studentCreds, setStudentCreds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Manual selector states for mobile session recovery
  const [availableStudents, setAvailableStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showManualPicker, setShowManualPicker] = useState(false);

  // Load section roster when manual selection is needed
  useEffect(() => {
    if (!studentSection) return;
    setLoadingStudents(true);
    fetch(`/api/roster?section=${encodeURIComponent(studentSection)}`)
      .then((res) => (res.ok ? res.json() : { students: [] }))
      .then((data) => {
        setAvailableStudents(data.students || []);
        setLoadingStudents(false);
      })
      .catch(() => setLoadingStudents(false));
  }, [studentSection]);

  // Load credentials for active student
  useEffect(() => {
    let isMounted = true;

    async function loadCreds() {
      const activeName = (studentName || "").trim().toLowerCase();
      if (!activeName || activeName === "student") {
        if (isMounted) {
          setIsLoading(false);
          setShowManualPicker(true);
        }
        return;
      }

      setIsLoading(true);

      try {
        // 1. Try active section first
        if (studentSection) {
          const res = await fetch(`/api/roster?section=${encodeURIComponent(studentSection)}`);
          if (res.ok) {
            const data = await res.json();
            const found = (data.students || []).find((s) => {
              const sName = (s.displayName || s.rawName || s.name || "").trim().toLowerCase();
              return sName === activeName || sName.includes(activeName) || activeName.includes(sName);
            });
            if (found && isMounted) {
              setStudentCreds(found);
              setIsLoading(false);
              setShowManualPicker(false);
              return;
            }
          }
        }

        // 2. Global roster fallback across all sections
        const allRes = await fetch("/api/roster");
        if (allRes.ok) {
          const allData = await allRes.json();
          let matched = null;
          let detectedSection = "";

          if (Array.isArray(allData)) {
            matched = allData.find((s) => {
              const sName = (s.displayName || s.rawName || s.name || "").trim().toLowerCase();
              return sName === activeName || sName.includes(activeName) || activeName.includes(sName);
            });
            if (matched) detectedSection = matched.section || "";
          } else if (typeof allData === "object" && allData !== null) {
            for (const [sec, list] of Object.entries(allData)) {
              if (Array.isArray(list)) {
                const sFound = list.find((s) => {
                  const sName = (s.displayName || s.rawName || s.name || "").trim().toLowerCase();
                  return sName === activeName || sName.includes(activeName) || activeName.includes(sName);
                });
                if (sFound) {
                  matched = sFound;
                  detectedSection = sec;
                  break;
                }
              }
            }
          }

          if (matched && isMounted) {
            setStudentCreds(matched);
            if (detectedSection) {
              setStudentSection(detectedSection);
              try {
                localStorage.setItem("exam_student_section", detectedSection);
              } catch (_) {}
            }
            setIsLoading(false);
            setShowManualPicker(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load Zearn credentials:", err);
      }

      if (isMounted) {
        setIsLoading(false);
        setShowManualPicker(true);
      }
    }

    loadCreds();

    return () => {
      isMounted = false;
    };
  }, [studentSection, studentName]);

  const handleSelectStudent = (studentObj) => {
    const chosenName = studentObj.displayName || studentObj.rawName || studentObj.name;
    setStudentName(chosenName);
    setStudentCreds(studentObj);
    setShowManualPicker(false);

    try {
      localStorage.setItem("exam_student_name", chosenName);
      sessionStorage.setItem("exam_student_name", chosenName);
      if (studentSection) {
        localStorage.setItem("exam_student_section", studentSection);
        sessionStorage.setItem("exam_student_section", studentSection);
      }
    } catch (_) {}
  };

  const handleLaunchZearn = () => {
    window.open("https://www.zearn.org", "_blank", "noopener,noreferrer");
  };

  const sectionsList = ["4A", "4B", "4C", "4D", "4E", "5B"];

  return (
    <div className="flex min-h-screen w-full flex-col bg-[var(--app-bg)] p-4 sm:p-8 font-sans text-[var(--app-fg)]">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-[var(--app-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--app-fg)]">
            Zearn Math Portal
          </h1>
          <p className="text-sm opacity-80">
            Digital lessons, fluency drills and curriculum sprints
          </p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] font-bold text-[var(--app-fg)] hover:opacity-80 transition cursor-pointer"
        >
          ← Back to Menu
        </button>
      </div>

      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full mt-6">
        {/* Credentials Card */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-bold text-[var(--app-fg)]">
                {studentCreds ? `${studentCreds.displayName || studentCreds.rawName || studentCreds.name}'s Zearn Account` : "Your Personal Zearn Credentials"}
              </h2>
              <p className="text-sm opacity-80">
                Official credentials and class codes for Section {studentSection || "..."}
              </p>
            </div>
            {studentCreds && (
              <button
                type="button"
                onClick={() => setShowManualPicker(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[var(--app-border)] hover:bg-[var(--app-bg)] opacity-75 hover:opacity-100 transition cursor-pointer"
              >
                Change Student
              </button>
            )}
          </div>

          {/* Fallback Selector for mobile session drops */}
          {showManualPicker && (
            <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-3">
              <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">
                Select Your Name
              </span>

              {/* Section Buttons */}
              <div className="flex flex-wrap gap-2">
                {sectionsList.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setStudentSection(sec)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      studentSection === sec
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "border-[var(--app-border)] hover:bg-[var(--app-bg)]"
                    }`}
                  >
                    Section {sec}
                  </button>
                ))}
              </div>

              {/* Student Dropdown */}
              {loadingStudents ? (
                <p className="text-xs opacity-70">Loading roster for Section {studentSection}...</p>
              ) : availableStudents.length > 0 ? (
                <div className="space-y-1">
                  <label className="text-xs font-medium opacity-80 block">Choose your name from the list:</label>
                  <select
                    className="w-full max-w-md rounded-lg border border-[var(--app-border)] bg-[var(--app-surface)] p-2.5 text-sm font-semibold cursor-pointer"
                    onChange={(e) => {
                      const studentObj = availableStudents.find(
                        (s) => (s.displayName || s.rawName || s.name) === e.target.value
                      );
                      if (studentObj) handleSelectStudent(studentObj);
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>-- Select Name --</option>
                    {availableStudents.map((s) => {
                      const name = s.displayName || s.rawName || s.name;
                      return (
                        <option key={s.id || name} value={name}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : studentSection ? (
                <p className="text-xs opacity-70">No students found in Section {studentSection}.</p>
              ) : (
                <p className="text-xs opacity-70">Select your section above to find your name.</p>
              )}
            </div>
          )}

          {isLoading ? (
            <p className="text-sm opacity-70">Loading your Zearn credentials...</p>
          ) : studentCreds ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Classwork */}
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-fg)]">
                    Classwork Account
                  </span>
                  <span className="text-xs font-mono border border-[var(--app-border)] px-2.5 py-1 rounded-lg">
                    Code: {studentCreds.zearnClasscodeClasswork || "Not assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-xs opacity-75 block">Username</span>
                  <span className="font-mono font-bold text-base select-all bg-[var(--app-surface)] border border-[var(--app-border)] px-3 py-1.5 rounded-lg block mt-1 text-[var(--app-fg)]">
                    {studentCreds.zearnClassworkUser || "Not assigned yet"}
                  </span>
                </div>
                <div>
                  <span className="text-xs opacity-75 block">Password</span>
                  <span className="font-mono font-bold text-base select-all bg-[var(--app-surface)] border border-[var(--app-border)] px-3 py-1.5 rounded-lg block mt-1 text-[var(--app-fg)]">
                    {studentCreds.zearnClassworkPass || "Not assigned yet"}
                  </span>
                </div>
              </div>

              {/* Homework */}
              <div className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--app-fg)]">
                    Homework Account
                  </span>
                  <span className="text-xs font-mono border border-[var(--app-border)] px-2.5 py-1 rounded-lg">
                    Code: {studentCreds.zearnClasscodeHomework || "Not assigned"}
                  </span>
                </div>
                <div>
                  <span className="text-xs opacity-75 block">Username</span>
                  <span className="font-mono font-bold text-base select-all bg-[var(--app-surface)] border border-[var(--app-border)] px-3 py-1.5 rounded-lg block mt-1 text-[var(--app-fg)]">
                    {studentCreds.zearnHomeworkUser || "Not assigned yet"}
                  </span>
                </div>
                <div>
                  <span className="text-xs opacity-75 block">Password</span>
                  <span className="font-mono font-bold text-base select-all bg-[var(--app-surface)] border border-[var(--app-border)] px-3 py-1.5 rounded-lg block mt-1 text-[var(--app-fg)]">
                    {studentCreds.zearnHomeworkPass || "Not assigned yet"}
                  </span>
                </div>
              </div>
            </div>
          ) : !showManualPicker ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-sm text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-between">
              <span>No credentials matched for {studentName || "current student"}.</span>
              <button
                type="button"
                onClick={() => setShowManualPicker(true)}
                className="underline font-bold"
              >
                Choose Name
              </button>
            </div>
          ) : null}
        </div>

        {/* Launch Zearn Portal Card */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-xl font-bold text-[var(--app-fg)]">Ready to Launch Zearn Math?</h3>
          <p className="text-sm opacity-80 max-w-lg">
            Click below to open the official Zearn workspace, then sign in with your credentials above.
          </p>
          <button
            type="button"
            onClick={handleLaunchZearn}
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg transition text-base cursor-pointer flex items-center gap-2"
          >
            <span>Launch Zearn Workspace</span>
            <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
}
