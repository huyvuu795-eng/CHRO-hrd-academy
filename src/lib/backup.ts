import type { AppState } from '../types';
import { addDays, today } from './date';

const REMIND_AFTER_DAYS = 7;

/** Tải file JSON sao lưu toàn bộ tiến độ về máy */
export function downloadBackup(state: AppState) {
  const blob = new Blob([JSON.stringify({ app: 'hrd-academy', exportedAt: new Date().toISOString(), state }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hrd-academy-backup-${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Có nên nhắc sao lưu không: đã có tiến độ, quá 7 ngày chưa export và không đang hoãn nhắc */
export function needsBackup(s: AppState): boolean {
  if (!s.studyDays.length) return false;
  const t = today();
  if (s.backupSnoozeUntil && s.backupSnoozeUntil > t) return false;
  if (!s.lastBackup) return s.studyDays.length >= 2;
  return addDays(s.lastBackup.slice(0, 10), REMIND_AFTER_DAYS) <= t;
}

export function daysSinceBackup(s: AppState): number | null {
  if (!s.lastBackup) return null;
  return Math.floor((Date.now() - new Date(s.lastBackup).getTime()) / 86_400_000);
}
