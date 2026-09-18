// src/hooks/useStudentJoin.js
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { handleMasterBypass } from "../utils/bypassUtils";
import { matchStudentToRoster } from "../utils/rosterUtils";

export function useStudentJoin({ availableSections, onJoinSuccess }) {
  const [selectedSection, setSelectedSection] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("exam_student_section") || "";
    }
    return "";
  });

  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("exam_student_name") || "";
      const savedSection = localStorage.getItem("exam_student_section") || "";
      if (savedName && savedSection) {
        const match = matchStudentToRoster(savedName, savedSection);
        if (match?.matched) {
          return match.officialName;
        }
      }
      return savedName;
    }
    return "";
  });

  const [examCode, setExamCode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("exam_code") || "";
    }
    return "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (name) localStorage.setItem("exam_student_name", name);
      else localStorage.removeItem("exam_student_name");
    }
  }, [name]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedSection)
        localStorage.setItem("exam_student_section", selectedSection);
      else localStorage.removeItem("exam_student_section");
    }
  }, [selectedSection]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (examCode) localStorage.setItem("exam_code", examCode);
      else localStorage.removeItem("exam_code");
    }
  }, [examCode]);

  const clearSavedIdentity = () => {
    setName("");
    setSelectedSection("");
    setExamCode("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("exam_student_name");
      localStorage.removeItem("exam_student_section");
      localStorage.removeItem("exam_code");
    }
  };

  const handleStart = async (e, overrideName) => {
    e?.preventDefault?.();
    const resolvedName = (overrideName || name || "").trim();
    const cleanCode = examCode.trim().toUpperCase().replace(/\s+/g, "");

    if (
      handleMasterBypass({
        cleanCode,
        name: resolvedName,
        selectedSection,
        availableSections,
        onJoinSuccess,
        setError,
      })
    ) {
      return;
    }

    if (!resolvedName || !cleanCode || !selectedSection) {
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
        studentName: resolvedName,
        section: selectedSection,
        joinedAt: new Date(),
        uid,
      });

      await setDoc(doc(db, "activeSessions", uid), {
        uid,
        name: resolvedName,
        section: selectedSection,
        code: cleanCode,
        isLocked: false,
        currentQuestionIndex: 0,
        lastHeartbeat: serverTimestamp(),
      });

      onJoinSuccess(resolvedName, cleanCode, uid, selectedSection);
    } catch (err) {
      console.error("Auth error:", err);
      setError("Could not join. Check the exam code on the board.");
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    setName,
    examCode,
    setExamCode,
    selectedSection,
    setSelectedSection,
    loading,
    error,
    setError,
    handleStart,
    clearSavedIdentity,
  };
}
