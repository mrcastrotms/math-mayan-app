// src/hooks/useDraggablePanel.js
import { useState, useRef } from "react";

export function useDraggablePanel(panelWidth = 280) {
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      return { x: window.innerWidth - 320, y: 20 };
    }
    return { x: 20, y: 20 };
  });

  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
  });

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

    const minX = -panelWidth + 60;
    const maxX = window.innerWidth - 60;
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

  return {
    position,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
