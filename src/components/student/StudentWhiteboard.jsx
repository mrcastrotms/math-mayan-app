import React, { useRef, useState, useEffect } from 'react';
import { db } from "../../firebase";
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function StudentWhiteboard({ studentId, sectionId, studentName, onBack }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [thickness, setThickness] = useState(3);
  const [gridSize, setGridSize] = useState(25); // pixel size for grid squares

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.parentElement.clientWidth || 800;
    canvas.height = 450;

    redrawGrid(ctx, canvas.width, canvas.height, gridSize);
  }, [gridSize]);

  const redrawGrid = (ctx, width, height, size) => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0'; // light gray grid lines
    ctx.lineWidth = 1;

    ctx.beginPath();
    for (let x = 0; x < width; x += size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += size) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  };

  
  // Helper to calculate exact coordinates accounting for CSS scaling & screen size changes
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : getCoordinates(e).x;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (getCoordinates(e).x || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (getCoordinates(e).x || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : '#1e293b';
    ctx.lineWidth = tool === 'eraser' ? thickness * 4 : thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    syncToFirestore();
  };

  const syncToFirestore = async () => {
    if (!studentId || !sectionId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);

    try {
      const docRef = doc(db, 'class_whiteboards', sectionId, 'students', studentId);
      await setDoc(docRef, {
        studentId,
        studentName: studentName || 'Student',
        dataUrl,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing whiteboard:', err);
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    redrawGrid(ctx, canvas.width, canvas.height, gridSize);
    syncToFirestore();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              ← Back to Menu
            </button>
          )}
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Live Math Scratchpad</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sketch area models, number lines, or work out your steps.</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${tool === 'pen' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Pen
            </button>
            <button
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${tool === 'eraser' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Eraser
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-20 accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Grid:</span>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              <option value="15">Fine</option>
              <option value="25">Standard</option>
              <option value="40">Large</option>
            </select>
          </div>

          <button
            onClick={clearBoard}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all"
          >
            Clear Board
          </button>
        </div>
      </div>

      {/* Canvas Element */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full touch-none block"
        />
      </div>
    </div>
  );
}
