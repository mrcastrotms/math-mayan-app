"use client";
import { useState, useEffect, useRef } from "react";
import { auth, db } from "../firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useAppTheme } from "../hooks/useAppTheme";
import { useExamBypass } from "../hooks/useExamBypass";
import { handleMasterBypass } from "../utils/bypassUtils";
import { START_SCREEN_COPY } from "../utils/themeStyles";
import ThemeToggle from "./ThemeToggle";

export default function StartScreen({
  setIsAdminMode,
  onJoinSuccess,
  availableSections = ["4A", "4B", "4C", "4D", "4E", "5B"],
  isLoading = false,
  children,
}) {
  const [name, setName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal visibility state
  const [showTeacherModal, setShowTeacherModal] = useState(false);

  const { theme, changeTheme, getThemeClasses } = useAppTheme();
  const styles = getThemeClasses();

  useExamBypass(onJoinSuccess);

  const handleStart = async (e) => {
    e.preventDefault();
    const cleanCode = examCode.trim().toUpperCase().replace(/\s+/g, "");

    if (
      handleMasterBypass({
        cleanCode,
        name,
        selectedSection,
        availableSections,
        onJoinSuccess,
        setError,
      })
    )
      return;

    if (!name.trim() || !cleanCode || !selectedSection) {
      setError(
        "Please select your section, type your name, and enter the code.",
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInAnonymously(auth);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "exams", cleanCode, "students", uid), {
        studentName: name.trim(),
        section: selectedSection,
        joinedAt: new Date(),
        uid: uid,
      });

      onJoinSuccess(name.trim(), cleanCode, uid, selectedSection);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Could not join. Check the exam code on the board.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSubmit = (code) => {
    const cleanPin = (code || "").trim();
    if (cleanPin === "0801196604650") {
      setIsAdminMode(true);
    } else if (cleanPin) {
      setError("Access Denied: Invalid Teacher Code.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative transition-colors duration-200 ${styles.bg}`}
    >
      {/* Teacher PIN Modal */}
      <PinModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onSubmit={handleTeacherSubmit}
        title=""
        placeholder="Access Code"
      />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <ThemeToggle theme={theme} changeTheme={changeTheme} />
        <button
          type="button"
          onClick={() => {
            setError("");
            setShowTeacherModal(true);
          }}
          className={styles.teacherBtn}
        >
          {START_SCREEN_COPY.teacherButton}
        </button>
      </div>

      <div
        className={`w-full max-w-xl rounded-2xl shadow-xl p-8 border mt-16 transition-colors duration-200 ${styles.card}`}
      >
        <h1 className={styles.title}>{START_SCREEN_COPY.title}</h1>
        <p className={styles.subtitle}>{START_SCREEN_COPY.subtitle}</p>

        <form onSubmit={handleStart} className="space-y-6">
          <div>
            <label className={styles.labelCenter}>
              {START_SCREEN_COPY.sectionLabel}
            </label>
            <div className="flex flex-wrap justify-center gap-3">
              {isLoading
                ? [1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className={styles.skeletonBtn} />
                  ))
                : availableSections.map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSelectedSection(sec)}
                      className={
                        selectedSection === sec
                          ? styles.activeSectionBtn
                          : styles.sectionBtn
                      }
                    >
                      {sec}
                    </button>
                  ))}
            </div>
          </div>

          <div>
            <label className={styles.labelDefault}>
              {START_SCREEN_COPY.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="off"
              className={styles.input}
              placeholder={START_SCREEN_COPY.namePlaceholder}
            />
          </div>

          <div>
            <label className={styles.labelDefault}>
              {START_SCREEN_COPY.codeLabel}
            </label>
            <input
              type="text"
              value={examCode}
              onChange={(e) => setExamCode(e.target.value)}
              autoComplete="off"
              className={`${styles.input} uppercase font-mono tracking-widest text-center`}
              placeholder={START_SCREEN_COPY.codePlaceholder}
            />
          </div>

          {error && <p className={styles.errorBanner}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading
              ? START_SCREEN_COPY.submitLoading
              : START_SCREEN_COPY.submitIdle}
          </button>
        </form>
      </div>

      {children}
    </div>
  );
}

function PinModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "Enter PIN",
}) {
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(pin);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-xl font-black text-slate-800 mb-4 text-center">
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            ref={inputRef}
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl font-mono tracking-widest text-slate-900"
            placeholder={placeholder}
          />

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
