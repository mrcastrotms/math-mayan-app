"use client";
import React, { useState } from "react";

export default function StudentLogin({ onLoginSuccess }) {
  const [grade, setGrade] = useState("4th");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Please enter your name and code.");
      return;
    }

    // Master bypass code: "00000" always works and skips Firebase/Firestore writes
    if (code === "00000") {
      onLoginSuccess({
        grade,
        name: name.trim(),
        code: "00000",
        bypassedFirebase: true, // flag to prevent Firestore/Firebase database writes
      });
      return;
    }

    // Normal production code validation & Firestore write logic
    try {
      // Your existing Firebase/Firestore verification logic here...
      onLoginSuccess({ grade, name: name.trim(), code });
    } catch (err) {
      setError("Invalid code or connection error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-cyan-400 text-center">
          Student Assessment Login
        </h2>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {/* Grade Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Grade
          </label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
            data-testid="grade-select"
          >
            <option value="4th">4th Grade</option>
            <option value="5th">5th Grade</option>
            <option value="9th">9th Grade</option>
            <option value="11th">11th Grade</option>
          </select>
        </div>

        {/* Student Name */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
            data-testid="student-name-input"
          />
        </div>

        {/* Access Code */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Access Code (Try 00000)
          </label>
          <input
            type="text"
            placeholder="Enter exam code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-cyan-500"
            data-testid="exam-code-input"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
          data-testid="start-exam-btn"
        >
          Start Assessment
        </button>
      </form>
    </div>
  );
}
