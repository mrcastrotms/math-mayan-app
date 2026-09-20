// src/components/StartScreen.js
"use client";
import { useState } from "react";
import { useAppTheme } from "../hooks/useAppTheme";
import { useExamBypass } from "../hooks/useExamBypass";
import { useStudentJoin } from "../hooks/useStudentJoin";
import { matchStudentToRoster } from "../utils/rosterUtils";
import { START_SCREEN_COPY } from "../utils/themeStyles";
import ThemeToggle from "./ThemeToggle";
import PinModal from "./PinModal";
import StudentJoinCard from "./StudentJoinCard";

export default function StartScreen({
  setIsAdminMode,
  onJoinSuccess,
  availableSections = ["4A", "4B", "4C", "4D", "4E", "5B"],
  isLoading = false,
  children,
  themeState,
}) {
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const localThemeState = useAppTheme();
  const { theme, changeTheme, getThemeClasses, themeLocked } =
    themeState || localThemeState;

  const styles = getThemeClasses() || {};
  const bgClass = styles.bg || "bg-slate-900 text-white";
  const teacherBtnClass =
    styles.teacherBtn ||
    "text-xs font-bold text-slate-500 hover:text-slate-300 transition";

  useExamBypass(onJoinSuccess);

  const joinState = useStudentJoin({ availableSections, onJoinSuccess });

  const handleTeacherSubmit = (code) => {
    const cleanPin = (code || "").trim();
    if (cleanPin === "0801196604650") {
      setIsAdminMode(true);
    } else if (cleanPin) {
      joinState.setError("Access Denied: Invalid Teacher Code.");
    }
  };

  const handleRosterValidatedSubmit = (e) => {
    e?.preventDefault();
    joinState.setError("");

    if (!joinState.selectedSection) {
      joinState.setError("Please select your class section");
      return;
    }

    if (!joinState.name?.trim()) {
      joinState.setError("Please enter your full name.");
      return;
    }

    const match = matchStudentToRoster(
      joinState.name,
      joinState.selectedSection,
    );

    if (!match?.matched) {
      if (match?.error === "ambiguous") {
        joinState.setError(
          `Multiple matches found (${match.candidates.join(", ")}). Please enter your full name.`,
        );
      } else {
        joinState.setError(
          "Name not recognized on class roster. Check your spelling.",
        );
      }
      return;
    }

    joinState.setName(match.officialName);
    joinState.handleStart(e, match.officialName);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 relative transition-colors duration-200 ${bgClass}`}
    >
      <PinModal
        isOpen={showTeacherModal}
        onClose={() => setShowTeacherModal(false)}
        onSubmit={handleTeacherSubmit}
        title="Teacher Portal Access"
        placeholder="Access Code"
      />

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
        <ThemeToggle theme={theme} changeTheme={changeTheme} disabled={themeLocked} />
        {themeLocked && (
          <span role="status" className="sr-only">Theme locked by teacher</span>
        )}
        <button
          type="button"
          onClick={() => {
            joinState.setError("");
            setShowTeacherModal(true);
          }}
          className={teacherBtnClass}
        >
          {START_SCREEN_COPY?.teacherButton || "Teacher Access"}
        </button>
      </div>

      <StudentJoinCard
        styles={styles}
        name={joinState.name}
        setName={joinState.setName}
        examCode={joinState.examCode}
        setExamCode={joinState.setExamCode}
        selectedSection={joinState.selectedSection}
        setSelectedSection={joinState.setSelectedSection}
        availableSections={availableSections}
        isLoading={isLoading}
        loading={joinState.loading}
        error={joinState.error}
        onSubmit={handleRosterValidatedSubmit}
      />

      {children}
    </div>
  );
}
