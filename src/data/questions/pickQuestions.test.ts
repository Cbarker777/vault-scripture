import { describe, expect, it } from "vitest";
import { pickQuestions } from "./pickQuestions";
import type { ComprehensionQuestion } from "./types";

function q(question: string): ComprehensionQuestion {
  return { question, choices: ["a", "b", "c"], correctIndex: 0 };
}

describe("pickQuestions", () => {
  it("returns all questions unchanged when there are 3 or fewer", () => {
    const three = [q("1"), q("2"), q("3")];
    expect(pickQuestions(three, () => 0)).toHaveLength(3);
    expect(pickQuestions([q("1")], () => 0)).toHaveLength(1);
  });

  it("samples exactly 3 when more are authored", () => {
    const five = [q("1"), q("2"), q("3"), q("4"), q("5")];
    const picked = pickQuestions(five, () => 0.5);
    expect(picked).toHaveLength(3);
  });

  it("only returns questions that were actually in the source set", () => {
    const five = [q("1"), q("2"), q("3"), q("4"), q("5")];
    const picked = pickQuestions(five, () => 0.9);
    for (const p of picked) {
      expect(five).toContainEqual(p);
    }
  });

  it("is deterministic for a given random source", () => {
    const five = [q("1"), q("2"), q("3"), q("4"), q("5")];
    const a = pickQuestions(five, () => 0.1);
    const b = pickQuestions(five, () => 0.1);
    expect(a).toEqual(b);
  });

  it("does not mutate the input array", () => {
    const five = [q("1"), q("2"), q("3"), q("4"), q("5")];
    const copy = [...five];
    pickQuestions(five, () => 0.5);
    expect(five).toEqual(copy);
  });
});
