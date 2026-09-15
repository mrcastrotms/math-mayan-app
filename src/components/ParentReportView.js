import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function ParentReportView({ reportId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "exam_results", reportId)).then((snap) => {
      if (snap.exists()) setReport(snap.data());
      setLoading(false);
    });
  }, [reportId]);

  // Brings over your exact smart parser for the parents
  const formatReadableAnswer = (ans) => {
    if (!ans.studentInput || ans.studentInput === "Skipped") return "Skipped";

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
    if (ans.instruction && ans.instruction.includes("Yes")) {
      return ans.studentInput === "1" ? "1 (Yes)" : "2 (No)";
    }
    return ans.studentInput;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-2xl font-bold text-slate-400 animate-pulse">
          Loading Official Report...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
        <p className="text-2xl font-bold text-red-500">
          Report not found or invalid QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Official Header */}
        <div className="bg-slate-900 p-8 text-white text-center">
          <h1 className="text-3xl font-black mb-2 uppercase tracking-widest text-blue-400">
            The Mayan School
          </h1>
          <p className="text-slate-400 font-bold">
            Mathematics with Mr. Castro
          </p>
        </div>

        {/* Student Info & Score */}
        <div className="p-8 border-b border-slate-100 flex flex-col items-center text-center">
          <h2 className="text-4xl font-black mb-4 text-slate-800">
            {report.studentName}
          </h2>
          <div className="flex gap-3 flex-wrap justify-center mb-6">
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl font-bold border border-blue-200">
              Grade: {report.section}
            </span>
            <span className="bg-purple-50 text-purple-700 px-4 py-2 rounded-xl font-bold border border-purple-200">
              {report.activityType}
            </span>
            <span className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl font-bold border border-slate-200">
              {report.timestamp?.toDate
                ? report.timestamp.toDate().toLocaleDateString()
                : "Date N/A"}
            </span>
          </div>
          <div className="text-xl font-bold text-slate-500 mb-2">
            Final Score
          </div>
          <div
            className={`text-6xl font-black ${report.score >= 70 ? "text-green-500" : "text-red-500"}`}
          >
            {report.score}%
          </div>
        </div>

        {/* Detailed Answers Breakdown */}
        <div className="p-4 md:p-8 bg-slate-50">
          <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">
            Questions
          </h3>
          <div className="flex flex-col gap-4">
            {report.answers?.map((ans, i) => (
              <div
                key={i}
                className={`p-5 rounded-2xl border-2 ${ans.isCorrect ? "border-green-200 bg-white" : "border-red-200 bg-white"}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="font-bold text-lg text-slate-800 leading-tight">
                    <span className="text-slate-400 mr-2">
                      Q{ans.questionNumber || i + 1}.
                    </span>{" "}
                    {ans.question}
                  </p>
                  <span
                    className={`text-2xl font-black ${ans.isCorrect ? "text-green-500" : "text-red-500"}`}
                  >
                    {ans.isCorrect ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-sm mt-3 pt-3 border-t border-slate-100">
                  <p className="font-bold text-slate-600">
                    Student Answer:{" "}
                    <span
                      className={
                        ans.isCorrect
                          ? "text-green-600 text-base"
                          : "text-red-600 text-base"
                      }
                    >
                      {formatReadableAnswer(ans)}
                    </span>
                  </p>
                  {!ans.isCorrect && (
                    <p className="font-bold text-slate-500">
                      Correct Answer:{" "}
                      <span className="text-slate-900 text-base">
                        {ans.correctAnswer}
                      </span>
                    </p>
                  )}
                  {ans.observation && (
                    <p className="text-slate-400 italic text-xs mt-1">
                      Note: {ans.observation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {report.demerits > 0 && (
            <div className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-center">
              <p className="font-black text-red-800 text-lg">
                Behavioral Demerits Issued: {report.demerits}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
