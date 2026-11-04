import type { CardState } from '../types';
import { addDays, today } from './date';

export type Grade = 'again' | 'hard' | 'good' | 'easy';

// Ánh xạ 4 nút sang thang chất lượng q (0–5) của SM-2
const Q: Record<Grade, number> = { again: 1, hard: 3, good: 4, easy: 5 };

export function newCard(): CardState {
  return { ef: 2.5, interval: 0, reps: 0, lapses: 0, due: today() };
}

/** Thuật toán SuperMemo-2, có thêm hệ số thưởng cho "Dễ" và phạt nhẹ cho "Khó". */
export function review(prev: CardState | undefined, grade: Grade): CardState {
  const s = prev ?? newCard();
  const q = Q[grade];
  const ef = Math.max(1.3, s.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  let reps: number;
  let interval: number;
  let lapses = s.lapses;

  if (q < 3) {
    reps = 0;
    interval = 1;
    lapses++;
  } else {
    reps = s.reps + 1;
    if (reps === 1) interval = grade === 'easy' ? 3 : 1;
    else if (reps === 2) interval = grade === 'hard' ? 3 : 6;
    else interval = Math.round(s.interval * ef * (grade === 'hard' ? 0.8 : 1));
    if (grade === 'easy' && reps > 1) interval = Math.round(interval * 1.3);
    interval = Math.max(1, interval);
  }

  const t = today();
  return { ef, reps, interval, lapses, due: addDays(t, interval), last: t };
}

export function isDue(s: CardState | undefined): boolean {
  return !!s && s.due <= today();
}

/** Nhãn khoảng cách dự kiến hiển thị dưới mỗi nút */
export function previewInterval(prev: CardState | undefined, grade: Grade): string {
  if (grade === 'again') return 'ôn lại';
  const d = review(prev, grade).interval;
  if (d < 30) return `${d} ngày`;
  if (d < 365) return `${Math.round(d / 30)} tháng`;
  return `${(d / 365).toFixed(1)} năm`;
}
