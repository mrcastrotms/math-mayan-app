export default function StudentReportModal({ report, onBack }) {
  const formatReadableAnswer = (ans) => {
    if (ans.studentInput === "Skipped") return "Skipped";

    // Smart parser: Extract choice text directly from the question instruction
    if (
      ans.instruction &&
      (ans.studentInput === "1" ||
        ans.studentInput === "2" ||
        ans.studentInput === "3" ||
        ans.studentInput === "4")
    ) {
      const regex = new RegExp(
        `${ans.studentInput}\\s*(?:for|\\)|\\-)\\s*([^\\.\\,\\;]+)`,
        "i",
      );
      const match = ans.instruction.match(regex);
      if (match && match[1]) {
        return `${ans.studentInput} (${match[1].trim()})`;
      }
    }

    // Fallback for True/False questions if instruction mentions it
    if (ans.instruction && ans.instruction.includes("Yes")) {
      return ans.studentInput === "1" ? "1 (Yes)" : "2 (No)";
    }

    return ans.studentInput;
  };

  return (
    <div className="min-h-screen bg-white font-sans p-12 w-full z-50 absolute top-0 left-0 overflow-y-auto text-slate-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8 print:hidden">
          <button
            onClick={onBack}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 transition"
          >
            ← Back to Gradebook
          </button>
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-md"
          >
            Print
          </button>
        </div>

        <div className="border-b-2 border-slate-800 pb-6 mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Student Report
          </h1>
          <p className="text-slate-600 font-medium">The Mayan School</p>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
          <div>
            <span className="font-bold text-slate-500">Written Name:</span>{" "}
            <span className="text-xl font-bold">{report.studentName}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500">
              Google Account Name:
            </span>{" "}
            <span className="text-slate-700">
              {report.googleAccountName || "N/A"}
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Section:</span>{" "}
            <span className="font-mono font-bold">{report.section}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Final Score:</span>{" "}
            <span className="text-xl font-extrabold text-blue-600">
              {report.score}%
            </span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Session Code:</span>{" "}
            <span className="font-mono">{report.sessionCode}</span>
          </div>
          <div>
            <span className="font-bold text-slate-500">Date:</span>{" "}
            {report.timestamp
              ? new Date(report.timestamp.toDate()).toLocaleString()
              : "N/A"}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4 text-slate-800">Demerits</h3>
          {report.demerits && report.demerits.length > 0 ? (
            <ul className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2">
              {report.demerits.map((d, i) => (
                <li
                  key={i}
                  className="text-red-700 font-medium text-sm flex justify-between"
                >
                  <span>• {d.reason}</span>
                  <span className="font-mono text-xs text-slate-400">
                    {new Date(d.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic bg-slate-50 p-4 rounded-xl border border-slate-200">
              No behavior demerits logged for this assessment.
            </p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-800">
            Exam Questions
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase tracking-wider">
                  <th className="p-3 border-b">#</th>
                  <th className="p-3 border-b">Question</th>
                  <th className="p-3 border-b">Student Input</th>
                  <th className="p-3 border-b">Correct Answer</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Observation</th>
                </tr>
              </thead>
              <tbody>
                {report.answers?.map((ans, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="p-3 font-mono">{ans.questionNumber}</td>
                    <td className="p-3 font-bold">{ans.question}</td>
                    <td className="p-3 font-mono">
                      {formatReadableAnswer(ans)}
                    </td>
                    <td className="p-3 font-mono text-slate-600">
                      {ans.correctAnswer}
                    </td>
                    <td className="p-3 font-bold">
                      {ans.isCorrect ? (
                        <span className="text-green-600">Correct</span>
                      ) : (
                        <span className="text-red-600">Incorrect</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 text-xs italic">
                      {ans.observation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
