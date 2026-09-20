// src/components/SessionGeneratorCard.js
export default function SessionGeneratorCard({
  generatedCode,
  selectedSessionSection,
  setSelectedSessionSection,
  selectedActivityType,
  setSelectedActivityType,
  activityOptions,
  availableSections,
  isGenerating,
  onGenerateCode,
  onResetSession,
}) {
  return (
    <div className="flex-1 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-[var(--app-fg)] shadow-2xl flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-2">Session</h2>
        <p className="text-slate-400 mb-4 text-sm">Generate a secure code</p>
      </div>

      {generatedCode ? (
        <div className="flex flex-col gap-4 my-4">
          <div className="bg-slate-900 p-6 rounded-xl border-2 border-blue-500 shadow-inner flex flex-col justify-center items-center">
            <p className="text-xs text-yellow-400 mb-1 uppercase tracking-widest font-bold">
              {selectedActivityType}
            </p>
            <p className="text-sm text-slate-400 mb-1 uppercase tracking-widest font-bold">
              Section {selectedSessionSection}
            </p>
            <p className="text-6xl font-mono tracking-widest text-green-400 text-center select-all">
              {generatedCode}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onResetSession}
              className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold rounded-xl transition active:scale-95 cursor-pointer"
            >
              ← End / Change Session
            </button>
            <button
              type="button"
              onClick={onGenerateCode}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? "..." : "Roll New Code"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 my-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Activity
            </label>
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value)}
              className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700 font-bold focus:outline-none focus:border-blue-500"
            >
              {activityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Class Section
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSections.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSessionSection(sec)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition ${
                    selectedSessionSection === sec
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onGenerateCode}
            disabled={!selectedSessionSection || isGenerating}
            className={`mt-2 px-8 py-3 rounded-xl text-xl font-bold transition shadow-lg ${
              isGenerating
                ? "bg-slate-500 text-slate-300 cursor-not-allowed"
                : selectedSessionSection
                  ? "bg-blue-600 text-white hover:bg-blue-700 active:scale-95 cursor-pointer"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isGenerating ? "Connecting" : "Generate"}
          </button>
        </div>
      )}
    </div>
  );
}
