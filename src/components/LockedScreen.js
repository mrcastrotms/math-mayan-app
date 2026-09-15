import { appText } from "../data/content";

export default function LockedScreen({
  overrideCode,
  setOverrideCode,
  handleUnlock,
  children,
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-600 text-white p-8 text-center relative">
      {children}
      <h1 className="text-4xl font-bold mb-4">{appText.locked.title}</h1>
      <p className="text-xl mb-8">{appText.locked.message}</p>
      <input
        type="password"
        placeholder={appText.global.teacherPinPlaceholder}
        value={overrideCode}
        onChange={(e) => setOverrideCode(e.target.value)}
        className="text-black p-4 rounded mb-4 text-center text-2xl w-64"
      />
      <button
        onClick={handleUnlock}
        className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold text-xl transition active:scale-95"
      >
        {appText.locked.unlockBtn}
      </button>
    </div>
  );
}
