export type PlanReading = { bookId: string; chapter: number };
export type PlanDay = { day: number; readings: PlanReading[] };
export type Plan = { id: string; name: string; days: PlanDay[] };
