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
    ) {
      return;
    }

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

  const handleTeacherLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user.email?.includes("cesar015.2016")) {
        setIsAdminMode(true);
      } else {
        await signOut(auth);
        setError("Access Denied: You are not authorized.");
      }
    } catch (err) {
      setError("Failed to verify teacher account.");
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center p-4 relative transition-colors duration-200 ${styles.bg}`}
    >
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <ThemeToggle theme={theme} changeTheme={changeTheme} />
        <button
          type="button"
          onClick={handleTeacherLogin}
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
