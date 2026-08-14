export type Screen = "terminal" | "reader" | "archive" | "quests" | "stats" | "stash";

export function TerminalHome({
  onNavigate,
}: {
  onNavigate: (screen: "reader" | "archive" | "quests" | "stats" | "stash") => void;
}) {
  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-8 text-lg" style={{ color: "var(--amber)" }}>
        Vault Scripture Terminal
      </h1>
      <nav className="flex flex-col items-start gap-3">
        <button
          type="button"
          className="chrome-label hover:text-white"
          onClick={() => onNavigate("reader")}
        >
          Reader
        </button>
        <button
          type="button"
          className="chrome-label hover:text-white"
          onClick={() => onNavigate("stats")}
        >
          Stats
        </button>
        <button
          type="button"
          className="chrome-label hover:text-white"
          onClick={() => onNavigate("stash")}
        >
          Stash
        </button>
        <button
          type="button"
          className="chrome-label hover:text-white"
          onClick={() => onNavigate("quests")}
        >
          Quests
        </button>
        <button
          type="button"
          className="chrome-label hover:text-white"
          onClick={() => onNavigate("archive")}
        >
          Archive
        </button>
      </nav>
    </div>
  );
}
