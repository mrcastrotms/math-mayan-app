import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, doc, setDoc, deleteDoc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";

export default function TeacherImageHub({ defaultSection = "4D", onBack }) {
  const [section, setSection] = useState(defaultSection);
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedDate, setAssignedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterDate, setFilterDate] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  // Carousel State
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  // Reorder State
  const [isReordering, setIsReordering] = useState(false);
  const dragItem = useRef();
  const dragOverItem = useRef();

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
      list.sort((a, b) => (a.order || 0) - (b.order || 0) || (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setImages(list);
    }, (err) => console.error("Error loading images:", err));
    return () => unsubscribe();
  }, [section]);

  const filteredImages = images.filter(img => !filterDate || img.assignedDate === filterDate);

  // Keyboard Navigation for Carousel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedIndex === null) return;
      if (e.key === "ArrowLeft") {
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex(prev => (prev < filteredImages.length - 1 ? prev + 1 : 0));
      } else if (e.key === "Escape") {
        setSelectedIndex(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredImages.length]);

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
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        setPreviewData(canvas.toDataURL("image/jpeg", 0.75));
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
        compressAndSet(items[i].getAsFile());
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
        assignedDate: assignedDate,
        order: images.length,
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

  const deleteImage = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Remove this image from student view?")) return;
    try { await deleteDoc(doc(db, "class_images", id)); } 
    catch (err) { console.error("Delete error:", err); }
  };

  const duplicateImage = async (img, targetSection, e) => {
    if (e) e.stopPropagation();
    if (!targetSection) return;
    try {
      const imageId = "img_" + Date.now() + Math.floor(Math.random()*1000);
      await setDoc(doc(db, "class_images", imageId), {
        title: img.title,
        dataUrl: img.dataUrl,
        section: targetSection,
        assignedDate: img.assignedDate || new Date().toISOString().split('T')[0],
        order: 999, // Append to end of that section
        createdAt: serverTimestamp()
      });
      alert(`Copied to ${targetSection}!`);
    } catch (err) {
      console.error("Duplicate error:", err);
    }
  };

  // Drag and Drop Ordering
  const dragStart = (e, position) => { dragItem.current = position; };
  const dragEnter = (e, position) => { dragOverItem.current = position; };
  const drop = async () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const copyList = [...filteredImages];
    const dragContent = copyList[dragItem.current];
    copyList.splice(dragItem.current, 1);
    copyList.splice(dragOverItem.current, 0, dragContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    try {
      const batch = writeBatch(db);
      copyList.forEach((img, index) => {
        batch.update(doc(db, "class_images", img.id), { order: index });
      });
      await batch.commit();
    } catch (err) {
      console.error("Failed to save new order:", err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-h-screen" onPaste={handlePaste}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all">
              ← Back
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Class Visuals Hub</h2>
            <p className="text-xs text-slate-500">Paste/drop images, set dates, reorder, or copy to other sections.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Filter Date:</span>
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-none outline-none" />
            {filterDate && <button onClick={() => setFilterDate("")} className="text-xs text-rose-500 font-bold">✕</button>}
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Target Section:</span>
            <select value={section} onChange={(e) => setSection(e.target.value)} className="bg-transparent text-xs font-bold text-purple-600 dark:text-purple-400 focus:outline-none cursor-pointer">
              {sections.map(sec => <option key={sec} value={sec}>{sec}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.[0]) compressAndSet(e.dataTransfer.files[0]);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 mb-8 text-center transition-all ${dragOver ? "border-purple-500 bg-purple-50" : "border-slate-300 bg-slate-50 dark:bg-slate-900/50"}`}
      >
        {previewData ? (
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <img src={previewData} alt="Preview" className="max-h-64 rounded-xl border border-slate-200 shadow-sm" />
            <div className="w-full flex gap-2">
              <input type="date" value={assignedDate} onChange={(e) => setAssignedDate(e.target.value)} className="px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200" title="Assigned Date" />
              <input type="text" placeholder="Caption / Notes (optional)..." value={title} onChange={(e) => setTitle(e.target.value)} className="flex-1 px-3 py-2 text-sm rounded-xl border bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-800 dark:text-slate-200" />
            </div>
            <div className="flex gap-2 w-full">
              <button onClick={() => setPreviewData(null)} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">Cancel</button>
              <button onClick={uploadImage} disabled={isUploading} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md disabled:opacity-50">
                {isUploading ? "Publishing..." : "Post to Students"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <span className="text-4xl mb-2">📋</span>
            <p className="font-bold text-sm text-slate-700 dark:text-slate-200">Paste with <kbd className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono text-xs">Cmd+V</kbd> or Drag & Drop</p>
            <label className="mt-3 px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-xl text-xs font-semibold cursor-pointer">
              Select Image File
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && compressAndSet(e.target.files[0])} />
            </label>
          </div>
        )}
      </div>

      {/* Header for Visuals */}
      <div className="flex justify-between items-center mb-3 px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Active Visuals ({filteredImages.length})
        </h3>
        <button 
          onClick={() => setIsReordering(!isReordering)} 
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isReordering ? "bg-amber-500 text-white shadow-md" : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-300"}`}
        >
          {isReordering ? "Done Reordering" : "↕ Change Order"}
        </button>
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">No visuals found for this section/date.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((img, index) => (
            <div 
              key={img.id} 
              draggable={isReordering}
              onDragStart={(e) => dragStart(e, index)}
              onDragEnter={(e) => dragEnter(e, index)}
              onDragEnd={drop}
              onClick={() => !isReordering && setSelectedIndex(index)}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm flex flex-col transition-all ${isReordering ? "cursor-grab active:cursor-grabbing border-amber-400 ring-2 ring-amber-400/20" : "cursor-pointer border-slate-200 hover:shadow-md dark:border-slate-800"}`}
            >
              <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[180px] relative pointer-events-none">
                {isReordering && <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md font-bold">Drag to move</div>}
                <img src={img.dataUrl} alt={img.title} className="max-h-48 w-auto rounded-lg object-contain" />
              </div>
              <div className="p-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                <div className="w-1/2">
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{img.title}</h4>
                  <span className="text-[10px] text-slate-500">{img.assignedDate || "No Date"}</span>
                </div>
                <div className="flex gap-1">
                  <select 
                    onChange={(e) => { duplicateImage(img, e.target.value, e); e.target.value = ""; }}
                    className="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded px-1 py-1 outline-none cursor-pointer"
                    title="Duplicate to Section"
                  >
                    <option value="">Copy to...</option>
                    {sections.filter(s => s !== "All" && s !== section).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={(e) => deleteImage(img.id, e)} className="text-rose-500 text-xs font-semibold px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30">Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Carousel Modal */}
      {selectedIndex !== null && !isReordering && filteredImages[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedIndex(null);
        }}>
          <div className="flex justify-between items-center text-white pb-3">
            <h3 className="font-bold text-base">{filteredImages[selectedIndex].title}</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-semibold">{selectedIndex + 1} of {filteredImages.length}</span>
              <button onClick={() => setSelectedIndex(null)} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold">✕ Close</button>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-between overflow-hidden relative">
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredImages.length - 1)); }} className="absolute left-2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full">◀</button>
            <div className="flex-1 h-full flex items-center justify-center px-12" onClick={() => setSelectedIndex(null)}>
              <img src={filteredImages[selectedIndex].dataUrl} className="max-h-[85vh] max-w-full rounded-xl object-contain" onClick={e => e.stopPropagation()} />
            </div>
            <button onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev < filteredImages.length - 1 ? prev + 1 : 0)); }} className="absolute right-2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full">▶</button>
          </div>
        </div>
      )}
    </div>
  );
}
