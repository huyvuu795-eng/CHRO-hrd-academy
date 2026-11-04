import type { DayKey } from '../types';

const pad = (n: number) => String(n).padStart(2, '0');

/** YYYY-MM-DD theo giờ máy (không dùng UTC để tránh lệch ngày ở VN) */
export function today(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function thisMonth(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function addDays(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return today(new Date(y, m - 1, d + days));
}

export const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'mon', label: 'Thứ 2', short: 'T2' },
  { key: 'tue', label: 'Thứ 3', short: 'T3' },
  { key: 'wed', label: 'Thứ 4', short: 'T4' },
  { key: 'thu', label: 'Thứ 5', short: 'T5' },
  { key: 'fri', label: 'Thứ 6', short: 'T6' },
  { key: 'sat', label: 'Thứ 7', short: 'T7' },
  { key: 'sun', label: 'Chủ nhật', short: 'CN' },
];

export function todayKey(): DayKey {
  return DAYS[(new Date().getDay() + 6) % 7].key;
}

/** Số ngày học liên tiếp, tính đến hôm nay (hoặc hôm qua nếu hôm nay chưa học). */
export function streak(days: string[]): number {
  const set = new Set(days);
  let cur = today();
  if (!set.has(cur)) cur = addDays(cur, -1);
  let n = 0;
  while (set.has(cur)) {
    n++;
    cur = addDays(cur, -1);
  }
  return n;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
