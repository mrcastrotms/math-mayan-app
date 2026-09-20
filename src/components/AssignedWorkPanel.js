"use client";

import { getWorksheetStatus } from "../utils/worksheetUtils.mjs";
import { useEffect, useState } from "react";
import { loadWorksheetAttempt } from "../services/worksheetService";
import MathExpression from "./MathExpression";

export default function AssignedWorkPanel({ works = [], studentId, onOpenWork }) {
  const [attempts, setAttempts] = useState({});

  useEffect(() => {
    let active = true;
    if (!studentId || works.length === 0) return undefined;
    Promise.all(works.map(async (work) => [work.id, await loadWorksheetAttempt(work.id, studentId)]))
      .then((entries) => {
        if (active) setAttempts(Object.fromEntries(entries));
      })
      .catch(() => {});
    return () => { active = false; };
  }, [studentId, works]);

  return (
    <section aria-labelledby="assigned-work-title" className="mb-8 min-w-0 max-w-full overflow-hidden text-left">
      <h2 id="assigned-work-title" className="text-xl font-bold mb-3">
        Assigned Work
      </h2>
      {works.length === 0 ? (
        <p className="rounded-lg border border-dashed border-current/30 p-4 text-sm opacity-75">
          No assignments are currently posted for your section.
        </p>
      ) : (
        <div className="grid min-w-0 gap-3">
          {works.map((work) => {
            const status = getWorksheetStatus(attempts[work.id], work.dueDate);
            const closed = status === "Closed";
            return (
              <article key={work.id} className="min-w-0 max-w-full overflow-hidden rounded-lg border border-current/20 p-4">
                  <div className="flex min-w-0 flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 max-w-full break-words">
                      <h3 className="break-words font-bold">{work.title}</h3>
                      <p className="break-words text-sm opacity-75">{work.instructions || "Complete the assigned questions."}</p>
                  </div>
                  {work.questions?.[0]?.prompt && <MathExpression value={work.questions[0].prompt} className="mt-2 text-sm" />}
                  <span className="shrink-0 rounded-full border px-2 py-1 text-xs font-bold">{status}</span>
                </div>
                <p className="mt-2 text-xs opacity-75">
                  Due: {work.dueDate ? new Date(work.dueDate).toLocaleString() : "No deadline"}
                </p>
                <button
                  type="button"
                  disabled={closed}
                  onClick={() => onOpenWork(work)}
                  className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {closed ? "Closed" : "Open assignment"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
