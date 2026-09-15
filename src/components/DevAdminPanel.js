import { useState, useRef, useEffect } from "react";

export default function DevAdminPanel({
  isDevMode,
  setIsLocked,
  handleFinishExam,
  handleSimulateCorrect,
  handleTryHarder,
  canTriggerHarder,
}) {
  if (!isDevMode) return null;

  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isInitialized, setIsInitialized] = useState(false);
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

  useEffect(() => {
    if (!isInitialized && typeof window !== "undefined") {
      setPosition({ x: window.innerWidth - 320, y: 20 });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handlePointerDown = (e) => {
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
    };
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    const newX = dragRef.current.initialX + dx;
    const newY = dragRef.current.initialY + dy;

    // VIEWPORT BOUNDARY CLAMPING (Prevents disappearing into the abyss)
    const panelWidth = 280;
    const minX = -panelWidth + 60; // Leaves at least 60px visible on left edge
    const maxX = window.innerWidth - 60; // Leaves at least 60px visible on right edge
    const minY = 0;
    const maxY = window.innerHeight - 50;

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    });
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;
    dragRef.current.isDragging = false;
    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed bg-emerald-900/95 text-emerald-200 p-4 rounded-xl shadow-2xl border border-emerald-500 z-[9999] flex flex-col gap-2 font-mono text-xs select-none"
    >
      <div
        className="font-bold border-b border-emerald-700 pb-1 flex justify-between items-center cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <span>DEV MODE</span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setIsLocked(true)}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1 rounded font-bold transition"
        >
          [Lock Exam]
        </button>
        <button
          onClick={() => setIsLocked(false)}
          className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1 rounded font-bold transition"
        >
          [Unlock Exam]
        </button>
        <button
          onClick={handleFinishExam}
          className="bg-red-900/80 hover:bg-red-800 text-red-100 px-3 py-1 rounded font-bold transition"
        >
          [Force Finish]
        </button>
        {handleSimulateCorrect && (
          <button
            onClick={handleSimulateCorrect}
            className="bg-blue-800 hover:bg-blue-700 text-blue-100 px-3 py-1 rounded font-bold transition"
          >
            [Simulate Correct]
          </button>
        )}
        {handleTryHarder && canTriggerHarder && (
          <button
            onClick={handleTryHarder}
            className="bg-orange-800 hover:bg-orange-700 text-orange-100 px-3 py-1 rounded font-bold transition"
          >
            [Trigger Harder]
          </button>
        )}
      </div>
    </div>
  );
}
