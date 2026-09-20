import { useState } from "react";
import {
  syncContentToFirebase,
  updateLiveContent,
} from "../services/contentService";

export default function CloudCmsCard({ appText, setAppText }) {
  const [isEditingCopy, setIsEditingCopy] = useState(false);
  const [editableJson, setEditableJson] = useState(
    JSON.stringify(appText, null, 2),
  );

  const handleSaveInPlaceCopy = async () => {
    try {
      const updatedObj = await updateLiveContent(editableJson);
      if (setAppText) setAppText(updatedObj);
      setIsEditingCopy(false);
    } catch (e) {
      // Handled in service alert
    }
  };

  return (
    <div className="w-full max-w-4xl rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface)] p-8 text-[var(--app-fg)] shadow-2xl">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">App Editor</h2>
          <p className="text-sm opacity-75">
            Edit your app copy and save directly to Firebase
          </p>
        </div>
        <button
          onClick={() => setIsEditingCopy(!isEditingCopy)}
          className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-yellow-700 transition shadow-lg active:scale-95 whitespace-nowrap"
        >
          {isEditingCopy ? "Close Editor" : "Edit Copy"}
        </button>
      </div>

      {isEditingCopy && (
        <div className="mt-4 animate-fade-in">
          <textarea
            rows={12}
            value={editableJson}
            onChange={(e) => setEditableJson(e.target.value)}
            className="w-full bg-slate-900 text-green-400 font-mono text-sm p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-yellow-500"
          />
          <div className="flex justify-end gap-4 mt-4">
            <button
              onClick={syncContentToFirebase}
              className="bg-slate-700 text-slate-300 px-4 py-2 rounded-lg font-bold hover:bg-slate-600 transition text-sm"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSaveInPlaceCopy}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition text-sm shadow-md"
            >
              Save Live Changes to Firestore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
