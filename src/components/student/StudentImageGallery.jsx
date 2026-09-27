import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function StudentImageGallery({ sectionId, onBack }) {
  const [images, setImages] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "class_images"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        if (!sectionId || d.section === "All" || d.section === sectionId) {
          list.push({ id: docSnap.id, ...d });
        }
      });
      // Sort by manual order first, then fallback to newest
      list.sort((a, b) => (a.order || 0) - (b.order || 0) || (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setImages(list);
    }, (err) => console.error("Error fetching images:", err));
    return () => unsubscribe();
  }, [sectionId]);

  const filteredImages = images.filter(img => !filterDate || img.assignedDate === filterDate);

  // Keyboard navigation for Carousel
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

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5">
              ← Back to Menu
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Class Visuals & Reference</h2>
            <p className="text-xs text-slate-500">Diagrams, anchor charts, and problems shared by Mr. Castro.</p>
          </div>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Filter Date:</span>
          <input 
            type="date" 
            value={filterDate} 
            onChange={(e) => setFilterDate(e.target.value)}
            className="text-xs px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {filterDate && (
            <button onClick={() => setFilterDate("")} className="text-xs text-rose-500 font-semibold hover:underline">Clear</button>
          )}
        </div>
      </div>

      {filteredImages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">🖼️</span>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No Visuals Found</h3>
          <p className="text-xs text-slate-500 mt-1">Check back later or try a different date filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((img, index) => (
            <div
              key={img.id}
              onClick={() => setSelectedIndex(index)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer group flex flex-col"
            >
              <div className="p-3 bg-slate-950 flex items-center justify-center min-h-[200px] overflow-hidden">
                <img src={img.dataUrl} alt={img.title} className="max-h-56 w-auto object-contain transition-transform group-hover:scale-105" />
              </div>
              <div className="p-3.5 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{img.title}</h4>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">Tap to Zoom</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Carousel Modal */}
      {selectedIndex !== null && filteredImages[selectedIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col p-4" onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedIndex(null);
        }}>
          <div className="flex justify-between items-center text-white pb-3">
            <h3 className="font-bold text-base">{filteredImages[selectedIndex].title}</h3>
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-400 font-semibold">{selectedIndex + 1} of {filteredImages.length}</span>
              <button onClick={() => setSelectedIndex(null)} className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition-colors">✕ Close</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-between overflow-hidden relative">
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredImages.length - 1)); }}
              className="absolute left-2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              ◀
            </button>
            
            <div className="flex-1 h-full flex items-center justify-center px-12" onClick={() => setSelectedIndex(null)}>
              <img src={filteredImages[selectedIndex].dataUrl} alt={filteredImages[selectedIndex].title} className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" onClick={e => e.stopPropagation()} />
            </div>

            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => (prev < filteredImages.length - 1 ? prev + 1 : 0)); }}
              className="absolute right-2 z-10 p-3 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
