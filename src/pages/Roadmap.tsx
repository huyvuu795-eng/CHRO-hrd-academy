import { useState } from 'react';
import { PageHeader } from '../components/ui';
import { stages } from '../lib/content';
import { useStore } from '../lib/store';

export default function Roadmap() {
  const { state, update } = useStore();
  const curIdx = Math.max(0, stages.findIndex((s) => s.id === state.currentStage));
  const [open, setOpen] = useState<string>(stages[curIdx]?.id);

  return (
    <div>
      <PageHeader title="Lộ trình 10 năm" subtitle="Recruiter → HR Director / CHRO" />
      <ol className="relative">
        {stages.map((s, i) => {
          const isCur = i === curIdx;
          const done = i < curIdx;
          const isOpen = open === s.id;
          return (
            <li key={s.id} className="relative pb-4 pl-10">
              {i < stages.length - 1 && (
                <span className={`absolute left-[15px] top-8 h-full w-0.5 ${done ? 'bg-brand-600' : 'bg-stone-200 dark:bg-stone-800'}`} />
              )}
              <span
                className={`absolute left-0 top-1 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-bold ${
                  isCur
                    ? 'border-brand-600 bg-brand-600 text-white ring-4 ring-brand-600/20'
                    : done
                      ? 'border-brand-600 bg-white text-brand-700 dark:bg-stone-950'
                      : 'border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-950'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <div className={`card ${isCur ? 'border-brand-400 dark:border-brand-700' : ''}`}>
                <button className="w-full text-left" onClick={() => setOpen(isOpen ? '' : s.id)}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-stone-500">{s.years}</span>
                    {isCur && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Hiện tại</span>}
                  </div>
                  <h2 className="font-semibold">{s.title}</h2>
                  <p className="text-sm text-stone-500">{s.role}</p>
                </button>
                {isOpen && (
                  <div className="mt-3 space-y-3 border-t border-stone-100 pt-3 text-sm dark:border-stone-800">
                    <p className="leading-relaxed">{s.summary}</p>
                    <Block title="Năng lực cần đạt" items={s.competencies} />
                    <Block title="Kinh nghiệm cần tích luỹ" items={s.experience} />
                    <Block title="Chứng chỉ gợi ý" items={s.certifications} />
                    <Block title="Dấu mốc chuyển giai đoạn" items={s.milestones} />
                    {!isCur && (
                      <button className="btn-ghost w-full" onClick={() => update((d) => void (d.currentStage = s.id))}>
                        Đánh dấu đây là giai đoạn hiện tại
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Block({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="label mb-1">{title}</div>
      <ul className="space-y-1">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 leading-snug">
            <span className="text-brand-600">•</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
