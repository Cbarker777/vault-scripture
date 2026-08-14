import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Book, Chapter } from "../data/bible/types";
import { ChapterView } from "./ChapterView";

const logReadingSession = vi.fn().mockResolvedValue(undefined);
vi.mock("../db/adapter", () => ({
  logReadingSession: (...args: unknown[]) => logReadingSession(...args),
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
  it("logs an unverified session when nothing has happened yet", () => {
    render(<ChapterView book={book} chapter={chapter} />);
    fireEvent.click(screen.getByText("LOG SESSION"));

    expect(logReadingSession).toHaveBeenCalledTimes(1);
    const session = logReadingSession.mock.calls[0][0];
    expect(session.verified).toBe(false);
    expect(session.xpAwarded).toBe(0);
    expect(screen.getByText("Logged. No XP — verification incomplete.")).toBeTruthy();
  });

  it("logs a verified session once dwell, scroll, and reflection all clear", () => {
    render(<ChapterView book={book} chapter={chapter} />);

    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(10_000);
    });

    act(() => {
      MockIntersectionObserver.instances[0].fireIntersecting();
    });

    fireEvent.change(screen.getByLabelText(/Reflection/), { target: { value: fifteenWords } });
    fireEvent.click(screen.getByText("LOG SESSION"));

    expect(logReadingSession).toHaveBeenCalledTimes(1);
    const session = logReadingSession.mock.calls[0][0];
    expect(session.verified).toBe(true);
    expect(session.dwellSeconds).toBeGreaterThanOrEqual(10);
    expect(session.reflection).toBe(fifteenWords.trim());
    expect(
      screen.getByText("Logged. Verified — XP awaits the progression system."),
    ).toBeTruthy();
  });

  it("disables the reflection field and button after logging", () => {
    render(<ChapterView book={book} chapter={chapter} />);
    fireEvent.click(screen.getByText("LOG SESSION"));

    expect(screen.getByLabelText(/Reflection/)).toBeDisabled();
    expect(screen.getByText("LOG SESSION")).toBeDisabled();
  });
});
