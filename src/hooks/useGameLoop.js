import { useEffect, useRef } from "react";

/**
 * requestAnimationFrame tabanlı oyun döngüsü.
 * dt saniye cinsinden gelir; paused iken tick çağrılmaz.
 */
export function useGameLoop(onTick, { paused } = {}) {
  const callbackRef = useRef(onTick);
  const lastTsRef = useRef(null);
  const rafRef = useRef(null);

  callbackRef.current = onTick;

  useEffect(() => {
    if (paused) {
      lastTsRef.current = null;
      return undefined;
    }

    const frame = (ts) => {
      const last = lastTsRef.current ?? ts;
      lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      callbackRef.current(dt);
      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, [paused]);
}
