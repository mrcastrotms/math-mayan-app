"use client";
import React, { useState } from "react";
// Import your Firebase/Firestore service if needed, e.g.:
// import { db } from "../firebase";
// import { collection, addDoc } from "firebase/firestore";

export default function StudentLogin({ onLoginSuccess }) {
  const [grade, setGrade] = useState("4th");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError("Please enter your name and code.");
      return;
    }

    setLoading(true);
    setError("");

    // Master bypass code: "00000" logs in instantly and explicitly skips Firebase/Firestore writes
    if (code === "00000") {
      setLoading(false);
      onLoginSuccess({
        grade,
        name: name.trim(),
        code: "00000",
        bypassedFirebase: true,
      });
      return;
    }

    try {
      // Normal production authentication / Firestore write logic here
      // await addDoc(collection(db, "exam_sessions"), { grade, name: name.trim(), code, timestamp: new Date() });

      setLoading(false);
      onLoginSuccess({
        grade,
        name: name.trim(),
        code,
        bypassedFirebase: false,
      });
    } catch (err) {
      setLoading(false);
      setError("Invalid code or connection error.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-6 select-none">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-cyan-400 text-center">
          Student Assessment Login
        </h2>

        {error && (
          <p className="text-red-400 text-sm text-center bg-red-950/50 p-2 rounded border border-red-800">
            {error}
          </p>
        )}

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

        {/* Student Name Input */}
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

        {/* Access Code Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Access Code (Use 00000 for test bypass)
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
          disabled={loading}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
          data-testid="start-exam-btn"
        >
          {loading ? "Loading..." : "Start Assessment"}
        </button>
      </form>
    </div>
  );
}
