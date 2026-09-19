export default function ClassManagerCard({
  availableSections,
  onAddSection,
  onDeleteSection,
}) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-700 mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">
        Class Sections
      </h2>
      <p className="text-slate-400 mb-6 text-sm">
        Add or remove class sections
      </p>
      <div className="flex flex-wrap gap-4 items-center">
        {availableSections.map((sec) => (
          <div
            key={sec}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-3 font-bold border border-slate-600"
          >
            {sec}
            <button
              onClick={() => onDeleteSection(sec)}
              className="text-red-400 hover:text-red-300 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={onAddSection}
          className="bg-slate-900 text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-700 border border-dashed border-slate-500 transition"
        >
          Add
        </button>
      </div>
    </div>
  );
}
