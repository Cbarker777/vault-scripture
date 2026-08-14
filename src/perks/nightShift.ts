// Night Shift perk window: 2200-0500 local time.
export function isNightShiftHours(date: Date): boolean {
  const hour = date.getHours();
  return hour >= 22 || hour < 5;
}
