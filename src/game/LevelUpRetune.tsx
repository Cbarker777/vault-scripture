import { useEffect, useState } from "react";
import { useGameEventsStore } from "../store/gameEvents";

const DESATURATE_MS = 400;
const DISMISS_MS = 3000;
const TYPE_INTERVAL_MS = 40;

// "The terminal retunes": screen desaturates for 400ms, then the level
// line types itself out character by character. No confetti, no modal,
// no sound. Respects prefers-reduced-motion by skipping the desaturate
// and typewriter and just showing the final line.
export function LevelUpRetune() {
  const levelUpTo = useGameEventsStore((s) => s.levelUpTo);
  const clearLevelUp = useGameEventsStore((s) => s.clearLevelUp);
  const [desaturating, setDesaturating] = useState(false);
  const [revealed, setRevealed] = useState(0);

  const text = levelUpTo === null ? "" : `LEVEL ${levelUpTo} REACHED`;

  useEffect(() => {
    if (levelUpTo === null) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fullText = `LEVEL ${levelUpTo} REACHED`;

    if (reducedMotion) {
      setDesaturating(false);
      setRevealed(fullText.length);
    } else {
      setDesaturating(true);
      setRevealed(0);
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    let typeTimer: ReturnType<typeof setInterval> | null = null;

    if (!reducedMotion) {
      timers.push(setTimeout(() => setDesaturating(false), DESATURATE_MS));
      typeTimer = setInterval(() => {
        setRevealed((n) => (n < fullText.length ? n + 1 : n));
      }, TYPE_INTERVAL_MS);
    }

    timers.push(setTimeout(clearLevelUp, DISMISS_MS));

    return () => {
      timers.forEach(clearTimeout);
      if (typeTimer) clearInterval(typeTimer);
    };
  }, [levelUpTo, clearLevelUp]);

  if (levelUpTo === null) return null;

  return (
    <>
      {desaturating && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backdropFilter: "grayscale(1)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />
      )}
      <div
        className="chrome chrome-label"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          padding: "8px 12px",
          border: "1px solid var(--phosphor)",
          color: "var(--amber)",
          zIndex: 50,
        }}
      >
        {text.slice(0, revealed)}
      </div>
    </>
  );
}
