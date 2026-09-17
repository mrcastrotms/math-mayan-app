import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const ACTIVITY_OPTIONS = ["Classwork", "Quiz", "Assessment", "Test", "Exam"];
const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function useTeacherSession() {
  const [generatedCode, setGeneratedCode] = useState("");
  const [selectedSessionSection, setSelectedSessionSection] = useState("");
  const [selectedActivityType, setSelectedActivityType] =
    useState("Assessment / Exam");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = async () => {
    if (!selectedSessionSection) return;
    setIsGenerating(true);

    let code = "";
    for (let i = 0; i < 5; i++) {
      code += CODE_CHARS.charAt(Math.floor(Math.random() * CODE_CHARS.length));
    }

    const durationSeconds =
      selectedActivityType === "Classwork" || selectedActivityType === "Quiz"
        ? 600
        : 2400;

    try {
      await addDoc(collection(db, "exam_sessions"), {
        code,
        section: selectedSessionSection,
        activityType: selectedActivityType,
        duration: durationSeconds,
        createdAt: serverTimestamp(),
        active: true,
      });

      setGeneratedCode(code);
    } catch (e) {
      console.error("Failed to start session:", e);
      alert("Database error. Try generating again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetSession = () => {
    setGeneratedCode("");
  };

  return {
    activityOptions: ACTIVITY_OPTIONS,
    generatedCode,
    selectedSessionSection,
    setSelectedSessionSection,
    selectedActivityType,
    setSelectedActivityType,
    isGenerating,
    generateCode,
    resetSession,
  };
}
