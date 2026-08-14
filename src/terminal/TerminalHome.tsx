export type Screen = "terminal" | "reader" | "archive" | "quests";

export function TerminalHome({
  onNavigate,
}: {
  onNavigate: (screen: "reader" | "archive" | "quests") => void;
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
        <span className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          Stats — not yet installed
        </span>
        <span className="chrome-label" style={{ color: "var(--phosphor-dim)" }}>
          Stash — not yet installed
        </span>
      </nav>
    </div>
  );
}
