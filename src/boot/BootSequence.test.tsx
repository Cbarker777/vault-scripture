import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BootSequence } from "./BootSequence";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("BootSequence", () => {
  it("reveals lines over time and completes on its own", () => {
    const onComplete = vi.fn();
    render(<BootSequence onComplete={onComplete} />);

    expect(screen.queryByText(/MEMORY CHECK/)).toBeNull();

    // Advance in steps matching each individual setTimeout delay rather
    // than one big jump — the component schedules its next timer from
    // inside the previous timer's callback, and a single large
    // advanceTimersByTime doesn't reliably let React re-run the effect
    // and register that next timer before jumping past it.
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(screen.getByText(/MEMORY CHECK/)).toBeTruthy();
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(350);
    });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("skips immediately on any keypress", () => {
    const onComplete = vi.fn();
    render(<BootSequence onComplete={onComplete} />);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
