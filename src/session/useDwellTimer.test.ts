import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDwellTimer } from "./useDwellTimer";

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { value: hidden, configurable: true });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("useDwellTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accrues one second per tick once focused and visible", () => {
    const { result } = renderHook(() => useDwellTimer(true));
    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(3);
  });

  it("pauses while the tab is hidden", () => {
    const { result } = renderHook(() => useDwellTimer(true));
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    setHidden(true);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(0);
  });

  it("pauses on window blur and resumes on focus", () => {
    const { result } = renderHook(() => useDwellTimer(true));
    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(2);

    act(() => {
      window.dispatchEvent(new Event("blur"));
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(2);

    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(4);
  });

  it("pauses after 90s of no scroll/keyboard/pointer activity", () => {
    const { result } = renderHook(() => useDwellTimer(true));
    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(90_000);
    });
    expect(result.current).toBe(90);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(90);
  });

  it("resumes after idle once scroll activity resets the clock", () => {
    const { result } = renderHook(() => useDwellTimer(true));
    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(89_000);
    });
    expect(result.current).toBe(89);

    act(() => {
      window.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(2000);
    });
    expect(result.current).toBe(91);
  });

  it("does not accrue when inactive", () => {
    const { result } = renderHook(() => useDwellTimer(false));
    act(() => {
      window.dispatchEvent(new Event("focus"));
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(0);
  });
});
