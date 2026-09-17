// src/hooks/useBatchPrint.js
import { useState, useEffect, useRef } from "react";

export function useBatchPrint(delayMs = 800) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);
  const cleanupRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current();
    };
  }, []);

  const triggerBatchPrint = () => {
    setIsPreparingPrint(true);

    const timer = setTimeout(() => {
      const handleAfterPrint = () => {
        setIsPreparingPrint(false);
        window.removeEventListener("afterprint", handleAfterPrint);
      };

      window.addEventListener("afterprint", handleAfterPrint);

      window.print();

      const fallbackTimer = setTimeout(() => {
        setIsPreparingPrint(false);
        window.removeEventListener("afterprint", handleAfterPrint);
      }, 5000);

      cleanupRef.current = () => {
        clearTimeout(fallbackTimer);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
    }, delayMs);

    cleanupRef.current = () => clearTimeout(timer);
  };

  const currentOrigin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://math-mayan-app.vercel.app";

  return {
    isPreparingPrint,
    triggerBatchPrint,
    currentOrigin,
  };
}
