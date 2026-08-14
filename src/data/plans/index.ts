import { chronologicalPlan } from "./chronological";
import { nt90Plan } from "./nt90";
import { psalmsProverbsDailyPlan } from "./psalmsProverbsDaily";
import type { Plan } from "./types";

export const PLANS: Plan[] = [chronologicalPlan, nt90Plan, psalmsProverbsDailyPlan];

export type { Plan, PlanDay, PlanReading } from "./types";
