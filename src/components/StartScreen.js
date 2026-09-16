"use client";
import { useState } from "react";
import { auth, db } from "../firebase";
import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function StartScreen({
  setIsAdminMode,
  onJoinSuccess,
  availableSections = ["4A", "4B", "4C", "4D", "4E", "5B"],
  children, // To render the DevAdminPanel if needed
}) {
  const [name, setName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // STUDENT FLOW (Anonymous Auth)
  // ==========================================
  const handleStart = async (e) => {
    e.preventDefault();
    if (!name.trim() || !examCode.trim() || !selectedSection) {
      setError(
        "Please select your section, type your name, and enter the code.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Silent anonymous login (No Google Popups)
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // 2. Register student in the active exam session in Firestore
      await setDoc(doc(db, "exams", examCode.toUpperCase(), "students", uid), {
        studentName: name.trim(),
        section: selectedSection,
        joinedAt: new Date(),
        uid: uid,
      });

      // 3. Mount the ActiveExam component in page.js
      onJoinSuccess(name.trim(), examCode.toUpperCase(), uid, selectedSection);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Could not join. Check the exam code on the board.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // TEACHER FLOW (Google Auth + Email Check)
  // ==========================================
  const handleTeacherLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // Strict check: Only let your specific email into the dashboard
      if (email && email.includes("cesar015.2016")) {
        setIsAdminMode(true);
      } else {
        // If anyone else tries to log in, boot them and show an error
        await signOut(auth);
        setError(
          "Access Denied: You are not authorized to view the dashboard.",
        );
      }
    } catch (err) {
      console.error("Teacher login failed:", err);
      setError("Failed to verify teacher account. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative">
      {/* High Contrast / Teacher Entry Header */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <button
          onClick={handleTeacherLogin}
          className="bg-slate-800 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-slate-700 shadow-md transition"
        >
          Open Teacher Dashboard →
        </button>
      </div>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 border border-slate-100 mt-12">
        <h1 className="text-3xl font-black text-center text-slate-800 mb-2">
          Mathematics with Mr. Castro
        </h1>
        <p className="text-center text-slate-500 mb-8 font-medium">
          Welcome! Please select your section and enter your details to begin.
        </p>

        <form onSubmit={handleStart} className="space-y-6">
          {/* Section Selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3 text-center">
              Select your class section:
            </label>
            <div className="flex flex-wrap justify-center gap-3">
              {availableSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`w-14 h-14 rounded-xl font-bold text-lg transition-all ${
                    selectedSection === sec
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Type your Full Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-medium"
              placeholder="e.g. Sofie Calderón"
            />
          </div>

          {/* Code Input */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Session Code:
            </label>
            <input
              type="text"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg uppercase font-mono font-bold tracking-widest text-center"
              placeholder="ENTER CODE"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-black text-xl py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200 mt-4"
          >
            {loading ? "Connecting..." : "Start"}
          </button>
        </form>
      </div>

      {/* Dev panel injection if you use it */}
      {children}
    </div>
  );
}
