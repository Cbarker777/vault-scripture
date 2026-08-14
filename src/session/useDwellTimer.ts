import { useEffect, useRef, useState } from "react";

const IDLE_TIMEOUT_MS = 90_000;

// Active dwell time: paused on tab blur, window blur, and 90s of no
// scroll/interaction. Ticks once per second while none of those hold.
export function useDwellTimer(active: boolean): number {
  const [dwellSeconds, setDwellSeconds] = useState(0);
  const lastActivityRef = useRef(Date.now());
  const tabVisibleRef = useRef(!document.hidden);
  const windowFocusedRef = useRef(document.hasFocus());

  useEffect(() => {
    if (!active) return;

    function markActivity() {
      lastActivityRef.current = Date.now();
    }
    function handleVisibility() {
      tabVisibleRef.current = !document.hidden;
    }
    function handleFocus() {
      windowFocusedRef.current = true;
      markActivity();
    }
    function handleBlur() {
      windowFocusedRef.current = false;
    }

    window.addEventListener("scroll", markActivity, { passive: true, capture: true });
    window.addEventListener("keydown", markActivity);
    window.addEventListener("pointerdown", markActivity);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    const interval = setInterval(() => {
      const idleFor = Date.now() - lastActivityRef.current;
      const paused =
        !tabVisibleRef.current || !windowFocusedRef.current || idleFor > IDLE_TIMEOUT_MS;
      if (!paused) setDwellSeconds((s) => s + 1);
    }, 1000);

    return () => {
      window.removeEventListener("scroll", markActivity, true);
      window.removeEventListener("keydown", markActivity);
      window.removeEventListener("pointerdown", markActivity);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      clearInterval(interval);
    };
  }, [active]);

  return dwellSeconds;
}
