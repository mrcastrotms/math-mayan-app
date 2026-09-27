// src/components/ZearnHubView.js
"use client";

import React, { useState, useEffect } from "react";

export default function ZearnHubView({ onBack }) {
  const [studentName, setStudentName] = useState("");
  const [studentSection, setStudentSection] = useState("");
  const [studentCreds, setStudentCreds] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const name = localStorage.getItem("exam_student_name") || "";
      const section = localStorage.getItem("exam_student_section") || "4B";
      setStudentName(name);
      setStudentSection(section);

      if (section) {
        fetch(`/api/roster?section=${section}`)
          .then((res) => res.json())
          .then((data) => {
            const students = data.students || [];
            const found = students.find(
              (s) =>
                (s.displayName || s.rawName || "").toLowerCase().trim() ===
                name.toLowerCase().trim()
            );
            if (found) {
              setStudentCreds(found);
            }
            setIsLoading(false);
          })
          .catch((err) => {
            console.error("Failed to load roster credentials:", err);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    } catch (e) {
      setIsLoading(false);
    }
  }, []);

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
          <h2 className="text-lg font-bold mb-2 text-[var(--app-fg)]">Your Personal Zearn Credentials</h2>
          <p className="text-sm opacity-80 mb-6">
            Use these official credentials and class codes to log in to Zearn Math.
          </p>

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
                    Code: {studentCreds.zearnClasscodeClasswork || (studentSection === "4B" ? "EZ7D6N" : "N/A")}
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
                    Code: {studentCreds.zearnClasscodeHomework || (studentSection === "4B" ? "DH3P2G" : "N/A")}
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
          ) : (
            <div className="rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] p-4 text-sm">
              No matching roster record found for <strong>{studentName || "Student"}</strong> in Section {studentSection}. Please check with your teacher.
            </div>
          )}
        </div>

        {/* Launch Zearn Portal Button */}
        <div className="rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 shadow-xl flex flex-col items-center justify-center text-center gap-4">
          <h3 className="text-xl font-bold text-[var(--app-fg)]">Ready to Launch Zearn Math?</h3>
          <p className="text-sm opacity-80 max-w-lg">
            Click below to open the official Zearn login portal in a new tab, then enter your class code and credentials above.
          </p>
          <a
            href="https://www.zearn.org"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white shadow-lg transition text-base cursor-pointer"
          >
            Open Official Zearn Portal →
          </a>
        </div>
      </div>
    </div>
  );
}
