function localDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

// Consecutive local calendar days with at least one logged session,
// counting backward from `today`. If today has no session yet, the
// streak is 0 (call this after logging today's session, not before).
export function currentStreakDays(sessionEndedAtIsoList: string[], today: Date): number {
  const daysWithSessions = new Set(sessionEndedAtIsoList.map((iso) => localDayKey(new Date(iso))));

  let streak = 0;
  const cursor = new Date(today);
  while (daysWithSessions.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
