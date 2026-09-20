import React, { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function StudentHome({ studentName, section, onSelectMode }) {
  const [currentView, setCurrentView] = useState("menu");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState({
    id: "jNQXAC9IVRw",
    title: "Me at the zoo (First YouTube Video)",
  });

  const [moodleSession, setMoodleSession] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("53"); // "53" for Math 4th, "65" for Math 5th
  const [selectedSection, setSelectedSection] = useState("6"); // Default section
  const [showTeacherConfig, setShowTeacherConfig] = useState(false);
  const [inputCookie, setInputCookie] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGlobalSession() {
      try {
        const docRef = doc(db, "settings", "moodle");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().session) {
          const liveCookie = docSnap.data().session;
          setMoodleSession(liveCookie);
          setInputCookie(liveCookie);
        } else {
          setMoodleSession("7d9d2223b1f68bfd7d5e7dccd9444ebb");
          setInputCookie("7d9d2223b1f68bfd7d5e7dccd9444ebb");
        }
      } catch (err) {
        console.error("Error fetching global session:", err);
        setMoodleSession("7d9d2223b1f68bfd7d5e7dccd9444ebb");
      } finally {
        setLoading(false);
      }
    }
    fetchGlobalSession();
  }, []);

  const handleSaveGlobalCookie = async (e) => {
    e.preventDefault();
    try {
      const cleanCookie = inputCookie.trim();
      await setDoc(doc(db, "settings", "moodle"), {
        session: cleanCookie,
        updatedAt: new Date().toISOString(),
        updatedBy: studentName,
      });
      setMoodleSession(cleanCookie);
      alert("Moodle session successfully updated in Firestore!");
      setShowTeacherConfig(false);
    } catch (err) {
      alert("Error saving to Firestore: " + err.message);
    }
  };

  // Accurate sections for Math 4th (id=53) vs Math 5th Quarter 1 (id=65)
  const courseSections = {
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
    ],
  };

  const handleCourseChange = (newId) => {
    setSelectedCourseId(newId);
    setSelectedSection(courseSections[newId][0].section); // Default to first section of that course
  };

  const videoDatabase = [
    {
      id: "AmFMJC45f1Q",
      title: "Classroom Feature Video",
      tags: ["class", "featured", "math"],
    },
    {
      id: "dQw4w9WgXcQ",
      title: "Fun Intermission / Music",
      tags: ["music", "fun", "classic"],
    },
    {
      id: "kJQP7kiw5Fk",
      title: "Despacito (Music Video)",
      tags: ["music", "dog videos", "popular", "songs"],
    },
    {
      id: "jNQXAC9IVRw",
      title: "Me at the zoo (First YouTube Video)",
      tags: ["zoo", "animals", "dog videos", "history"],
    },
    {
      id: "9bZkp7q19f0",
      title: "PSY - GANGNAM STYLE",
      tags: ["gangnam", "dance", "music", "dog videos"],
    },
  ];

  const filteredVideos = videoDatabase.filter(
    (v) =>
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const handleResetSession = () => {
    if (typeof window !== "undefined") {
      const resetCount = parseInt(
        localStorage.getItem("session_resets") || "0",
        10,
      );
      const forceLogout = () => {
        const savedResets = localStorage.getItem("session_resets");
        localStorage.clear();
        sessionStorage.clear();
        if (savedResets) localStorage.setItem("session_resets", savedResets);
        window.location.href = "/";
      };
      if (resetCount >= 2) {
        const override = prompt(
          "Session reset limit reached. Ask Mr. Castro to enter the override PIN:",
        );
        if (override === "4040") {
          forceLogout();
        } else if (override !== null) {
          alert("Incorrect PIN.");
        }
        return;
      }
      localStorage.setItem("session_resets", (resetCount + 1).toString());
      forceLogout();
    }
  };

  if (currentView === "youtube") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-4xl w-full p-6 md:p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 relative">
          <button
            onClick={() => setCurrentView("menu")}
            className="absolute top-4 left-4 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            ← Back to Menu
          </button>
          <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100 text-center mt-4">
            YouTube Video Hub
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-6 text-sm">
            Search and watch educational and fun videos right inside the app.
          </p>
          <div className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search YouTube videos (e.g., dog videos, math, music)..."
              className="w-full px-4 py-3 text-sm rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-inner"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-inner">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1`}
                  title={activeVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg px-1">
                {activeVideo.title}
              </h3>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 max-h-[360px] overflow-y-auto space-y-2">
              <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                Search Results
              </h4>
              {filteredVideos.map((vid) => (
                <button
                  key={vid.id}
                  onClick={() => setActiveVideo(vid)}
                  className={`w-full text-left p-3 rounded-lg transition-all text-xs font-medium flex items-center justify-between ${
                    activeVideo.id === vid.id
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <span className="truncate pr-2">{vid.title}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${activeVideo.id === vid.id ? "bg-red-700 text-white" : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"}`}
                  >
                    Play
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "mayans") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
        <div className="max-w-6xl w-full p-6 md:p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 relative">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentView("menu")}
              className="text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
            >
              ← Back to Menu
            </button>
            <button
              onClick={() => setShowTeacherConfig(!showTeacherConfig)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-md border border-indigo-200 dark:border-indigo-900"
            >
              🔐{" "}
              {showTeacherConfig ? "Close Admin Panel" : "Teacher Admin Panel"}
            </button>
          </div>

          <h1 className="text-2xl font-bold mb-1 text-zinc-900 dark:text-zinc-100 text-center">
            Mayans Are Learning Portal
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-center mb-4 text-sm">
            Select a grade and week below to view live course materials.
          </p>

          {showTeacherConfig && (
            <form
              onSubmit={handleSaveGlobalCookie}
              className="mb-6 p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col gap-3"
            >
              <label className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                Update Active Moodle Session Cookie (Syncs globally to
                Firestore):
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

          {/* Grade / Course Selector Tabs */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => handleCourseChange("53")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedCourseId === "53"
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              4th Grade
            </button>
            <button
              onClick={() => handleCourseChange("65")}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                selectedCourseId === "65"
                  ? "bg-blue-600 text-white shadow"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              }`}
            >
              5th Grade
            </button>
          </div>

          {/* Week / Module Selector Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {courseSections[selectedCourseId].map((wk) => (
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
                <p className="mb-2 font-medium">
                  Loading session from Firestore...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl w-full p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-center relative">
        <button
          onClick={handleResetSession}
          className="absolute top-4 right-4 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900/50"
        >
          Reset Session
        </button>
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">
          Welcome, {studentName}!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Section: {section}
        </p>

        <div className="mb-8 text-left">
          <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">
            What do you want to do today?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onSelectMode("classwork")}
            className="p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium text-emerald-700 dark:text-emerald-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Classwork Practice</div>
              <div className="text-xs opacity-80">
                Interactive guided problems and scaffolds
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-200 dark:bg-emerald-800 rounded-full">
              Interactive
            </span>
          </button>

          <button
            onClick={() => onSelectMode("exam")}
            data-testid="start-exam-button"
            className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg font-medium text-blue-700 dark:text-blue-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Timed Exam / Assessment</div>
              <div className="text-xs opacity-80">
                Secured test environment with timer and demerit tracking
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-200 dark:bg-blue-800 rounded-full">
              Graded
            </span>
          </button>

          <button
            onClick={() => onSelectMode("studyguide")}
            className="p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg font-medium text-amber-700 dark:text-amber-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Study Guide and Review</div>
              <div className="text-xs opacity-80">
                Self-paced practice materials and concepts
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-200 dark:bg-amber-800 rounded-full">
              Review
            </span>
          </button>

          <button
            onClick={() => setCurrentView("youtube")}
            className="p-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg font-medium text-red-700 dark:text-red-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">YouTube Video Hub</div>
              <div className="text-xs opacity-80">
                Search and watch educational & fun videos
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-red-200 dark:bg-red-800 rounded-full">
              Video
            </span>
          </button>

          <button
            onClick={() => setCurrentView("mayans")}
            className="p-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg font-medium text-indigo-700 dark:text-indigo-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Mayans Are Learning</div>
              <div className="text-xs opacity-80">
                Official Moodle course viewer & grade switcher
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-200 dark:bg-indigo-800 rounded-full">
              Portal
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
