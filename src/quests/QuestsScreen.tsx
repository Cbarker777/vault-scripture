import { useEffect, useState } from "react";
import { BOOKS } from "../data/bible";
import { PLANS } from "../data/plans";
import { getStoredPlanId, setStoredPlanId } from "../data/plans/planStorage";
import { firstIncompletePlanDay } from "../data/plans/progress";
import { listReadingSessions } from "../db/adapter";
import type { ReadingSession } from "../session/types";
import { getBountyForDate, isBountyComplete } from "./bounty";
import { deriveQuests, firstUnreadChapter } from "./quests";

function bookName(bookId: string): string {
  return BOOKS.find((b) => b.id === bookId)?.name ?? bookId;
}

export function QuestsScreen({
  onOpenReading,
}: {
  onOpenReading: (bookId: string, chapter: number) => void;
}) {
  const [sessions, setSessions] = useState<ReadingSession[] | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(() => getStoredPlanId());
  // null = auto-track progress (advance as days are completed); a number
  // means the user manually browsed to a specific day and it should stick
  // until they switch plans.
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    void listReadingSessions().then(setSessions);
  }, []);

  if (sessions === null) {
    return (
      <div className="chrome chrome-label min-h-screen px-8 py-10 text-sm">
        Loading quests…
      </div>
    );
  }

  const quests = deriveQuests(sessions);
  const completedCount = quests.filter((q) => q.completedAt !== null).length;

  const today = new Date();
  const bounty = getBountyForDate(today);
  const bountyDone = isBountyComplete(sessions, bounty, today);

  const readSet = new Set(sessions.map((s) => `${s.bookId}:${s.chapter}`));

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[0];
  const effectiveDay = selectedDay ?? firstIncompletePlanDay(selectedPlan, readSet);
  const dayReadings = selectedPlan.days.find((d) => d.day === effectiveDay)?.readings ?? [];
  const dayReadCount = dayReadings.filter((r) => readSet.has(`${r.bookId}:${r.chapter}`)).length;

  return (
    <div className="chrome min-h-screen px-8 py-10 text-sm">
      <h1 className="chrome-label mb-6 text-lg" style={{ color: "var(--amber)" }}>
        Quests
      </h1>

      <section className="mb-10">
        <h2 className="chrome-label mb-2" style={{ color: "var(--amber)" }}>
          Daily Bounty
        </h2>
        <p>
          <button
            type="button"
            className="underline hover:text-white"
            onClick={() => onOpenReading(bounty.bookId, bounty.chapter)}
          >
            {bookName(bounty.bookId)} {bounty.chapter}
          </button>{" "}
          —{" "}
          <span style={{ color: bountyDone ? "var(--phosphor)" : "var(--phosphor-dim)" }}>
            {bountyDone ? "COMPLETE" : "OPEN — expires at local midnight"}
          </span>
        </p>
      </section>

      <section className="mb-10">
        <h2 className="chrome-label mb-2" style={{ color: "var(--amber)" }}>
          Reading Plans
        </h2>
        <div className="mb-3 flex flex-wrap gap-2">
          {PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              className="chrome-label border border-current px-2 py-1"
              style={{
                color: plan.id === selectedPlanId ? "var(--vault)" : "var(--phosphor)",
                background: plan.id === selectedPlanId ? "var(--phosphor)" : "transparent",
              }}
              onClick={() => {
                setSelectedPlanId(plan.id);
                setStoredPlanId(plan.id);
                setSelectedDay(null);
              }}
            >
              {plan.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="plan-day" className="chrome-label">
            Day
          </label>
          <input
            id="plan-day"
            type="number"
            min={1}
            max={selectedPlan.days.length}
            value={effectiveDay}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n >= 1 && n <= selectedPlan.days.length) setSelectedDay(n);
            }}
            className="w-20 border border-current bg-transparent px-2 py-1"
          />
          <span style={{ color: "var(--phosphor-dim)" }}>of {selectedPlan.days.length}</span>
          {dayReadings.length > 0 && (
            <span style={{ color: "var(--phosphor-dim)" }}>
              — {dayReadCount}/{dayReadings.length} read
            </span>
          )}
        </div>
        <p className="mt-2 flex flex-wrap gap-x-1">
          {dayReadings.length === 0 ? (
            "No readings assigned."
          ) : (
            dayReadings.map((r, i) => {
              const done = readSet.has(`${r.bookId}:${r.chapter}`);
              return (
                <span key={`${r.bookId}:${r.chapter}`}>
                  <button
                    type="button"
                    className="underline hover:text-white"
                    style={{ color: done ? "var(--amber)" : "var(--phosphor)" }}
                    onClick={() => onOpenReading(r.bookId, r.chapter)}
                  >
                    {bookName(r.bookId)} {r.chapter}
                  </button>
                  {i < dayReadings.length - 1 ? "," : ""}
                </span>
              );
            })
          )}
        </p>
      </section>

      <section>
        <h2 className="chrome-label mb-2" style={{ color: "var(--amber)" }}>
          Questlines ({completedCount}/{quests.length} complete)
        </h2>
        <ul className="flex flex-col gap-2">
          {quests.map((q) => {
            const book = BOOKS.find((b) => b.id === q.bookId)!;
            const pct = Math.round((q.chaptersRead.length / book.chapterCount) * 100);
            const nextChapter = firstUnreadChapter(book.chapterCount, q.chaptersRead);
            return (
              <li key={q.bookId} className="flex items-center gap-3">
                <button
                  type="button"
                  className="chrome-label w-40 shrink-0 text-left underline hover:text-white"
                  style={{ color: q.completedAt ? "var(--amber)" : "var(--phosphor)" }}
                  onClick={() => onOpenReading(q.bookId, nextChapter)}
                >
                  {book.name}
                </button>
                <div className="h-2 flex-1 border border-current">
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: q.completedAt ? "var(--amber)" : "var(--phosphor)",
                    }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right" style={{ color: "var(--phosphor-dim)" }}>
                  {q.chaptersRead.length}/{book.chapterCount}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
