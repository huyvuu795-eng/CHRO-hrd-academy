import { useState } from 'react';
import { PageHeader, Progress } from '../components/ui';
import { allCards, decks } from '../lib/content';
import { go } from '../lib/router';
import { type Grade, isDue, previewInterval, review } from '../lib/sm2';
import { markStudied, useStore } from '../lib/store';
import { sfx } from '../lib/sound';

const BUTTONS: { grade: Grade; label: string; cls: string }[] = [
  { grade: 'again', label: 'Quên', cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900' },
  { grade: 'hard', label: 'Khó', cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900' },
  { grade: 'good', label: 'Nhớ', cls: 'bg-brand-50 text-brand-800 border-brand-200 dark:bg-brand-900/30 dark:text-brand-200 dark:border-brand-800' },
  { grade: 'easy', label: 'Dễ', cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:text-sky-300 dark:border-sky-900' },
];

export default function Review({ topic }: { topic: string }) {
  const { state, update } = useStore();
  const deckName = decks.find((d) => d.topic.id === topic)?.topic.name ?? 'Tất cả chủ đề';

  // Hàng đợi chốt một lần khi mở phiên: thẻ đến hạn trước, rồi thẻ mới (giới hạn/ngày)
  const [queue, setQueue] = useState<string[]>(() => {
    const pool = allCards.filter((c) => topic === 'all' || c.topicId === topic);
    const due = pool.filter((c) => isDue(state.cards[c.id])).sort((a, b) => state.cards[a.id].due.localeCompare(state.cards[b.id].due));
    const fresh = pool.filter((c) => !state.cards[c.id]).slice(0, state.settings.dailyNewCards);
    return [...due, ...fresh].map((c) => c.id);
  });
  const [initial] = useState(queue.length);
  const [doneCount, setDoneCount] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = allCards.find((c) => c.id === queue[0]);
  const flip = () => {
    if (!flipped) sfx.bubble();
    setFlipped(true);
  };

  const grade = (g: Grade) => {
    if (!card) return;
    update((d) => {
      d.cards[card.id] = review(d.cards[card.id], g);
      markStudied(d);
    });
    setFlipped(false);
    if (g !== 'again' && queue.length === 1) sfx.fanfare(); // thẻ cuối của phiên
    else if (g === 'again') sfx.bubble();
    else sfx.drop();
    if (g === 'again') {
      // đưa thẻ quên về cuối hàng để gặp lại ngay trong phiên
      setQueue((q) => [...q.slice(1), q[0]]);
    } else {
      setQueue((q) => q.slice(1));
      setDoneCount((n) => n + 1);
    }
  };

  return (
    <div>
      <PageHeader
        title="Ôn thẻ luật"
        subtitle={deckName}
        right={
          <button onClick={() => go('/cards')} className="grid h-10 w-10 place-items-center rounded-full text-xl hover:bg-stone-200/60 dark:hover:bg-stone-800" aria-label="Đóng">
            ✕
          </button>
        }
      />
      <div className="mb-4 flex items-center gap-3 text-xs text-stone-500">
        <Progress value={initial ? (doneCount / initial) * 100 : 100} />
        <span className="shrink-0 tabular-nums">
          {doneCount}/{initial}
        </span>
      </div>

      {!card ? (
        <div className="card text-center">
          <div className="mb-2 text-5xl">✅</div>
          <h2 className="mb-1 font-semibold">Xong phiên ôn hôm nay!</h2>
          <p className="mb-4 text-sm text-stone-500">Quay lại ngày mai — thuật toán sẽ đưa thẻ ra đúng lúc bạn sắp quên.</p>
          <button className="btn-primary w-full" onClick={() => go('/cards')}>
            Về danh sách thẻ
          </button>
        </div>
      ) : (
        <>
          <button onClick={flip} className="card mb-4 flex min-h-[320px] w-full flex-col text-left">
            <div className="label mb-3">{decks.find((d) => d.topic.id === card.topicId)?.topic.name}</div>
            <p className="text-lg font-semibold leading-snug">{card.front}</p>
            {flipped ? (
              <div className="mt-4 border-t border-stone-100 pt-4 dark:border-stone-800">
                <p className="whitespace-pre-line text-[15px] leading-relaxed">{card.back}</p>
                <p className="mt-3 text-sm font-semibold text-brand-700 dark:text-brand-400">📌 {card.ref}</p>
                {card.verify && (
                  <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
                    ⚠️ Cần kiểm tra lại văn bản gốc — nội dung có thể đã được sửa đổi/thay thế.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-auto pt-6 text-center text-sm text-stone-400">Chạm để lật thẻ</p>
            )}
          </button>
          {flipped ? (
            <div className="grid grid-cols-4 gap-2">
              {BUTTONS.map((b) => (
                <button key={b.grade} onClick={() => grade(b.grade)} className={`flex flex-col items-center rounded-xl border py-2.5 font-semibold active:scale-95 ${b.cls}`}>
                  <span className="text-sm">{b.label}</span>
                  <span className="text-[10px] font-normal opacity-80">{previewInterval(state.cards[card.id], b.grade)}</span>
                </button>
              ))}
            </div>
          ) : (
            <button className="btn-primary w-full" onClick={flip}>
              Hiện đáp án
            </button>
          )}
        </>
      )}
    </div>
  );
}
