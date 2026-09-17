import { useState } from "react";

export function useBatchPrint(delayMs = 600) {
  const [isPreparingPrint, setIsPreparingPrint] = useState(false);

  const triggerBatchPrint = () => {
    setIsPreparingPrint(true);
    setTimeout(() => {
      window.print();
      setIsPreparingPrint(false);
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
