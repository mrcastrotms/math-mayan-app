import React, { useRef, useState, useEffect, useCallback } from 'react';
import { db } from "../../firebase";
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function StudentWhiteboard({ studentId, sectionId, studentName, onBack }) {
  const wrapperRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const canvasRef = useRef(null);
  const masterCanvasRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [thickness, setThickness] = useState(3);
  const [gridSize, setGridSize] = useState(25);
  const [canvasHeight, setCanvasHeight] = useState(480);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Resize drag tracking refs
  const isResizingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(480);

  const cleanStudentId = String(studentId || studentName?.trim().toLowerCase().replace(/\s+/g, '_') || 'anon');

  // Initialize persistent master canvas for ink preservation
  useEffect(() => {
    if (!masterCanvasRef.current) {
      const mc = document.createElement('canvas');
      mc.width = 4000;
      mc.height = 4000;
      masterCanvasRef.current = mc;
    }
  }, []);

  function redrawGrid(ctx, width, height, size) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
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
  }

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    redrawGrid(ctx, canvas.width, canvas.height, gridSize);
    if (masterCanvasRef.current) {
      ctx.drawImage(masterCanvasRef.current, 0, 0);
    }
  }, [gridSize]);

  // Sync canvas dimensions with container and preserve drawing
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !container) return;

      const w = Math.floor(container.clientWidth);
      const h = Math.floor(container.clientHeight);

      if (w <= 0 || h <= 0) return;
      if (canvas.width === w && canvas.height === h) return;

      canvas.width = w;
      canvas.height = h;

      renderCanvas();
    };

    handleResize();

    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(handleResize);
    });
    ro.observe(container);

    return () => ro.disconnect();
  }, [canvasHeight, isFullscreen, renderCanvas]);

  // Redraw when grid size changes without wiping drawings
  useEffect(() => {
    renderCanvas();
  }, [gridSize, renderCanvas]);

  // Listen to native browser fullscreen changes (e.g. Esc key)
  useEffect(() => {
    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, [isFullscreen]);

  // Handle Drag-to-Resize on the bottom handle
  const handleResizeStart = (e) => {
    e.preventDefault();
    isResizingRef.current = true;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    startHeightRef.current = canvasHeight;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'row-resize';
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isResizingRef.current) return;
      if (e.cancelable && e.touches) {
        e.preventDefault();
      }
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - startYRef.current;
      const minHeight = 280;
      const maxHeight = Math.max(window.innerHeight * 2, 2200);
      const newHeight = Math.max(minHeight, Math.min(maxHeight, Math.round(startHeightRef.current + deltaY)));
      setCanvasHeight(newHeight);
    };

    const handlePointerUp = () => {
      if (!isResizingRef.current) return;
      isResizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [canvasHeight]);

  // Toggle Fullscreen mode
  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (wrapperRef.current?.requestFullscreen) {
          await wrapperRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (_) {}
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch (_) {}
    }
  };

  // Heartbeat & Online Presence
  useEffect(() => {
    if (!sectionId || !cleanStudentId) return;
    const docRef = doc(db, 'class_whiteboards', sectionId, 'students', cleanStudentId);

    const sendHeartbeat = async (status = true) => {
      try {
        await setDoc(docRef, {
          studentId: cleanStudentId,
          studentName: studentName || 'Student',
          isLive: status,
          lastSeen: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (err) {
        console.error('Heartbeat error:', err);
      }
    };

    sendHeartbeat(true);
    const interval = setInterval(() => sendHeartbeat(true), 10000);

    const handleUnload = () => {
      try {
        updateDoc(docRef, { isLive: false, lastSeen: serverTimestamp() });
      } catch (_) {}
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      handleUnload();
    };
  }, [sectionId, cleanStudentId, studentName]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    const mc = masterCanvasRef.current;
    if (mc) {
      const mCtx = mc.getContext('2d');
      mCtx.beginPath();
      mCtx.moveTo(x, y);
    }

    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCoordinates(e);

    const isEraser = tool === 'eraser';
    const strokeWidth = isEraser ? thickness * 5 : thickness;

    // 1. Draw to display canvas
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = isEraser ? '#ffffff' : '#1e293b';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();

    // 2. Draw to persistent master buffer
    const mc = masterCanvasRef.current;
    if (mc) {
      const mCtx = mc.getContext('2d');
      if (isEraser) {
        mCtx.save();
        mCtx.globalCompositeOperation = 'destination-out';
        mCtx.strokeStyle = 'rgba(0,0,0,1)';
        mCtx.lineWidth = strokeWidth;
        mCtx.lineCap = 'round';
        mCtx.lineJoin = 'round';
        mCtx.lineTo(x, y);
        mCtx.stroke();
        mCtx.restore();
      } else {
        mCtx.strokeStyle = '#1e293b';
        mCtx.lineWidth = strokeWidth;
        mCtx.lineCap = 'round';
        mCtx.lineJoin = 'round';
        mCtx.lineTo(x, y);
        mCtx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Refresh grid underneath eraser strokes cleanly
    if (tool === 'eraser') {
      renderCanvas();
    }
    syncToFirestore();
  };

  const syncToFirestore = async () => {
    if (!sectionId || !cleanStudentId) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.5);

    try {
      const docRef = doc(db, 'class_whiteboards', sectionId, 'students', cleanStudentId);
      await setDoc(docRef, {
        studentId: cleanStudentId,
        studentName: studentName || 'Student',
        dataUrl,
        isLive: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('Error syncing whiteboard:', err);
    }
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mc = masterCanvasRef.current;
    if (mc) {
      const mCtx = mc.getContext('2d');
      mCtx.clearRect(0, 0, mc.width, mc.height);
    }

    const ctx = canvas.getContext('2d');
    redrawGrid(ctx, canvas.width, canvas.height, gridSize);
    syncToFirestore();
  };

  return (
    <div
      ref={wrapperRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col h-screen w-screen p-3 sm:p-5 overflow-hidden"
          : "bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-6 w-full flex flex-col"
      }
    >
      {/* Top Header / Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              ← Back to Menu
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Live Math Scratchpad</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Live Sync Active" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sketch area models, number lines, or work out your steps.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tool Selector */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tool === 'pen'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pen
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                tool === 'eraser'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Eraser
            </button>
          </div>

          {/* Stroke Size */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Size:</span>
            <input
              type="range"
              min="1"
              max="10"
              value={thickness}
              onChange={(e) => setThickness(Number(e.target.value))}
              className="w-20 accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Grid Size */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <span>Grid:</span>
            <select
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              <option value="15">Fine</option>
              <option value="25">Standard</option>
              <option value="40">Large</option>
            </select>
          </div>

          {/* Clear Board */}
          <button
            type="button"
            onClick={clearBoard}
            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Clear Board
          </button>

          {/* Fullscreen Workspace Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isFullscreen
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm hover:bg-blue-500'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
            }`}
            title={isFullscreen ? "Exit Fullscreen" : "Expand to Fullscreen"}
          >
            <span>{isFullscreen ? "✕" : "⛶"}</span>
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </div>
      </div>

      {/* Canvas Workspace Area */}
      <div
        ref={canvasContainerRef}
        style={isFullscreen ? undefined : { height: `${canvasHeight}px` }}
        className={`w-full relative overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-crosshair ${
          isFullscreen
            ? "flex-1 min-h-0 rounded-xl border border-slate-200 dark:border-slate-800"
            : "rounded-t-xl border border-slate-200 dark:border-slate-800"
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full touch-none block"
        />
      </div>

      {/* Drag-to-Resize Handle (Active in non-fullscreen mode) */}
      {!isFullscreen && (
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 rounded-b-xl border-x border-b border-slate-200 dark:border-slate-800 cursor-row-resize select-none flex flex-col items-center justify-center gap-1 transition-colors group"
          title="Click and drag down to make workspace bigger"
        >
          <div className="w-16 h-1 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-blue-500 transition-colors" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
            Drag to resize workspace ({canvasHeight}px)
          </span>
        </div>
      )}
    </div>
  );
}
