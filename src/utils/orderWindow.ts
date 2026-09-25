// Feature flag for the ordering time-window restriction below. Flip to
// false to let employees order any time — e.g. while this feature is
// still being tuned — without removing the rest of the logic.
export const ORDER_WINDOW_RESTRICTION_ENABLED = false;

interface TimeOfDay {
  hour: number;
  minute: number;
}

interface OrderWindow {
  label: string;
  emoji: string;
  start: TimeOfDay;
  end: TimeOfDay;
}

// Morning: 8:00 AM – 9:45 AM. Afternoon: 1:00 PM – 2:45 PM.
export const ORDER_WINDOWS: OrderWindow[] = [
  {
    label: "Morning",
    emoji: "🌅",
    start: { hour: 8, minute: 0 },
    end: { hour: 9, minute: 45 },
  },
  {
    label: "Evening",
    emoji: "🌇",
    start: { hour: 13, minute: 0 },
    end: { hour: 14, minute: 45 },
  },
];

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function toMinutes(time: TimeOfDay): number {
  return time.hour * 60 + time.minute;
}

export function isWithinOrderWindow(date: Date = new Date()): boolean {
  if (!ORDER_WINDOW_RESTRICTION_ENABLED) return true;
  const nowMinutes = minutesSinceMidnight(date);
  return ORDER_WINDOWS.some(
    (window) =>
      nowMinutes >= toMinutes(window.start) &&
      nowMinutes <= toMinutes(window.end),
  );
}

function formatTime({ hour, minute }: TimeOfDay): string {
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

export function formatOrderWindows(): string {
  return ORDER_WINDOWS.map(
    (w) => `${formatTime(w.start)}–${formatTime(w.end)}`,
  ).join(" and ");
}

export function getLabeledOrderWindows(): {
  label: string;
  emoji: string;
  range: string;
}[] {
  return ORDER_WINDOWS.map((w) => ({
    label: w.label,
    emoji: w.emoji,
    range: `${formatTime(w.start)} – ${formatTime(w.end)}`,
  }));
}

// Which labeled window (if any) a given moment falls into — used to greet
// an order by "morning"/"evening" based on when it was actually placed,
// not the current time (those can differ once brewing takes a few minutes).
export function getOrderWindowFor(
  date: Date,
): { label: string; emoji: string } | null {
  const minutes = minutesSinceMidnight(date);
  const match = ORDER_WINDOWS.find(
    (window) =>
      minutes >= toMinutes(window.start) && minutes <= toMinutes(window.end),
  );
  return match ? { label: match.label, emoji: match.emoji } : null;
}

// Safety-net checkpoints: if pantry staff forget to hit "Clear board", the
// board auto-clears itself shortly after the morning window (12:30 PM) and
// again after the evening window (6:00 PM), so a missed clear never blocks
// the next round of ordering.
export const AUTO_CLEAR_CHECKPOINTS: TimeOfDay[] = [
  { hour: 12, minute: 30 },
  { hour: 18, minute: 0 },
];

// The most recent checkpoint that has already passed today, as a
// millisecond timestamp — or null if none have passed yet.
export function getLastPassedCheckpoint(
  date: Date = new Date(),
): number | null {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  let lastPassed: number | null = null;
  for (const checkpoint of AUTO_CLEAR_CHECKPOINTS) {
    const checkpointTime = new Date(startOfDay);
    checkpointTime.setHours(checkpoint.hour, checkpoint.minute, 0, 0);
    if (date.getTime() >= checkpointTime.getTime()) {
      lastPassed = checkpointTime.getTime();
    }
  }
  return lastPassed;
}
