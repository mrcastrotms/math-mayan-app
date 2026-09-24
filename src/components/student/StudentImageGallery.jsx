import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, onSnapshot, query } from "firebase/firestore";

export default function StudentImageGallery({ sectionId, onBack }) {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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
      list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setImages(list);
    }, (err) => console.error("Error fetching images:", err));
    return () => unsubscribe();
  }, [sectionId]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 min-h-screen">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
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
      </div>

      {images.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center">
          <span className="text-4xl mb-2">🖼️</span>
          <h3 className="font-bold text-slate-700 dark:text-slate-200 text-base">No Shared Visuals Right Now</h3>
          <p className="text-xs text-slate-500 mt-1">When images or diagrams are posted for Section {sectionId}, they will show up here automatically.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelectedImage(img)}
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

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col p-4" onClick={() => setSelectedImage(null)}>
          <div className="flex justify-between items-center text-white pb-3">
            <h3 className="font-bold text-base">{selectedImage.title}</h3>
            <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold">✕ Close</button>
          </div>
          <div className="flex-1 flex items-center justify-center overflow-auto">
            <img src={selectedImage.dataUrl} alt={selectedImage.title} className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
