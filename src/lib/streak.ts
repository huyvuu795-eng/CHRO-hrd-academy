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
  3: ['Dẫn khí nhập thể', 'Ba ngày liên tiếp — linh khí đầu tiên đã vào kinh mạch.'],
  10: ['Luyện Khí viên mãn', 'Mười ngày không ngắt quãng. Nền móng đã vững.'],
  30: ['Trúc Cơ', 'Một tháng bền bỉ — đạo cơ đã thành.'],
  90: ['Kết Đan', 'Ba tháng tu luyện: đi hết một quý học HR.'],
  100: ['Kim Đan đại thành', 'Một trăm ngày, kim đan sáng rực.'],
  365: ['Nguyên Anh', 'Tròn một năm tu luyện mỗi ngày — nguyên anh đã thành hình.'],
  1000: ['Hoá Thần', 'Một nghìn ngày. Rất ít người đi được đến cảnh giới này.'],
  2000: ['Độ Kiếp phi thăng', 'Hai nghìn ngày — thiên kiếp cũng không cản được đạo tâm.'],
};

export function treasureFor(days: number): Treasure {
  const [title, message] = TITLES[days] ?? ['Đại Thừa', `${days.toLocaleString('vi-VN')} ngày bế quan liên tiếp — kỷ lục của chính đạo hữu.`];
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
