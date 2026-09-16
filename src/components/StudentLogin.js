"use client";
import React, { useState } from "react";

export default function StudentLogin({ onLogin, onLoginSuccess }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [grade, setGrade] = useState("4th");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    // Master code 00000 bypasses code check and explicitly skips Firebase/Firestore writes
    if (code === "00000" || code.trim() === "00000") {
      const loginPayload = {
        name: name.trim(),
        code: "00000",
        grade,
        bypassedFirebase: true,
      };
      if (onLoginSuccess) onLoginSuccess(loginPayload);
      if (onLogin) onLogin(loginPayload);
      return;
    }

    // Normal production authentication / Firestore write flow
    const loginPayload = {
      name: name.trim(),
      code,
      grade,
      bypassedFirebase: false,
    };
    if (onLoginSuccess) onLoginSuccess(loginPayload);
    if (onLogin) onLogin(loginPayload);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 select-none">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-cyan-400 text-center">
          Student Login
        </h2>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Grade</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
          >
            <option value="4th">4th Grade</option>
            <option value="5th">5th Grade</option>
            <option value="9th">9th Grade</option>
            <option value="11th">11th Grade</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
            data-testid="student-name-input"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Access Code (00000 for test bypass)
          </label>
          <input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white"
            data-testid="exam-code-input"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded transition-colors"
          data-testid="start-exam-btn"
        >
          Start Assessment
        </button>
      </form>
    </div>
  );
}
