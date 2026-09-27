import React from "react";

export default function StudentRosterEditForm({
  editingStudent,
  setEditingStudent,
  handleSaveContact,
  saving,
  onClose,
}) {
  if (!editingStudent) return null;

  return (
    <div className="w-full sm:w-[420px] border-l border-[var(--app-border)] bg-[var(--app-surface)] p-5 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold">Edit Contact & Zearn Credentials</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSaveContact} className="flex flex-col h-full max-h-[75vh] text-xs">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
          <div>
            <label className="block font-semibold mb-1">Student</label>
            <div className="font-bold text-sm">{editingStudent.name}</div>
            <span className="text-[10px] text-blue-500 font-mono">Section {editingStudent.section}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-semibold mb-1">DOB</label>
              <input
                type="text"
                value={editingStudent.dob || ""}
                onChange={(e) => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
                placeholder="MM/DD/YYYY"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">UDID</label>
              <input
                type="text"
                value={editingStudent.udid || ""}
                onChange={(e) => setEditingStudent({ ...editingStudent, udid: e.target.value })}
                className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
                placeholder="ID Number"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">Home Address</label>
            <textarea
              value={editingStudent.address || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2 text-xs"
              rows="2"
              placeholder="Res. La Arboleda..."
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Student Email</label>
            <input
              type="email"
              value={editingStudent.studentEmail || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, studentEmail: e.target.value })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
              placeholder="student@school.hn"
            />
          </div>

          <hr className="border-[var(--app-border)]/50 my-2" />

          {/* Zearn Math Credentials Section */}
          <div className="space-y-3 rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-3">
            <div className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Zearn Math Accounts
            </div>

            {/* Classwork */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold opacity-75">Classwork (Code: EZ7D6N)</span>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  placeholder="Code"
                  value={editingStudent.zearnClasscodeClasswork || "EZ7D6N"}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnClasscodeClasswork: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={editingStudent.zearnClassworkUser || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnClassworkUser: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={editingStudent.zearnClassworkPass || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnClassworkPass: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
              </div>
            </div>

            {/* Homework */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold opacity-75">Homework (Code: DH3P2G)</span>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  placeholder="Code"
                  value={editingStudent.zearnClasscodeHomework || "DH3P2G"}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnClasscodeHomework: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Username"
                  value={editingStudent.zearnHomeworkUser || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnHomeworkUser: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
                <input
                  type="text"
                  placeholder="Password"
                  value={editingStudent.zearnHomeworkPass || ""}
                  onChange={(e) => setEditingStudent({ ...editingStudent, zearnHomeworkPass: e.target.value })}
                  className="rounded border border-[var(--app-border)] bg-transparent p-1.5 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--app-border)]/50 my-2" />

          {/* Primary Contact */}
          <div className="space-y-2">
            <div className="font-bold text-[11px] text-[var(--app-accent)]">Primary Contact (Parent 1)</div>
            <input
              type="text"
              placeholder="Parent Name"
              value={editingStudent.parent1?.name || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent1: { ...editingStudent.parent1, name: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
            <input
              type="email"
              placeholder="Parent Email"
              value={editingStudent.parent1?.email || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent1: { ...editingStudent.parent1, email: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
            <input
              type="tel"
              placeholder="Phone / WhatsApp"
              value={editingStudent.parent1?.phone || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent1: { ...editingStudent.parent1, phone: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
          </div>

          <hr className="border-[var(--app-border)]/50 my-2" />

          {/* Secondary Contact */}
          <div className="space-y-2">
            <div className="font-bold text-[11px] text-[var(--app-accent)]">Secondary Contact (Parent 2)</div>
            <input
              type="text"
              placeholder="Parent Name"
              value={editingStudent.parent2?.name || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent2: { ...editingStudent.parent2, name: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
            <input
              type="email"
              placeholder="Parent Email"
              value={editingStudent.parent2?.email || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent2: { ...editingStudent.parent2, email: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
            <input
              type="tel"
              placeholder="Phone / WhatsApp"
              value={editingStudent.parent2?.phone || ""}
              onChange={(e) => setEditingStudent({ ...editingStudent, parent2: { ...editingStudent.parent2, phone: e.target.value } })}
              className="w-full rounded border border-[var(--app-border)] bg-transparent p-2"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-end gap-2 bg-[var(--app-surface)] sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-3 py-2 text-xs font-semibold opacity-70 hover:opacity-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-500 disabled:opacity-50 shadow-md cursor-pointer"
          >
            {saving ? "Saving..." : "Save Contact Info"}
          </button>
        </div>
      </form>
    </div>
  );
}
