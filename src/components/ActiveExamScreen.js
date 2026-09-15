import { appText } from "../data/content";
import NumberPad from "./NumberPad";

export default function ActiveExamScreen({
  currentQ,
  questionsAttempted,
  formatTime,
  timeLeft,
  showBehaviorMenu,
  setShowBehaviorMenu,
  setDemerits,
  demerits,
  currentInput,
  handlePadClick,
  handleBackspace,
  handleClear,
  showEndExamButton,
  handleFinishExam,
  handleSubmitQuestion,
  handlePassQuestion,
  handleTryHarder,
  handleSimulateCorrect,
  secondsOnCurrentQuestion,
  isTeacherTesting,
  canTriggerHarder,
  children,
}) {
  const showPassButton = isTeacherTesting || secondsOnCurrentQuestion >= 55;

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans relative">
      {children}

      {showBehaviorMenu && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 max-w-[90%]">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {appText.behavior.title}
            </h3>
            <div className="flex flex-col gap-3">
              {appText.behavior.options.map((reason) => (
                <button
                  key={reason}
                  onClick={() => {
                    setDemerits([
                      ...demerits,
                      { reason, timestamp: new Date().toISOString() },
                    ]);
                    setShowBehaviorMenu(false);
                  }}
                  className="bg-red-50 text-red-700 p-4 rounded-xl font-bold text-left hover:bg-red-100 transition active:scale-95 border border-red-100"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowBehaviorMenu(false)}
              className="mt-6 w-full text-slate-500 font-bold p-3 hover:bg-slate-100 rounded-xl transition"
            >
              {appText.behavior.cancel}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-white px-8 py-4 shadow-sm border-b">
        <h2
          className="text-2xl font-bold text-slate-500 cursor-pointer select-none"
          onDoubleClick={() => setShowBehaviorMenu(true)}
        >
          Question {questionsAttempted + 1}
        </h2>
        <div className="text-2xl font-mono font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-lg">
          {formatTime(timeLeft)}
        </div>
      </div>

      {isTeacherTesting && (
        <div className="w-full flex justify-center mt-4">
          <button
            onClick={handleSimulateCorrect}
            className="bg-purple-100 text-purple-700 border border-purple-300 px-4 py-1 rounded text-sm font-bold active:scale-95 transition"
          >
            {appText.active.simulateBtn}
          </button>
        </div>
      )}

      <div className="w-full flex justify-center mt-4 h-10">
        {canTriggerHarder ? (
          <button
            onClick={handleTryHarder}
            className="bg-orange-100 text-orange-700 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-orange-200 active:scale-95 transition animate-fade-in border border-orange-200"
          >
            {appText.active.harderBtn}
          </button>
        ) : showPassButton ? (
          <button
            onClick={handlePassQuestion}
            className="bg-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold shadow-sm hover:bg-slate-300 active:scale-95 transition animate-fade-in"
          >
            {appText.active.passBtn}
          </button>
        ) : null}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* QUESTION DISPLAYED FIRST */}
        <div className="text-5xl font-extrabold text-slate-800 tracking-wider bg-white px-12 py-8 rounded-2xl shadow-sm border-2 border-slate-200 mb-6 max-w-3xl">
          {currentQ.question}
        </div>
        {/* INSTRUCTION MOVED BELOW */}
        <p className="text-lg text-blue-600 max-w-lg font-medium">
          {currentQ.instruction}
        </p>
      </div>

      <div className="flex flex-col items-center bg-white pb-8 pt-4 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="w-full max-w-md px-6 mb-6">
          <div className="bg-slate-100 border-b-4 border-blue-500 h-20 rounded-t-lg flex items-center justify-end px-4 text-5xl font-bold text-slate-800 tracking-widest overflow-hidden">
            {currentInput || <span className="text-slate-300">_</span>}
          </div>
        </div>

        <NumberPad
          onPadClick={handlePadClick}
          onBackspace={handleBackspace}
          onClear={handleClear}
        />

        <div className="w-full max-w-md px-6 flex gap-4">
          {showEndExamButton && (
            <button
              onClick={handleFinishExam}
              className="w-1/3 py-5 rounded-xl text-xl font-bold shadow-md bg-red-100 text-red-700 hover:bg-red-200 active:scale-95 transition-all"
            >
              End Exam
            </button>
          )}
          <button
            onClick={handleSubmitQuestion}
            disabled={!currentInput}
            className={`py-5 rounded-xl text-2xl font-bold shadow-md transition-all ${showEndExamButton ? "w-2/3" : "w-full"} ${currentInput ? "bg-green-500 text-white hover:bg-green-600 active:scale-95" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Submit Answer
          </button>
        </div>
      </div>
    </div>
  );
}
