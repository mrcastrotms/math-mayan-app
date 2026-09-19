import React, { useRef, useState, useEffect } from "react";

export default function Scratchpad() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pen"); // "pen" or "eraser"

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e) => {
    e.stopPropagation();
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = (e) => {
    if (e) e.stopPropagation();
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.stopPropagation();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    if (clientX === undefined || clientY === undefined) return;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = tool === "eraser" ? 28 : 3;
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : "#2563eb";

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="mt-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 shadow-sm p-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Scratchpad / Workspace</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTool("pen")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              tool === "pen" ? "bg-blue-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Pen
          </button>
          <button
            type="button"
            onClick={() => setTool("eraser")}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
              tool === "eraser" ? "bg-amber-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            }`}
          >
            Eraser
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="px-3 py-1 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            Clear
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={700}
        height={160}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseMove={draw}
        onTouchStart={startDrawing}
        onTouchEnd={stopDrawing}
        onTouchMove={draw}
        className="w-full h-40 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg cursor-crosshair bg-zinc-50 dark:bg-zinc-950 touch-none"
      />
    </div>
  );
}
