// src/hooks/useBatchPrint.js
import { useState } from "react";

export function useBatchPrint(delayMs = 800) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const triggerBatchPrint = () => {
    setIsPreparingPrint(true);

    setTimeout(() => {
      const handleAfterPrint = () => {
        setIsPreparingPrint(false);
        window.removeEventListener("afterprint", handleAfterPrint);
      };

      window.addEventListener("afterprint", handleAfterPrint);

      window.print();

      // Fallback cleanup in case afterprint does not fire on mobile/older browsers
      setTimeout(() => {
        setIsPreparingPrint(false);
      }, 5000);
    }, delayMs);
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
