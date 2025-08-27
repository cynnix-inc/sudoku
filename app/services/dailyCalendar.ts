import type { StatsData, DailyResult } from './stats';

export type CalendarDay = {
  utcDate: string; // YYYYMMDD
  isInMonth: boolean;
  isToday: boolean;
  isFuture: boolean;
  completed: boolean; // any win recorded for that UTC date
};

function formatUTCDate(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}

function dayIndex(d: Date): number {
  return Math.floor(d.getTime() / 86400000);
}

function parseDayIndex(utc: string): number | null {
  if (!/^\d{8}$/.test(utc)) return null;
  const y = Number(utc.slice(0, 4));
  const m = Number(utc.slice(4, 6)) - 1;
  const dd = Number(utc.slice(6, 8));
  return Math.floor(Date.UTC(y, m, dd) / 86400000);
}

export function getTodayUTCDateString(now: Date = new Date()): string {
  return formatUTCDate(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())),
  );
}

function buildCompletionSet(recent: DailyResult[]): Set<number> {
  const set = new Set<number>();
  for (const r of recent) {
    if (r.result !== 'win') continue;
    const idx = parseDayIndex(r.date);
    if (idx != null) set.add(idx);
  }
  return set;
}

/**
 * Build a 6x7 calendar matrix for the given UTC month.
 * - Weeks start on Sunday (UTC).
 * - Future days relative to `today` are marked isFuture=true.
 * - Completion is derived from StatsData.recentDailyResults.
 */
export function buildMonthMatrix(
  yearUTC: number,
  monthIndexUTC: number, // 0-based
  stats: StatsData | null,
  today: Date = new Date(),
): CalendarDay[][] {
  const firstOfMonth = new Date(Date.UTC(yearUTC, monthIndexUTC, 1));
  const firstWeekday = firstOfMonth.getUTCDay(); // 0=Sun
  const start = new Date(firstOfMonth.getTime() - firstWeekday * 86400000);
  const todayIdx = dayIndex(
    new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
  );
  const completeSet = buildCompletionSet(stats?.recentDailyResults ?? []);

  const out: CalendarDay[][] = [];
  let cursor = new Date(start);
  for (let w = 0; w < 6; w++) {
    const row: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const idx = dayIndex(cursor);
      const utc = formatUTCDate(cursor);
      const isInMonth =
        cursor.getUTCFullYear() === yearUTC && cursor.getUTCMonth() === monthIndexUTC;
      const isToday = idx === todayIdx;
      const isFuture = idx > todayIdx;
      row.push({
        utcDate: utc,
        isInMonth,
        isToday,
        isFuture,
        completed: completeSet.has(idx),
      });
      cursor = new Date(cursor.getTime() + 86400000);
    }
    out.push(row);
  }
  return out;
}
