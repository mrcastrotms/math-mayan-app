// src/hooks/useStudentSessionForm.js
import { useState } from "react";
import { matchStudentToRoster } from "../utils/rosterUtils";

export function useStudentSessionForm({ onJoin, verifyAndStart } = {}) {
  const [student, setStudent] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [sessionCodeInput, setSessionCodeInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [customStudentName, setCustomStudentName] = useState("");
  const [showBehaviorMenu, setShowBehaviorMenu] = useState(false);
  const [activeActivityType, setActiveActivityType] =
    useState("Assessment / Exam");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!selectedSection) {
      setErrorMsg("Please select your class section first.");
      return;
    }
    if (!customStudentName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const match = matchStudentToRoster(customStudentName, selectedSection);

    if (!match?.matched) {
      if (match?.error === "ambiguous") {
        setErrorMsg(
          `Multiple matches (${match.candidates.join(", ")}). Enter full name.`,
        );
      } else {
        setErrorMsg(
          "Name not recognized on class roster. Check your spelling.",
        );
      }
      return;
    }

    const canonicalName = match.officialName;
    const studentPayload = {
      name: canonicalName,
      code: sessionCodeInput.trim(),
      section: selectedSection,
      uid: `${selectedSection}_${canonicalName.replace(/\s+/g, "_")}`,
    };

    setStudent(studentPayload);
    onJoin?.(studentPayload);

    if (verifyAndStart && sessionCodeInput.trim()) {
      verifyAndStart(sessionCodeInput.trim(), selectedSection);
    }
  };

  return {
    student,
    setStudent,
    hintsUsed,
    setHintsUsed,
    sessionCodeInput,
    setSessionCodeInput,
    selectedSection,
    setSelectedSection,
    customStudentName,
    setCustomStudentName,
    showBehaviorMenu,
    setShowBehaviorMenu,
    activeActivityType,
    setActiveActivityType,
    errorMsg,
    setErrorMsg,
    handleSubmit,
  };
}
