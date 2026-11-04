import type { AppState, WeekContent } from '../types';
import { DAYS } from './date';
import { isPassed, isUnlocked } from './store';
import { weeks } from './content';

export function weekTaskCount(w: WeekContent): number {
  return DAYS.reduce((n, d) => n + (w.daily[d.key]?.length ?? 0), 0);
}

export function weekDoneCount(s: AppState, w: WeekContent): number {
  const c = s.checklist[w.week] ?? {};
  return DAYS.reduce((n, d) => n + (c[d.key]?.filter(Boolean).length ?? 0), 0);
}

/** % hoàn thành tuần = checklist hằng ngày đã tick / tổng số việc */
export function weekPct(s: AppState, w: WeekContent): number {
  const total = weekTaskCount(w);
  return total ? Math.round((weekDoneCount(s, w) / total) * 100) : 0;
}

/** Tuần đang học: tuần đầu tiên đã mở khoá nhưng chưa đạt mini test */
export function currentWeek(s: AppState): WeekContent | undefined {
  const open = weeks.filter((w) => isUnlocked(s, w.week));
  return open.find((w) => !isPassed(s, w.week)) ?? open[open.length - 1];
}
