export function nextAssignableSlot(now = new Date()): Date {
  const next = new Date(now);
  next.setMinutes(Math.floor(next.getMinutes() / 15) * 15 + 15, 0, 0);
  return next;
}

export function canStartScheduledVisit(scheduledFor: string | null, now = new Date()): boolean {
  if (!scheduledFor) return false;

  const scheduled = new Date(scheduledFor);
  if (Number.isNaN(scheduled.getTime())) return false;

  const earliestStart = new Date(scheduled.getTime() - 15 * 60_000);
  return now.toDateString() === scheduled.toDateString() && now >= earliestStart;
}
