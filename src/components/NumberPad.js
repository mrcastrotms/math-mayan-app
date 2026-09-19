export default function NumberPad({ onPadClick, onBackspace, onClear }) {
  const buttons = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"];

  return (
    <div className="w-full max-w-md px-6">
      <div className="grid grid-cols-3 max-w-xs mx-auto gap-2 grid-cols-3 gap-3 mb-3">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => (btn === "⌫" ? onBackspace() : onPadClick(btn))}
            className={`py-4 rounded-xl text-2xl font-bold shadow-sm active:scale-95 transition-all ${
              btn === "⌫"
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {btn}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        className="w-full py-4 rounded-xl text-xl font-bold shadow-sm bg-slate-200 text-slate-600 hover:bg-slate-300 active:scale-95 transition-all mb-4"
      >
        CLEAR
      </button>
    </div>
  );
}
