import { useState } from 'react';
import { PageHeader } from '../components/ui';
import { decks } from '../lib/content';
import { go } from '../lib/router';
import { isDue } from '../lib/sm2';
import { useStore } from '../lib/store';

export default function Cards() {
  const { state } = useStore();
  const [browse, setBrowse] = useState<string | null>(null);

  const stats = (cards: { id: string }[]) => {
    const due = cards.filter((c) => isDue(state.cards[c.id])).length;
    const fresh = cards.filter((c) => !state.cards[c.id]).length;
    const learned = cards.filter((c) => (state.cards[c.id]?.interval ?? 0) >= 21).length;
    return { due, fresh, learned, total: cards.length };
  };
  const all = stats(decks.flatMap((d) => d.cards));

  return (
    <div>
      <PageHeader title="Thẻ luật lao động" subtitle="BLLĐ 2019 & văn bản hướng dẫn · lặp lại ngắt quãng (SM-2)" />

      <section className="card mb-4">
        <div className="mb-3 grid grid-cols-3 text-center">
          <div>
            <div className="text-2xl font-bold tabular-nums text-amber-600">{all.due}</div>
            <div className="text-xs text-stone-500">Đến hạn</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-sky-600">{all.fresh}</div>
            <div className="text-xs text-stone-500">Thẻ mới</div>
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-brand-700 dark:text-brand-400">{all.learned}</div>
            <div className="text-xs text-stone-500">Đã thuộc</div>
          </div>
        </div>
        <button className="btn-primary w-full" disabled={!all.due && !all.fresh} onClick={() => go('/cards/review?topic=all')}>
          Ôn tất cả ({all.due} đến hạn + tối đa {Math.min(all.fresh, state.settings.dailyNewCards)} mới)
        </button>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">
          ⚠️ Thẻ có biểu tượng cảnh báo là nội dung có thể đã được sửa đổi bởi văn bản mới — luôn đối chiếu văn bản gốc trên vbpl.vn hoặc thuvienphapluat.vn trước khi áp dụng.
        </p>
      </section>

      <button onClick={() => go('/library')} className="card mb-4 flex w-full items-center gap-3 text-left hover:border-brand-400">
        <span className="text-2xl">📚</span>
        <span className="flex-1">
          <span className="block font-semibold">Thư viện văn bản gốc</span>
          <span className="block text-xs text-stone-500">BLLĐ, NĐ 145, Thuế TNCN 2025, lương tối thiểu 2026–2027, BHXH…</span>
        </span>
        <span className="text-stone-400">›</span>
      </button>

      <h2 className="label mb-2">Theo chủ đề</h2>
      <div className="space-y-2">
        {decks.map((d) => {
          const s = stats(d.cards);
          const isOpen = browse === d.topic.id;
          return (
            <section key={d.topic.id} className="card">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{d.topic.name}</h3>
                  <p className="text-xs text-stone-500">
                    {s.total} thẻ · <span className="text-amber-600">{s.due} đến hạn</span> · <span className="text-sky-600">{s.fresh} mới</span>
                  </p>
                </div>
                <button className="btn-ghost min-h-[36px] px-3" onClick={() => setBrowse(isOpen ? null : d.topic.id)}>
                  {isOpen ? 'Ẩn' : 'Xem'}
                </button>
                <button className="btn-primary min-h-[36px] px-3" disabled={!s.due && !s.fresh} onClick={() => go(`/cards/review?topic=${d.topic.id}`)}>
                  Ôn
                </button>
              </div>
              {isOpen && (
                <ul className="mt-3 divide-y divide-stone-100 border-t border-stone-100 dark:divide-stone-800 dark:border-stone-800">
                  {d.cards.map((c) => (
                    <li key={c.id} className="py-3 text-sm">
                      <p className="font-medium leading-snug">{c.front}</p>
                      <p className="mt-1 whitespace-pre-line leading-relaxed text-stone-600 dark:text-stone-300">{c.back}</p>
                      <p className="mt-1 text-xs font-semibold text-brand-700 dark:text-brand-400">
                        {c.ref} {c.verify && <span className="text-amber-600">· ⚠️ Cần kiểm tra lại văn bản gốc</span>}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
