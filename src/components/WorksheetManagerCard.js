"use client";

import { useEffect, useState } from "react";
import {
  cloneWorksheet,
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
    await updateWorksheet(work.id, { dueDate });
    setMessage("Due date updated.");
    refresh();
  };

  const clone = async (work) => {
    const section = window.prompt("Section for the copy", availableSections[0] || work.section);
    if (!section) return;
    await cloneWorksheet(work, section);
    setMessage(`Copied to ${section}.`);
    refresh();
  };

  return (
    <section aria-labelledby="worksheet-manager-title" className="mb-6 w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-800 p-6 text-white shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="worksheet-manager-title" className="text-xl font-bold">Assigned Work Manager</h2>
          <p className="text-sm text-slate-300">Edit, clone, or revoke classwork assignments.</p>
        </div>
        <button type="button" onClick={refresh} className="rounded-lg bg-slate-700 px-3 py-2 text-sm font-bold">Refresh</button>
      </div>
      <div className="grid gap-3">
        {works.map((work) => (
          <article key={work.id} className="rounded-xl border border-slate-700 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-bold">{work.title}</h3>
                <p className="text-xs text-slate-400">Section {work.section} · {work.status || (work.active ? "published" : "draft")}</p>
              </div>
              <p className="text-xs text-slate-400">Due {work.dueDate ? new Date(work.dueDate).toLocaleString() : "—"}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => clone(work)} className="rounded-lg bg-blue-700 px-3 py-2 text-xs font-bold">Clone</button>
              <button type="button" onClick={() => editDeadline(work)} className="rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold">Edit deadline</button>
              {work.active && <button type="button" onClick={async () => { await unassignWorksheet(work.id); setMessage("Assignment revoked."); refresh(); }} className="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold">Unassign</button>}
            </div>
          </article>
        ))}
      </div>
      {message && <p role="status" className="mt-3 text-sm text-emerald-300">{message}</p>}
    </section>
  );
}
