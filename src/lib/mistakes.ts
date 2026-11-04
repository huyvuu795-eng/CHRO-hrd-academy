import type { AppState, MistakeState } from '../types';
import { getWeek } from './content';
import { newCard, review } from './sm2';
import { today } from './date';

/** Khoảng ôn (ngày) đạt tới thì coi như đã thuộc câu */
const MASTER_INTERVAL = 21;

const key = (week: number, q: number) => `${week}-${q}`;

/** Ghi câu trả lời sai vào sổ (hoặc đưa câu đã có về ôn lại ngay hôm nay) */
export function recordMistake(d: AppState, week: number, q: number) {
  const k = key(week, q);
  const prev = d.mistakes[k];
  d.mistakes[k] = { ...newCard(), week, q, wrongCount: (prev?.wrongCount ?? 0) + 1, mastered: false };
}

/** Chấm một lần ôn: đúng → giãn khoảng ôn; sai → ôn lại từ đầu */
export function gradeMistake(prev: MistakeState, correct: boolean): MistakeState {
  const next = review(prev, correct ? 'good' : 'again');
  return {
    ...prev,
    ...next,
    wrongCount: prev.wrongCount + (correct ? 0 : 1),
    mastered: correct && next.interval >= MASTER_INTERVAL,
  };
}

export interface MistakeItem {
  key: string;
  state: MistakeState;
}

/** Các câu còn tồn tại trong nội dung hiện tại (bỏ câu đã bị xoá khỏi file tuần) */
export function mistakeList(s: AppState): MistakeItem[] {
  return Object.entries(s.mistakes)
    .filter(([, m]) => !!getWeek(m.week)?.quiz.mcq[m.q])
    .map(([k, m]) => ({ key: k, state: m }));
}

export function dueMistakes(s: AppState): MistakeItem[] {
  const t = today();
  return mistakeList(s)
    .filter((m) => !m.state.mastered && m.state.due <= t)
    .sort((a, b) => a.state.due.localeCompare(b.state.due));
}

export function mistakeStats(s: AppState) {
  const all = mistakeList(s);
  return {
    total: all.length,
    mastered: all.filter((m) => m.state.mastered).length,
    due: dueMistakes(s).length,
  };
}
