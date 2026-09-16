"use client";
import { useState } from "react";
import { auth, db } from "../firebase"; // Check this path matches your setup
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function StudentLogin({ onJoinSuccess, setIsAdminMode }) {
  const [name, setName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !examCode.trim()) {
      setError("Please enter both your name and the exam code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Silent anonymous login
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      // 2. Register them in the active exam session in Firestore
      // Adjust this path if your db structure is slightly different
      await setDoc(doc(db, "exams", examCode.toUpperCase(), "students", uid), {
        studentName: name.trim(),
        joinedAt: new Date(),
        uid: uid,
      });

      // 3. Fire the callback to mount the ActiveExam component in page.js
      onJoinSuccess(name.trim(), examCode.toUpperCase(), uid);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Could not join. Check the exam code on the board.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h1 className="text-3xl font-black text-center text-slate-800 mb-2">
          Join Assessment
        </h1>
        <p className="text-center text-slate-500 mb-8 font-medium">
          Enter your name and the code on the board.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              First & Last Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-medium"
              placeholder="e.g. Sofie Calderón"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Exam Code
            </label>
            <input
              type="text"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg uppercase font-mono font-bold tracking-widest"
              placeholder="e.g. MATH123"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 shadow-lg shadow-blue-200 mt-4"
          >
            {loading ? "Connecting..." : "Start Exam"}
          </button>
        </form>

        {/* Secret teacher dashboard trigger */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsAdminMode(true)}
            className="text-xs font-bold text-slate-300 hover:text-slate-500 transition"
          >
            Teacher Access
          </button>
        </div>
      </div>
    </div>
  );
}
