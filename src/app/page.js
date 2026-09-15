"use client";

import { useState, useEffect } from "react";

export default function ExamApp() {
  const [examStarted, setExamStarted] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [overrideCode, setOverrideCode] = useState("");

  const CORRECT_PIN = "2026"; // You can change this teacher pin later

  // This monitors if the student leaves the tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && examStarted) {
        setIsLocked(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted]);

  // Forces the browser into fullscreen
  const startExam = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
    setExamStarted(true);
  };

  // Unlocks the exam if the teacher enters the correct PIN
  const handleUnlock = () => {
    if (overrideCode === CORRECT_PIN) {
      setIsLocked(false);
      setOverrideCode("");
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      alert("Incorrect PIN");
    }
  };

  // THE PENALTY SCREEN
  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-600 text-white p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Exam Locked ⚠️</h1>
        <p className="text-xl mb-8">
          You left the testing environment. Do not close this page. Please raise
          your hand for the teacher.
        </p>
        <input
          type="password"
          placeholder="Teacher Override PIN"
          value={overrideCode}
          onChange={(e) => setOverrideCode(e.target.value)}
          className="text-black p-2 rounded mb-4"
        />
        <button
          onClick={handleUnlock}
          className="bg-white text-red-600 px-6 py-2 rounded font-bold"
        >
          Unlock Exam
        </button>
      </div>
    );
  }

  // THE START SCREEN
  if (!examStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8 text-center">
        <h1 className="text-4xl font-bold text-blue-800 mb-4">
          Math Assessment: Week 1.6
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-md">
          Instructions: Do not leave this site or minimize the window. Doing so
          will lock your exam. You will need a pencil and grid paper to solve
          the problems.
        </p>
        <button
          onClick={startExam}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-2xl font-bold shadow-lg hover:bg-blue-700 transition"
        >
          Start Exam
        </button>
      </div>
    );
  }

  // THE EXAM INTERFACE (Placeholder for the math questions)
  return (
    <div className="min-h-screen bg-white p-8">
      <h2 className="text-3xl font-bold text-gray-800 border-b-2 pb-4 mb-8">
        Question 1
      </h2>
      <p className="text-xl text-gray-600">
        The math questions and number pad will go here...
      </p>
    </div>
  );
}
