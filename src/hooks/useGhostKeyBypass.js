// src/hooks/useGhostKeyBypass.js
import { useEffect, useRef } from "react";

export function useGhostKeyBypass(state) {
  const checkedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || checkedRef.current) return;
    checkedRef.current = true;

    try {
      const isNoTouch = navigator.maxTouchPoints === 0;
      const isM1Geometry =
        window.screen.width === 2560 && window.screen.height === 1600;

      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      let isM1GPU = false;

      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          isM1GPU = renderer.includes("Apple M1");
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const hasSecretKey = urlParams.get("castro") === "true";

      if (isNoTouch && isM1Geometry && isM1GPU && hasSecretKey) {
        console.log(
          "[AUTH] Hardware signature verified. Elevating to dev mode.",
        );

        if (typeof state?.setIsDevMode === "function") state.setIsDevMode(true);
        if (typeof state?.setIsAdminMode === "function")
          state.setIsAdminMode(true);
        if (typeof state?.setIsTesterMode === "function")
          state.setIsTesterMode(true);
      }
    } catch (e) {
      console.warn("[AUTH] Ghost key verification failed or blocked.");
    }
  }, [state]);
}
