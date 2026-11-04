import { addDays, streak, today } from './date';

export const MILESTONES = [3, 10, 30, 90, 100, 365, 1000, 2000];

/** Các mốc: danh sách cố định, sau 2.000 ngày cứ mỗi 1.000 ngày thêm một rương */
export function milestonesUpTo(n: number): number[] {
  const list = MILESTONES.filter((m) => m <= n);
  for (let m = 3000; m <= n; m += 1000) list.push(m);
  return list;
}

/** Ngày bắt đầu của chuỗi hiện tại (để chuỗi mới sau khi đứt vẫn được mở rương lại) */
export function streakStart(days: string[]): string | null {
  const n = streak(days);
  if (!n) return null;
  const end = days.includes(today()) ? today() : addDays(today(), -1);
  return addDays(end, -(n - 1));
}

export interface Treasure {
  days: number;
  title: string;
  message: string;
}

const TITLES: Record<number, [string, string]> = {
  3: ['Giọt nước đầu tiên', 'Ba ngày liên tiếp — thói quen đã bắt đầu thấm.'],
  10: ['Dòng suối nhỏ', 'Mười ngày không ngắt quãng. Nước chảy đá mòn.'],
  30: ['Con sông', 'Một tháng bền bỉ — kiến thức đã thành dòng chảy.'],
  90: ['Đại dương', 'Ba tháng: bạn đã đi hết một quý học HR.'],
  100: ['Ngọc trai trăm ngày', 'Một trăm ngày, hạt cát đã thành ngọc.'],
  365: ['Một vòng thuỷ triều', 'Tròn một năm học mỗi ngày — một năm của người làm nghề nghiêm túc.'],
  1000: ['Huyền thoại biển sâu', 'Một nghìn ngày. Rất ít người đi được đến đây.'],
  2000: ['Long Vương', 'Hai nghìn ngày — bạn chính là đại dương.'],
};

export function treasureFor(days: number): Treasure {
  const [title, message] = TITLES[days] ?? ['Kho báu Long cung', `${days.toLocaleString('vi-VN')} ngày liên tiếp — kỷ lục của chính bạn.`];
  return { days, title, message };
}

/** Rương cần mở lúc này (mốc cao nhất đã đạt trong chuỗi hiện tại mà chưa mở), hoặc null */
export function pendingTreasure(days: string[], opened: string[]): { treasure: Treasure; keys: string[] } | null {
  const start = streakStart(days);
  if (!start) return null;
  const reached = milestonesUpTo(streak(days));
  const keys = reached.map((m) => `${start}:${m}`);
  const fresh = reached.filter((_, i) => !opened.includes(keys[i]));
  if (!fresh.length) return null;
  // Chỉ mở rương của mốc cao nhất, các mốc thấp hơn đánh dấu luôn là đã mở
  return { treasure: treasureFor(fresh[fresh.length - 1]), keys };
}
