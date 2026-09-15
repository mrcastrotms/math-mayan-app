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
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center relative">
      {children}

      {isTeacher && (
        <div className="absolute top-6 left-6 flex items-center gap-4 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-lg z-50">
          <span className="text-sm font-bold text-yellow-400">
            Teacher Account Detected
          </span>
          <button
            onClick={() => setIsAdminMode(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition active:scale-95"
          >
            Open Teacher Dashboard →
          </button>
        </div>
      )}

      <h1 className="text-5xl font-extrabold text-blue-900 mb-6">
        {appText.global.title}
      </h1>

      {student ? (
        <div className="animate-fade-in w-full max-w-2xl">
          <p className="text-2xl font-bold text-green-700 mb-6">
            {appText.start.welcome} {student.displayName}
          </p>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
            <p className="text-xl text-slate-700 mb-4 font-bold">
              {appText.start.selectSection}
            </p>
            <div className="flex justify-center gap-4 flex-wrap mb-8">
              {availableSections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`px-8 py-4 rounded-xl text-2xl font-bold transition-all ${selectedSection === section ? "bg-blue-600 text-white ring-4 ring-blue-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {section}
                </button>
              ))}
            </div>

            {selectedSection && (
              <div className="flex flex-col items-center gap-6 animate-fade-in border-t border-slate-100 pt-8">
                <div className="w-full">
                  <label className="block text-lg text-slate-700 font-bold mb-2">
                    Type your Full Name:
                  </label>
                  <input
                    type="text"
                    placeholder="Carlos Eduardo Gomez"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    className="text-center text-2xl font-bold p-4 rounded-xl border-2 border-slate-300 w-full bg-slate-50 focus:border-blue-500 focus:outline-none text-slate-800"
                  />
                </div>

                <div className="w-full">
                  <p className="text-lg text-slate-500 font-bold mb-2">
                    {appText.start.enterCode}
                  </p>
                  <input
                    type="text"
                    placeholder="CODE"
                    value={sessionCodeInput}
                    onChange={(e) =>
                      setSessionCodeInput(e.target.value.toUpperCase())
                    }
                    className="text-center text-4xl font-mono p-4 rounded-xl border-2 border-slate-300 w-64 uppercase tracking-widest bg-slate-50 focus:border-blue-500 focus:outline-none"
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
                  className={`mt-4 px-12 py-6 rounded-xl text-3xl font-bold shadow-xl transition active:scale-95 w-full ${sessionCodeInput.length >= 6 && customStudentName.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
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
          <p className="text-2xl text-slate-700 mb-12 max-w-2xl">
            {appText.start.loginPrompt}
          </p>
          <button
            onClick={handleLogin}
            className="bg-white text-slate-700 border-2 border-slate-200 px-12 py-6 rounded-xl text-2xl font-bold shadow-md hover:bg-slate-50 transition active:scale-95 flex items-center justify-center gap-4 mx-auto"
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
