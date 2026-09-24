import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

export default function TeacherImageHub({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const sections = ["All", "4A", "4B", "4C", "4D", "4E", "5B"];

  useEffect(() => {
    const q = query(collection(db, "class_images"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (section === "All" || d.section === "All" || d.section === section) {
          list.push({ id: docSnap.id, ...d });
        }
      });
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setImages(list);
    }, (err) => console.error("Error loading images:", err));
    return () => unsubscribe();
  }, [section]);

  const compressAndSet = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        setPreviewData(dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        compressAndSet(file);
        break;
      }
    }
  };

  const uploadImage = async () => {
    if (!previewData) return;
    setIsUploading(true);
    try {
      const imageId = "img_" + Date.now();
      await setDoc(doc(db, "class_images", imageId), {
        title: title.trim() || "Class Visual",
        section: section === "All" ? "4D" : section,
        dataUrl: previewData,
        createdAt: serverTimestamp()
      });
      setPreviewData(null);
      setTitle("");
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteImage = async (id) => {
    if (!window.confirm("Remove this image from student view?")) return;
    try {
      await deleteDoc(doc(db, "class_images", id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-h-screen" onPaste={handlePaste}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              ← Back
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Class Visuals & Image Hub</h2>
            <p className="text-xs text-slate-500">Paste or drop images here to instantly broadcast to student devices.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Section:</span>
          <select value={section} onChange={(e) => setSection(e.target.value)} className="bg-transparent text-xs font-bold text-purple-600 dark:text-purple-400 focus:outline-none cursor-pointer">
            {sections.map(sec => <option key={sec} value={sec} className="dark:bg-slate-900">{sec}</option>)}
          </select>
        </div>
      </div>

      {/* Upload / Paste Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) compressAndSet(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 mb-8 text-center transition-all ${dragOver ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50"}`}
      >
        {previewData ? (
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <img src={previewData} alt="Preview" className="max-h-64 rounded-xl border border-slate-200 dark:border-slate-700 object-contain shadow-sm" />
            <input
              type="text"
              placeholder="Caption / Notes (optional)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-slate-200"
            />
            <div className="flex gap-2 w-full">
              <button onClick={() => setPreviewData(null)} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                Cancel
              </button>
              <button onClick={uploadImage} disabled={isUploading} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50">
                {isUploading ? "Publishing..." : "Post to Students"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-4xl mb-2">📋</span>
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Paste with <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Cmd+V</kbd> or Drag & Drop</p>
            <p className="text-xs text-slate-500 mt-1">Or click below to browse an image file</p>
            <label className="mt-3 px-4 py-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl text-xs font-semibold cursor-pointer transition-all">
              Select Image File
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && compressAndSet(e.target.files[0])} />
            </label>
          </div>
        )}
      </div>

      {/* Posted Visuals List */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">
        Active Shared Visuals ({images.length})
      </h3>

      {images.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-xs">
          No visuals currently broadcast for this section. Paste an image above to share.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[180px]">
                <img src={img.dataUrl} alt={img.title} className="max-h-48 w-auto rounded-lg object-contain" />
              </div>
              <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate max-w-[160px]">{img.title}</h4>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold uppercase">{img.section}</span>
                </div>
                <button onClick={() => deleteImage(img.id)} className="text-rose-500 hover:text-rose-600 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/30">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
