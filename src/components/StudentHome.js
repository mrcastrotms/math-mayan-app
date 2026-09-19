import React from "react";

export default function StudentHome({ studentName, section, onSelectMode }) {
  const handleResetSession = () => {
  if (typeof window !== 'undefined') {
    const resetCount = parseInt(localStorage.getItem('session_resets') || '0', 10);
    
    const forceLogout = () => {
      // 1. Save the counter before we nuke everything
      const savedResets = localStorage.getItem('session_resets');
      
      // 2. Nuke all login tokens so they lose access
      localStorage.clear();
      sessionStorage.clear();
      
      // 3. Put the counter back
      if (savedResets) localStorage.setItem('session_resets', savedResets);
      
      // 4. Sledgehammer reload (forces React to drop the Welcome screen)
      window.location.href = '/';
    };

    if (resetCount >= 2) {
      const override = prompt('Session reset limit reached. Ask Mr. Castro to enter the override PIN:');
      if (override === '4040') {
        forceLogout();
      } else if (override !== null) {
        alert('Incorrect PIN.');
      }
      return;
    }

    // Normal reset: increment the counter and force logout
    localStorage.setItem('session_resets', (resetCount + 1).toString());
    forceLogout();
  }
};



  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-2xl w-full p-10 bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-center relative">
        <button
          onClick={handleResetSession}
          className="absolute top-4 right-4 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-md border border-red-200 dark:border-red-900/50"
        >
          Reset Session
        </button>
        <h1 className="text-3xl font-bold mb-2 text-zinc-900 dark:text-zinc-100">Welcome, {studentName}!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Section: {section}</p>

        <div className="mb-8 text-left">
          <h2 className="text-lg font-semibold mb-4 text-zinc-800 dark:text-zinc-200">What do you want to do today?</h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onSelectMode("classwork")}
            className="p-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg font-medium text-emerald-700 dark:text-emerald-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Classwork Practice</div>
              <div className="text-xs opacity-80">Interactive guided problems and scaffolds</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-emerald-200 dark:bg-emerald-800 rounded-full">Interactive</span>
          </button>

          <button
            onClick={() => onSelectMode("exam")} data-testid="start-exam-button"
            className="p-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg font-medium text-blue-700 dark:text-blue-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Timed Exam / Assessment</div>
              <div className="text-xs opacity-80">Secured test environment with timer and demerit tracking</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-blue-200 dark:bg-blue-800 rounded-full">Graded</span>
          </button>

          <button
            onClick={() => onSelectMode("studyguide")}
            className="p-4 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg font-medium text-amber-700 dark:text-amber-300 transition-all text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold">Study Guide and Review</div>
              <div className="text-xs opacity-80">Self-paced practice materials and concepts</div>
            </div>
            <span className="text-xs px-2.5 py-1 bg-amber-200 dark:bg-amber-800 rounded-full">Review</span>
          </button>
        </div>
      </div>
    </div>
  );
}
