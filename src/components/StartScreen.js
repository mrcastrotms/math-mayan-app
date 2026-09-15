import { useState } from "react";
import { appText } from "../data/content";

export default function StartScreen({
  student,
  setIsAdminMode,
  selectedSection,
  setSelectedSection,
  sessionCodeInput,
  setSessionCodeInput,
  handleVerifyAndStart,
  isValidatingCode,
  handleLogin,
  availableSections,
  customStudentName,
  setCustomStudentName,
  isTeacher,
  children,
}) {
  const [isHighContrast, setIsHighContrast] = useState(false);

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen p-8 text-center relative transition-colors duration-200 ${
        isHighContrast ? "bg-black text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      {children}

      {/* HIGH CONTRAST / ACCESSIBILITY TOGGLE */}
      <button
        onClick={() => setIsHighContrast(!isHighContrast)}
        className={`absolute top-6 right-6 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg transition z-50 ${
          isHighContrast
            ? "bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-300"
            : "bg-slate-800 text-yellow-400 border border-slate-700 hover:bg-slate-700"
        }`}
      >
        {isHighContrast ? "High Contrast: ON" : "High Contrast Mode"}
      </button>

      {isTeacher && (
        <div className="absolute top-6 left-6 flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 border border-slate-700">
          <span className="text-sm font-bold text-yellow-400">
            Teacher Account Detected
          </span>
          <button
            onClick={() => setIsAdminMode(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95 text-white"
          >
            Open Teacher Dashboard →
          </button>
        </div>
      )}

      <h1
        className={`text-5xl font-extrabold mb-6 ${isHighContrast ? "text-yellow-400" : "text-blue-900"}`}
      >
        {appText.global.title}
      </h1>

      {student ? (
        <div className="animate-fade-in w-full max-w-2xl">
          <p
            className={`text-2xl font-bold mb-6 ${isHighContrast ? "text-green-400" : "text-green-700"}`}
          >
            {appText.start.welcome} {student.displayName}
          </p>

          <div
            className={`p-8 rounded-2xl shadow-xl border mb-8 transition-colors ${
              isHighContrast
                ? "bg-zinc-950 border-yellow-500/80 text-white shadow-yellow-500/10"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <p
              className={`text-xl mb-4 font-bold ${isHighContrast ? "text-slate-200" : "text-slate-700"}`}
            >
              {appText.start.selectSection}
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-8">
              {availableSections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all shadow-md ${
                    selectedSection === section
                      ? "bg-blue-600 text-white ring-4 ring-blue-400 scale-105"
                      : isHighContrast
                        ? "bg-zinc-900 text-slate-300 border border-slate-700 hover:bg-zinc-800"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>

            {selectedSection && (
              <div
                className={`flex flex-col items-center gap-6 animate-fade-in pt-8 border-t ${isHighContrast ? "border-zinc-800" : "border-slate-100"}`}
              >
                {/* FULL NAME INPUT - HIGH CONTRAST & CRISP */}
                <div className="w-full">
                  <label
                    className={`block text-lg font-bold mb-2 text-left ${isHighContrast ? "text-yellow-300" : "text-slate-700"}`}
                  >
                    Type your Full Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Carlos Eduardo Gomez"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    className={`text-center text-2xl font-bold p-4 rounded-xl border-2 w-full focus:outline-none transition-colors ${
                      isHighContrast
                        ? "bg-zinc-900 text-white border-yellow-500 placeholder-zinc-500 focus:border-yellow-300"
                        : "bg-slate-50 text-slate-900 border-slate-400 placeholder-slate-400 focus:border-blue-600 shadow-inner"
                    }`}
                  />
                </div>

                {/* SESSION CODE INPUT - HIGH CONTRAST & BOLD */}
                <div className="w-full flex flex-col items-center">
                  <label
                    className={`block text-lg font-bold mb-2 text-left w-full ${isHighContrast ? "text-yellow-300" : "text-slate-700"}`}
                  >
                    {appText.start.enterCode}
                  </label>
                  <input
                    type="text"
                    placeholder="CODE"
                    value={sessionCodeInput}
                    onChange={(e) =>
                      setSessionCodeInput(e.target.value.toUpperCase())
                    }
                    className={`text-center text-4xl font-mono p-4 rounded-xl border-2 w-72 uppercase tracking-widest focus:outline-none transition-colors ${
                      isHighContrast
                        ? "bg-zinc-900 text-green-400 border-yellow-500 placeholder-zinc-600 focus:border-yellow-300 shadow-lg"
                        : "bg-slate-50 text-slate-900 border-slate-400 placeholder-slate-400 focus:border-blue-600 shadow-inner font-black"
                    }`}
                    maxLength={6}
                  />
                </div>

                <button
                  onClick={handleVerifyAndStart}
                  disabled={
                    sessionCodeInput.length < 6 ||
                    !customStudentName.trim() ||
                    isValidatingCode
                  }
                  className={`mt-4 px-12 py-6 rounded-xl text-3xl font-bold shadow-xl transition active:scale-95 w-full ${
                    sessionCodeInput.length >= 6 && customStudentName.trim()
                      ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-400"
                      : "bg-slate-300 text-slate-600 cursor-not-allowed opacity-60"
                  }`}
                >
                  {isValidatingCode
                    ? appText.start.verifyingBtn
                    : appText.start.startBtn}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p
            className={`text-2xl mb-12 max-w-2xl font-semibold ${isHighContrast ? "text-slate-300" : "text-slate-700"}`}
          >
            {appText.start.loginPrompt}
          </p>
          <button
            onClick={handleLogin}
            className={`border-2 px-12 py-6 rounded-xl text-2xl font-bold shadow-lg hover:opacity-90 transition active:scale-95 flex items-center justify-center gap-4 mx-auto ${
              isHighContrast
                ? "bg-zinc-900 text-white border-yellow-400 hover:bg-zinc-800"
                : "bg-white text-slate-800 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google logo"
              className="w-8 h-8"
            />
            {appText.start.googleBtn}
          </button>
        </div>
      )}
    </div>
  );
}
