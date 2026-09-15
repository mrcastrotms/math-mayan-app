import { appText } from "../data/content";

export default function FinishedScreen({
  student,
  selectedSection,
  finalScore,
  isSaving,
  handleTryAgain,
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-center p-8 relative">
      {children}
      <h2 className="text-5xl font-bold text-green-700 mb-6">
        {appText.finished.title}
      </h2>
      <p className="text-3xl font-bold text-blue-800 mb-2">
        {student?.displayName} - {selectedSection}
      </p>
      <p className="text-3xl font-bold text-slate-800 mb-4">
        {appText.finished.finalScoreLabel} {finalScore}
      </p>

      {isSaving ? (
        <p className="text-xl text-orange-600 font-bold mb-8 animate-pulse">
          {appText.finished.saving}
        </p>
      ) : (
        <p className="text-xl text-green-600 font-bold mb-8">
          {appText.finished.saved}
        </p>
      )}

      <p className="text-2xl text-slate-700 mb-8">
        {appText.finished.instructions}
      </p>

      <button
        onClick={handleTryAgain}
        className="bg-blue-600 text-white px-10 py-4 rounded-xl text-2xl font-bold shadow-md hover:bg-blue-700 transition active:scale-95 mb-8"
      >
        {appText.finished.tryAgainBtn}
      </button>
    </div>
  );
}
