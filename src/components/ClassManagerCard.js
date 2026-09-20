export default function ClassManagerCard({
 availableSections,
 onAddSection,
 onDeleteSection,
}) {
 return (
 <div className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-[var(--app-fg)] shadow-2xl">
 <h2 className="text-2xl font-bold mb-4 text-purple-400">
 Class Sections
 </h2>
 <p className="mb-6 text-sm opacity-75">
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
 type="button"
 aria-label={`Delete section ${sec}`}
 title={`Delete section ${sec}`}
 onClick={() => onDeleteSection(sec)}
 className="text-red-400 hover:text-red-300 font-bold ml-2"
 >
 x
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
