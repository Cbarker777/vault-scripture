const SESSION_KEY = "vault-scripture:booted-this-session";
const LAST_SHOWN_KEY = "vault-scripture:boot-last-shown-at";
const COOLDOWN_MS = 60 * 60 * 1000;

export function shouldShowBoot(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  if (sessionStorage.getItem(SESSION_KEY)) return false;
  const lastShown = localStorage.getItem(LAST_SHOWN_KEY);
  if (lastShown && Date.now() - Number(lastShown) < COOLDOWN_MS) return false;
  return true;
}

export function markBootShown(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
  localStorage.setItem(LAST_SHOWN_KEY, String(Date.now()));
}
