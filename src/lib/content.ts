// Nạp toàn bộ nội dung từ thư mục /content lúc build.
// Thêm file mới đúng định dạng là app tự nhận — không cần sửa code (xem CONTENT_GUIDE.md).
import type { Competency, FlashcardDeck, OutlineWeek, Stage, WeekContent } from '../types';
import roadmapJson from '../../content/roadmap.json';
import competenciesJson from '../../content/competencies.json';
import outlineJson from '../../content/year1-outline.json';

const weekModules = import.meta.glob<WeekContent>('../../content/weeks/*.json', {
  eager: true,
  import: 'default',
});
const lessonModules = import.meta.glob<string>('../../content/lessons/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
});
const deckModules = import.meta.glob<FlashcardDeck>('../../content/flashcards/*.json', {
  eager: true,
  import: 'default',
});

export const stages = roadmapJson.stages as Stage[];
export const competencies = competenciesJson as Competency[];

export const weeks: WeekContent[] = Object.values(weekModules).sort((a, b) => a.week - b.week);
const weekMap = new Map(weeks.map((w) => [w.week, w]));

/** Danh sách 52 tuần: tuần có file đầy đủ + tuần chỉ có dàn ý */
export const yearPlan: (OutlineWeek & { full: boolean })[] = (() => {
  const outline = new Map((outlineJson as OutlineWeek[]).map((o) => [o.week, o]));
  const maxWeek = Math.max(52, ...weeks.map((w) => w.week));
  const list: (OutlineWeek & { full: boolean })[] = [];
  for (let i = 1; i <= maxWeek; i++) {
    const w = weekMap.get(i);
    if (w) list.push({ week: i, title: w.title, focus: w.phase, full: true });
    else if (outline.has(i)) list.push({ ...outline.get(i)!, full: false });
  }
  return list;
})();

export function getWeek(n: number): WeekContent | undefined {
  return weekMap.get(n);
}

export function getLesson(file: string): string {
  return lessonModules[`../../content/lessons/${file}`] ?? '> ⚠️ Không tìm thấy file bài học `' + file + '`.';
}

export const decks: FlashcardDeck[] = Object.values(deckModules).sort(
  (a, b) => a.topic.order - b.topic.order,
);

export const allCards = decks.flatMap((d) => d.cards.map((c) => ({ ...c, topicId: d.topic.id })));
