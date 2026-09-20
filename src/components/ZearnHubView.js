import React from "react";

export default function ZearnHubView({ onBack }) {
  const handleLaunchZearn = () => {
    const width = Math.min(1280, window.screen.availWidth * 0.95);
    const height = Math.min(850, window.screen.availHeight * 0.92);
    const left = (window.screen.availWidth - width) / 2;
    const top = (window.screen.availHeight - height) / 2;

    window.open(
      "https://www.zearn.org/users/sign_in",
      "ZearnMathWorkspace",
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=yes`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-xl w-full p-8 md:p-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 text-center relative">
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
        >
          ← Back to Menu
        </button>

        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-black text-3xl rounded-3xl flex items-center justify-center mx-auto mb-4 mt-2 shadow-inner">
          Z
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Zearn Math Classroom
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
          Launch your focused math workspace to work on your daily digital lessons, fluency sprints, and Tower of Power.
        </p>

        <div className="space-y-4">
          <button
            onClick={handleLaunchZearn}
            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Launch Zearn Workspace</span>
            <span className="text-sm">↗</span>
          </button>

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800 text-left">
            <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              💡 Student Instructions:
            </p>
            <ul className="text-[11px] text-zinc-500 dark:text-zinc-400 list-disc list-inside mt-1 space-y-0.5">
              <li>Click the green button above to open your lesson.</li>
              <li>Sign in with your standard username and password.</li>
              <li>When you finish, close the window to return here.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
