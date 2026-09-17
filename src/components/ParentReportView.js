// src/components/ParentReportView.js
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import ParentQuestionCard from "./ParentQuestionCard";

export default function ParentReportView({ reportId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoc(doc(db, "exam_results", reportId)).then((snap) => {
      if (snap.exists()) setReport(snap.data());
      setLoading(false);
    });
  }, [reportId]);

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
        <div className="bg-slate-900 p-8 text-white text-center">
          <h1 className="text-3xl font-black mb-2 uppercase tracking-widest text-blue-400">
            The Mayan School
          </h1>
          <p className="text-slate-400 font-bold">mrcastro.vercel.app</p>
        </div>

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
            className={`text-6xl font-black ${
              report.score >= 70 ? "text-green-500" : "text-red-500"
            }`}
          >
            {report.score}%
          </div>
        </div>

        <div className="p-4 md:p-8 bg-slate-50">
          <h3 className="text-2xl font-black text-slate-800 mb-6 text-center">
            Questions
          </h3>
          <div className="flex flex-col gap-4">
            {report.answers?.map((ans, i) => (
              <ParentQuestionCard key={i} ans={ans} index={i} />
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
