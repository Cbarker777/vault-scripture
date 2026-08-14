// crypto.randomUUID() is restricted to secure contexts (HTTPS or
// localhost) — this app is meant to run over plain HTTP on a home LAN
// (Docker on Unraid, accessed by IP), so we can't rely on it. Build a
// UUID v4 by hand from crypto.getRandomValues(), which has no such
// restriction.
export function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
