import { useEffect, useState, type RefObject } from "react";

// True once the given element has intersected the viewport at least once.
export function useScrollCompletion(target: RefObject<Element | null>): boolean {
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const el = target.current;
    if (!el || completed) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setCompleted(true);
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, completed]);

  return completed;
}
