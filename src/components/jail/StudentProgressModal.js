"use client";
import React from "react";

export default function StudentProgressModal({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const answers = Array.isArray(student.studentAnswers) ? student.studentAnswers : [];
  
  const formatTime = (secs) => {
    if (secs === undefined || secs === null || isNaN(secs)) return "--:--";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-white">{student.name}</h2>
            <p className="text-sm text-slate-400">Section {student.section} • Live Progress</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-2 font-bold transition"
          >
            Close
          </button>
        </div>
        
        {/* Body Stats */}
        <div className="p-5 overflow-y-auto flex-1 text-slate-300">
           <div className="grid grid-cols-3 gap-4 mb-6">
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Current Q</p>
               <p className="text-3xl font-black text-white">{(student.currentQuestionIndex ?? 0) + 1}</p>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Time Left</p>
               <p className="text-3xl font-black text-emerald-400">{formatTime(student.timeLeft)}</p>
             </div>
             <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
               <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Answers</p>
               <p className="text-3xl font-black text-blue-400">{answers.length}</p>
             </div>
           </div>

           <h3 className="font-bold text-white text-lg mb-4 border-b border-slate-800 pb-2">Live Answer Feed</h3>
           {answers.length === 0 ? (
             <p className="text-slate-500 italic bg-slate-800/30 p-6 rounded-xl border border-slate-800 text-center">
               No answers submitted yet.
             </p>
           ) : (
             <div className="space-y-3">
               {answers.map((ans, idx) => (
                 <div key={idx} className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 flex justify-between items-center gap-4">
                   <div className="flex-1">
                     <span className="text-sm text-slate-400 font-bold mr-3 bg-slate-900 px-2 py-1 rounded">Q{idx + 1}</span>
                     <span className="text-sm text-slate-200">
                       {ans?.question?.text || ans?.question?.prompt || (typeof ans?.question === "string" ? ans?.question : "Question text")}
                     </span>
                   </div>
                   <div className={`px-4 py-2 rounded-xl font-bold text-lg min-w-[80px] text-center border ${
                     ans.isCorrect 
                       ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800' 
                       : 'bg-red-900/30 text-red-400 border-red-800'
                   }`}>
                     {ans.studentInput || "Skipped"}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
