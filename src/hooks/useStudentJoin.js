// src/hooks/useStudentJoin.js
import { useState } from "react";
import { auth, db } from "../firebase";
import { signInAnonymously } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { handleMasterBypass } from "../utils/bypassUtils";

export function useStudentJoin({ availableSections, onJoinSuccess }) {
  const [name, setName] = useState("");
  const [examCode, setExamCode] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      // 1. Session record in the exam subcollection
      await setDoc(doc(db, "exams", cleanCode, "students", uid), {
        studentName: resolvedName,
        section: selectedSection,
        joinedAt: new Date(),
        uid,
      });

      // 2. Real-time active presence record for the live jail monitor
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
  };
}
