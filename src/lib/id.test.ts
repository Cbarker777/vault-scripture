import { describe, expect, it } from "vitest";
import { generateId } from "./id";

const UUID_V4_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateId", () => {
  it("produces a well-formed version-4 UUID", () => {
    expect(generateId()).toMatch(UUID_V4_PATTERN);
  });

  it("does not repeat across many calls", () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});
