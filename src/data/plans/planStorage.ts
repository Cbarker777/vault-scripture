import { PLANS } from "./index";

const STORAGE_KEY = "vault-scripture:selected-plan";

export function getStoredPlanId(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  const match = PLANS.find((p) => p.id === stored);
  return match ? match.id : PLANS[0].id;
}

export function setStoredPlanId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}
