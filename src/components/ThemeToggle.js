"use client";
export default function ThemeToggle({ theme, changeTheme }) {
  return (
    <div className="flex gap-2 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-xl shadow-sm border border-slate-200 backdrop-blur-sm">
      <button
        type="button"
        onClick={() => changeTheme("default")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${theme === "default" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
      >
        Standard
      </button>
      <button
        type="button"
        onClick={() => changeTheme("sepia")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${theme === "sepia" ? "bg-amber-700 text-amber-50" : "text-amber-900 hover:bg-amber-100"}`}
      >
        Sepia
      </button>
      <button
        type="button"
        onClick={() => changeTheme("contrast")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${theme === "contrast" ? "bg-white text-black" : "text-slate-300 hover:bg-slate-800"}`}
      >
        High Contrast
      </button>
    </div>
  );
}
