import { useEffect, useState } from "react";

const LINES = [
  "MEMORY CHECK ......... OK",
  "VAULT ID ............. VS-01",
  "SCRIPTURE PACK ....... WEB v1 LOADED",
];

const LINE_DELAY_MS = 350;
const HOLD_AFTER_MS = 500;

export function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    if (revealed >= LINES.length) {
      const timer = setTimeout(onComplete, HOLD_AFTER_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setRevealed((n) => n + 1), LINE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [revealed, onComplete]);

  useEffect(() => {
    window.addEventListener("keydown", onComplete);
    return () => window.removeEventListener("keydown", onComplete);
  }, [onComplete]);

  return (
    <div className="chrome flex min-h-screen flex-col items-start justify-center gap-2 px-8 text-sm">
      {LINES.slice(0, revealed).map((line) => (
        <div key={line} className="chrome-label">
          {line}
        </div>
      ))}
    </div>
  );
}
