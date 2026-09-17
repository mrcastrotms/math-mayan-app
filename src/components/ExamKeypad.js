export default function ExamKeypad({
  handlePadClick,
  handleBackspace,
  handleClear,
  handlePassQuestion,
  handleSubmitQuestion,
}) {
  return (
    <>
      <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num) => (
          <button
            key={num}
            onClick={() => handlePadClick(num.toString())}
            className="bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xl py-3 rounded-xl hover:bg-slate-100 transition active:scale-95"
          >
            {num}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-lg py-3 rounded-xl hover:bg-amber-100 transition"
        >
          ⌫
        </button>
        <button
          onClick={handleClear}
          className="bg-rose-50 border border-rose-200 text-rose-700 font-bold text-lg py-3 rounded-xl hover:bg-rose-100 transition"
        >
          C
        </button>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={handlePassQuestion}
          className="px-6 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition"
        >
          Pass
        </button>
        <button
          onClick={handleSubmitQuestion}
          className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition"
        >
          Submit Answer
        </button>
      </div>
    </>
  );
}
