"use client";

import { useEffect, useState } from "react";
import {
  cloneWorksheet,
  deleteWorksheet,
  loadAllWorksheets,
  unassignWorksheet,
  updateWorksheet,
} from "../services/worksheetService";

export default function WorksheetManagerCard({ availableSections = [] }) {
  const [works, setWorks] = useState([]);
  const [message, setMessage] = useState("");

  const refresh = () => loadAllWorksheets().then(setWorks).catch(() => setMessage("Unable to load assignments."));
  useEffect(refresh, []);

  const editDeadline = async (work) => {
    const dueDate = window.prompt("New due date/time (ISO format)", work.dueDate || "");
    if (!dueDate) return;
    try {
      await updateWorksheet(work.id, { dueDate });
      setMessage("Assignment updated.");
      refresh();
    } catch (error) {
      console.error("Unable to edit assignment:", error);
      setMessage("Unable to update assignment.");
    }
  };

  const remove = async (work) => {
    if (!window.confirm(`Delete "${work.title}" permanently? This removes the assignment record.`)) return;
    try {
      await deleteWorksheet(work.id);
      setMessage("Assignment deleted.");
      refresh();
    } catch (error) {
      console.error("Unable to delete assignment:", error);
      setMessage("Unable to delete assignment.");
    }
  };

  const clone = async (work) => {
    const section = window.prompt("Section for the copy", availableSections[0] || work.section);
    if (!section) return;
    await cloneWorksheet(work, section);
    setMessage(`Copied to ${section}.`);
    refresh();
  };

  return (
    <section aria-labelledby="worksheet-manager-title" className="mb-6 w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-6 text-[var(--app-fg)] shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="worksheet-manager-title" className="text-xl font-bold">Assigned Work Manager</h2>
          <p className="text-sm opacity-75">Edit, clone, or revoke classwork assignments.</p>
        </div>
        <button type="button" onClick={refresh} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold text-white">Refresh</button>
      </div>
      <div className="grid gap-3">
        {works.map((work) => (
          <article key={work.id} className="rounded-xl border border-slate-700 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{work.title}</h3>
                <p className="text-xs opacity-70">Section {work.section} · {work.status || (work.active ? "published" : "draft")}</p>
              </div>
              <p className="text-xs opacity-70">Due {work.dueDate ? new Date(work.dueDate).toLocaleString() : "—"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => clone(work)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold">Clone</button>
              <button type="button" onClick={() => editDeadline(work)} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white">Edit</button>
              {work.active && <button type="button" onClick={async () => { await unassignWorksheet(work.id); setMessage("Assignment revoked."); refresh(); }} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold">Unassign</button>}
              <button type="button" onClick={() => remove(work)} className="rounded-lg bg-red-900 px-3 py-2 text-xs font-bold text-white">Delete</button>
            </div>
          </article>
        ))}
      </div>
      {message && <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>}
    </section>
  );
}
