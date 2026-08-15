import { describe, expect, it } from "vitest";
import { gradeComprehensionCheck } from "./grade";
import type { ComprehensionQuestion } from "./types";

const questions: ComprehensionQuestion[] = [
  { question: "Q1", choices: ["a", "b"], correctIndex: 0 },
  { question: "Q2", choices: ["a", "b"], correctIndex: 1 },
  { question: "Q3", choices: ["a", "b"], correctIndex: 0 },
];

describe("gradeComprehensionCheck", () => {
  it("passes with all 3 correct", () => {
    expect(gradeComprehensionCheck(questions, [0, 1, 0])).toBe(true);
  });

  it("passes with exactly 2 of 3 correct", () => {
    expect(gradeComprehensionCheck(questions, [0, 1, 1])).toBe(true);
  });

  it("fails with only 1 of 3 correct", () => {
    expect(gradeComprehensionCheck(questions, [0, 0, 1])).toBe(false);
  });

  it("fails with 0 correct", () => {
    expect(gradeComprehensionCheck(questions, [1, 0, 1])).toBe(false);
  });
});
