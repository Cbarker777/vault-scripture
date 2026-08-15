import { useState } from "react";
import { saveVerse } from "../db/adapter";
import { generateId } from "../lib/id";

export function SaveVersePanel({
  bookId,
  bookName,
  chapter,
  verseNumber,
  verseText,
  onClose,
}: {
  bookId: string;
  bookName: string;
  chapter: number;
  verseNumber: number;
  verseText: string;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await saveVerse({
        id: generateId(),
        bookId,
        chapter,
        verse: verseNumber,
        verseText,
        note: note.trim().length > 0 ? note.trim() : null,
        savedAt: new Date().toISOString(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="chrome"
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 480, width: "100%" }}>
        <h2 className="chrome-label mb-3 text-lg" style={{ color: "var(--amber)" }}>
          Save {bookName} {chapter}:{verseNumber}
        </h2>
        <p
          className="reading-pane mb-4"
          style={{ fontSize: "16px", padding: "12px", border: "1px solid var(--phosphor-dim)" }}
        >
          {verseText}
        </p>
        <label htmlFor="verse-note" className="chrome-label mb-2 block">
          Note (optional)
        </label>
        <textarea
          id="verse-note"
          className="w-full border border-current bg-transparent p-2"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          autoFocus
        />
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            className="chrome-label border border-current px-3 py-1 disabled:opacity-40"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            Save Verse
          </button>
          <button
            type="button"
            className="chrome-label border border-current px-3 py-1"
            disabled={saving}
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
