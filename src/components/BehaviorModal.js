export default function BehaviorModal({ isOpen, onClose, onAddDemerit }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 behavior-modal"
      role="dialog"
    >
      <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-xl font-black text-slate-800 mb-4 text-center">
          Demerits
        </h3>
        <div className="space-y-3">
          <button
            data-testid="infraction-btn"
            onClick={onAddDemerit}
            className="w-full bg-red-50 text-red-700 border border-red-200 font-bold py-3 rounded-xl hover:bg-red-100 transition text-left px-4"
          >
            Off-Task
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
