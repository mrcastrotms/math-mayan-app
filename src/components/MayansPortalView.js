import React, { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../firebase";

const COURSE_SECTIONS = {
  53: [
    { label: "Week 1.1", section: "2" },
    { label: "Week 1.2", section: "3" },
    { label: "Week 1.3", section: "4" },
    { label: "Week 1.4", section: "5" },
    { label: "Week 1.5", section: "6" },
    { label: "Sept 8-12", section: "11" },
    { label: "Sept 15-19", section: "12" },
  ],
  65: [
    { label: "Quarter 1 Overview", section: "1" },
    { label: "August 10-14", section: "2" },
    { label: "August 17-21", section: "3" },
    { label: "August 24-28", section: "4" },
    { label: "Aug 31 - Sept 4", section: "5" },
    { label: "Sept. 7-11", section: "6" },
    { label: "Sept. 14-18", section: "7" },
    { label: "Sept. 21-25", section: "8" },
    { label: "Sept 28 - Oct 2", section: "9" },
    { label: "October 5-9", section: "10" },
  ],
};

const FALLBACK_COOKIE = "7d9d2223b1f68bfd7d5e7dccd9444ebb";

export default function MayansPortalView({ onBack, studentName, section }) {
  // Auto-detect grade course ID based on student section (e.g. "5A" -> 65, "4B" -> 53)
  const isFifthGrade = String(section || "").trim().startsWith("5");
  const initialCourseId = isFifthGrade ? "65" : "53";
  const initialSectionId = isFifthGrade ? "1" : "6";

  const [moodleSession, setMoodleSession] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId);
  const [selectedSection, setSelectedSection] = useState(initialSectionId);
  const [showTeacherConfig, setShowTeacherConfig] = useState(false);
  const [inputCookie, setInputCookie] = useState("");
  const [loading, setLoading] = useState(true);

  // Real-time Firestore sync via onSnapshot
  useEffect(() => {
    const docRef = doc(db, "settings", "moodle");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().session) {
          const liveCookie = docSnap.data().session;
          setMoodleSession(liveCookie);
          setInputCookie(liveCookie);
        } else {
          setMoodleSession(FALLBACK_COOKIE);
          setInputCookie(FALLBACK_COOKIE);
        }
        setLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setMoodleSession(FALLBACK_COOKIE);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleOpenAdmin = () => {
    if (showTeacherConfig) {
      setShowTeacherConfig(false);
      return;
    }
    const pin = prompt("Enter Teacher Override PIN:");
    if (pin === "4040") {
      setShowTeacherConfig(true);
    } else if (pin !== null) {
      alert("Incorrect PIN.");
    }
  };

  const handleSaveGlobalCookie = async (e) => {
    e.preventDefault();
    try {
      const cleanCookie = inputCookie.trim();
      await setDoc(doc(db, "settings", "moodle"), {
        session: cleanCookie,
        updatedAt: new Date().toISOString(),
        updatedBy: studentName || "Teacher",
      });
      alert("Session updated in Firestore! All active screens updated in real-time.");
      setShowTeacherConfig(false);
    } catch (err) {
      alert("Error updating Firestore: " + err.message);
    }
  };

  const handleCourseChange = (newId) => {
    setSelectedCourseId(newId);
    setSelectedSection(COURSE_SECTIONS[newId][0].section);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl w-full p-6 md:p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 relative">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            ← Back to Menu
          </button>
          <button
            onClick={handleOpenAdmin}
            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-md border border-indigo-200 dark:border-indigo-900"
          >
            🔐 {showTeacherConfig ? "Close Admin Panel" : "Teacher Admin Panel"}
          </button>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100 text-center">
          Mayans Are Learning Portal
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-center mb-4 text-sm">
          {selectedCourseId === "65" ? "5th Grade Mathematics" : "4th Grade Mathematics"} — Live Moodle Course Content
        </p>

        {showTeacherConfig && (
          <form
            onSubmit={handleSaveGlobalCookie}
            className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col gap-3"
          >
            <label className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
              Update Active Moodle Session Cookie (Syncs globally to all screens via Firestore):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputCookie}
                onChange={(e) => setInputCookie(e.target.value)}
                placeholder="Paste new MoodleSession hash here..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow"
              >
                Push to Firestore
              </button>
            </div>
          </form>
        )}

        {/* Grade Tabs */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={() => handleCourseChange("53")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedCourseId === "53"
                ? "bg-emerald-600 text-white shadow"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Math 4th Grade
          </button>
          <button
            onClick={() => handleCourseChange("65")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedCourseId === "65"
                ? "bg-blue-600 text-white shadow"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Math 5th Grade (Q1)
          </button>
        </div>

        {/* Section Selector Buttons */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {COURSE_SECTIONS[selectedCourseId]?.map((wk) => (
            <button
              key={wk.section}
              onClick={() => setSelectedSection(wk.section)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedSection === wk.section
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {wk.label}
            </button>
          ))}
        </div>

        {/* Dynamic Proxy Iframe Window */}
        <div className="relative w-full h-[650px] rounded-xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner">
          {!loading && moodleSession ? (
            <iframe
              key={`${selectedCourseId}-${selectedSection}`}
              className="w-full h-full border-0"
              src={`/api/proxy-moodle?id=${selectedCourseId}&section=${selectedSection}&session=${moodleSession}`}
              title="Mayans Are Learning Portal"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-zinc-500">
              <p className="mb-2 font-medium">Connecting to Firestore...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
