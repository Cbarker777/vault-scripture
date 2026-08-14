import { BOOKS } from "../bible";
import { distributeReadings } from "./generatePlan";
import type { Plan, PlanReading } from "./types";

const DAYS = 90;

function buildReadings(): PlanReading[] {
  return BOOKS.filter((b) => b.testament === "NT").flatMap((b) =>
    Array.from({ length: b.chapterCount }, (_, i) => ({ bookId: b.id, chapter: i + 1 })),
  );
}

export const nt90Plan: Plan = {
  id: "nt-90",
  name: "New Testament in 90",
  days: distributeReadings(buildReadings(), DAYS),
};
