"use client";
export default function ThemeToggle({ theme, changeTheme, disabled = false }) {
  const themes = [
    ["default", "Standard"],
    ["dark", "Dark"],
    ["sepia", "Sepia"],
    ["contrast", "High Contrast"],
  ];

  return (
    <div
      className="flex flex-wrap gap-2 bg-white/80 dark:bg-slate-800/80 p-1.5 rounded-xl shadow-sm border border-slate-200 backdrop-blur-sm"
      aria-label={disabled ? "Theme locked by teacher" : "Choose theme"}
    >
      {themes.map(([value, label]) => (
      <button
        key={value}
        type="button"
        disabled={disabled}
        aria-pressed={theme === value}
        onClick={() => changeTheme(value)}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60 ${theme === value ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
      >
        {label}
      </button>
      ))}
      {disabled && <span className="sr-only">Theme locked by teacher</span>}
    </div>
  );
}
