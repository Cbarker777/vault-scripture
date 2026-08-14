import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book, Chapter } from "../data/bible/types";
import { ChapterView } from "./ChapterView";

const logReadingSession = vi.fn().mockResolvedValue(undefined);
const hasReadChapterBefore = vi.fn().mockResolvedValue(false);
const listSelectedPerks = vi.fn().mockResolvedValue([]);
vi.mock("../db/adapter", () => ({
  logReadingSession: (...args: unknown[]) => logReadingSession(...args),
  hasReadChapterBefore: (...args: unknown[]) => hasReadChapterBefore(...args),
  listSelectedPerks: (...args: unknown[]) => listSelectedPerks(...args),
}));

const runPostSessionEffects = vi.fn().mockResolvedValue({
  leveledUp: false,
  newLevel: 1,
  itemsDropped: [],
  capsEarned: 0,
});
vi.mock("../game/onSessionLogged", () => ({
  runPostSessionEffects: (...args: unknown[]) => runPostSessionEffects(...args),
}));

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: number[] = [];
  callback: IntersectionObserverCallback;
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = () => [];

  fireIntersecting() {
    this.callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      this,
    );
  }
}

const book: Book = { id: "psa", name: "Psalms", testament: "OT", genre: "Wisdom", chapters: [] };
const chapter: Chapter = {
  number: 134,
  wordCount: 40, // expectedSeconds = 10
  verses: [
    { number: 1, text: "Look! Praise Yahweh." },
    { number: 2, text: "Lift up your hands." },
  ],
};

const fifteenWords = "word ".repeat(15);

beforeEach(() => {
  vi.useFakeTimers();
  logReadingSession.mockClear();
  hasReadChapterBefore.mockClear();
  listSelectedPerks.mockClear();
  runPostSessionEffects.mockClear();
  MockIntersectionObserver.instances = [];
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  Object.defineProperty(document, "hidden", { value: false, configurable: true });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("ChapterView", () => {
  it("logs an unverified session when nothing has happened yet", async () => {
    render(<ChapterView book={book} chapter={chapter} />);

    await act(async () => {
      fireEvent.click(screen.getByText("LOG SESSION"));
    });

    expect(logReadingSession).toHaveBeenCalledTimes(1);
    const session = logReadingSession.mock.calls[0][0];
    expect(session.verified).toBe(false);
    expect(session.xpAwarded).toBe(0);
    expect(screen.getByText("Logged. No XP — verification incomplete.")).toBeTruthy();
  });

  it("logs a verified session once dwell, scroll, and reflection all clear, awarding real XP", async () => {
    render(<ChapterView book={book} chapter={chapter} />);

    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      MockIntersectionObserver.instances[0].fireIntersecting();
    });

    fireEvent.change(screen.getByLabelText(/Reflection/), { target: { value: fifteenWords } });

    await act(async () => {
      fireEvent.click(screen.getByText("LOG SESSION"));
    });

    expect(logReadingSession).toHaveBeenCalledTimes(1);
    const session = logReadingSession.mock.calls[0][0];
    expect(session.verified).toBe(true);
    expect(session.dwellSeconds).toBeGreaterThanOrEqual(10);
    expect(session.reflection).toBe(fifteenWords.trim());
    // baseXP=ceil(40/25)=2, depth=1x (dwell==expected), first read=1.5x -> round(2*1.5)=3
    expect(session.xpAwarded).toBe(3);
    expect(screen.getByText(/^Logged\. Verified — \+3 XP\.$/)).toBeTruthy();
  });

  it("disables the reflection field and button after logging", async () => {
    render(<ChapterView book={book} chapter={chapter} />);

    await act(async () => {
      fireEvent.click(screen.getByText("LOG SESSION"));
    });

    expect(screen.getByLabelText(/Reflection/)).toBeDisabled();
    expect(screen.getByText("LOG SESSION")).toBeDisabled();
  });
});
