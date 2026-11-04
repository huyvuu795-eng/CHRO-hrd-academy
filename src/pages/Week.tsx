import { useEffect, useState } from 'react';
import { Markdown } from '../components/Markdown';
import { Check, Empty, PageHeader, Progress, Tabs } from '../components/ui';
import { getLesson, getWeek } from '../lib/content';
import { DAYS, formatDate, todayKey } from '../lib/date';
import { weekPct } from '../lib/progress';
import { go } from '../lib/router';
import { PASS_PCT, bestScore, isUnlocked, markStudied, useStore } from '../lib/store';
import type { DayKey } from '../types';
import { sfx } from '../lib/sound';

type Tab = 'lesson' | 'checklist' | 'practice' | 'test' | 'journal';
const TABS: { id: Tab; label: string }[] = [
  { id: 'lesson', label: 'Bài học' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'practice', label: 'Thực hành' },
  { id: 'test', label: 'Mini test' },
  { id: 'journal', label: 'Nhật ký' },
];

export default function Week({ week, tab }: { week: number; tab: string }) {
  const { state, update } = useStore();
  const w = getWeek(week);
  const active = (TABS.some((t) => t.id === tab) ? tab : 'lesson') as Tab;
  const setTab = (t: Tab) => window.location.replace(`#/week/${week}?tab=${t}`);

  if (!w) {
    return (
      <div>
        <PageHeader title={`Tuần ${week}`} backTo="/learn" />
        <Empty>Tuần này chưa có nội dung. Xem CONTENT_GUIDE.md để thêm.</Empty>
      </div>
    );
  }

  if (!isUnlocked(state, week)) {
    return (
      <div>
        <PageHeader title={`Tuần ${week}`} subtitle={w.title} backTo="/learn" />
        <div className="card text-center">
          <div className="mb-2 text-4xl">🔒</div>
          <h2 className="mb-1 font-semibold">Tuần {week} đang khoá</h2>
          <p className="mb-4 text-sm text-stone-500">
            Đạt ≥ {PASS_PCT}% mini test tuần {week - 1} để mở khoá. Nếu đã nắm chắc kiến thức, bạn có thể mở thủ công.
          </p>
          <div className="grid gap-2">
            <button className="btn-primary" onClick={() => go(`/week/${week - 1}?tab=test`)}>
              Làm test tuần {week - 1}
            </button>
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm(`Mở khoá tuần ${week} mà không cần đạt test tuần trước?`))
                  update((d) => {
                    if (!d.overrides.includes(week)) d.overrides.push(week);
                  });
              }}
            >
              Mở khoá thủ công (override)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Tuần ${week}`} subtitle={w.title} backTo="/learn" />
      <Tabs tabs={TABS} value={active} onChange={setTab} />
      {active === 'lesson' && <LessonTab weekNo={week} />}
      {active === 'checklist' && <ChecklistTab weekNo={week} />}
      {active === 'practice' && <PracticeTab weekNo={week} />}
      {active === 'test' && <TestTab weekNo={week} />}
      {active === 'journal' && <JournalTab weekNo={week} />}
      <WeekNav week={week} pct={weekPct(state, w)} />
    </div>
  );
}

function WeekNav({ week, pct }: { week: number; pct: number }) {
  return (
    <div className="mt-6 flex items-center gap-3 text-xs text-stone-500">
      <span className="shrink-0">Hoàn thành tuần</span>
      <Progress value={pct} />
      <span className="shrink-0 tabular-nums">{pct}%</span>
      {getWeek(week + 1) && (
        <button className="shrink-0 font-semibold text-brand-700 dark:text-brand-400" onClick={() => go(`/week/${week + 1}`)}>
          Tuần {week + 1} →
        </button>
      )}
    </div>
  );
}

function LessonTab({ weekNo }: { weekNo: number }) {
  const w = getWeek(weekNo)!;
  return (
    <>
      <section className="card mb-4">
        <div className="label mb-2">Mục tiêu tuần này</div>
        <ul className="space-y-1.5">
          {w.objectives.map((o, i) => (
            <li key={i} className="flex gap-2 text-[15px] leading-snug">
              <span className="text-brand-600">◆</span>
              {o}
            </li>
          ))}
        </ul>
      </section>
      <article className="card">
        <div className="label mb-3">📖 Bài đọc · ~{w.readingMinutes ?? 12} phút</div>
        <Markdown>{getLesson(w.lesson)}</Markdown>
      </article>
    </>
  );
}

function ChecklistTab({ weekNo }: { weekNo: number }) {
  const { state, update } = useStore();
  const w = getWeek(weekNo)!;
  const tk = todayKey();
  const [open, setOpen] = useState<DayKey>(tk);

  const toggle = (day: DayKey, i: number) =>
    update((d) => {
      const wk = (d.checklist[weekNo] ??= {});
      const arr = (wk[day] ??= []);
      arr[i] = !arr[i];
      if (arr[i]) markStudied(d);
    });

  return (
    <div className="space-y-2">
      {DAYS.map((day) => {
        const tasks = w.daily[day.key] ?? [];
        const done = state.checklist[weekNo]?.[day.key] ?? [];
        const n = done.filter(Boolean).length;
        const isOpen = open === day.key;
        return (
          <section key={day.key} className="card p-0">
            <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(isOpen ? ('' as DayKey) : day.key)}>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold ${
                  n === tasks.length && tasks.length
                    ? 'bg-brand-600 text-white'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                }`}
              >
                {day.short}
              </span>
              <span className="flex-1 font-medium">
                {day.label} {day.key === tk && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">HÔM NAY</span>}
              </span>
              <span className="text-sm tabular-nums text-stone-500">
                {n}/{tasks.length}
              </span>
            </button>
            {isOpen && (
              <div className="border-t border-stone-100 px-2 pb-2 pt-1 dark:border-stone-800">
                {tasks.map((t, i) => (
                  <Check key={i} checked={!!done[i]} onChange={() => toggle(day.key, i)}>
                    {t}
                  </Check>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function PracticeTab({ weekNo }: { weekNo: number }) {
  const { state, update } = useStore();
  const w = getWeek(weekNo)!;
  const done = state.practiceDone[weekNo] ?? [];
  return (
    <div className="space-y-3">
      {w.practice.map((p, i) => (
        <section key={i} className="card">
          <div className="label mb-1">Bài thực hành {i + 1}</div>
          <h3 className="mb-2 font-semibold leading-snug">{p.title}</h3>
          {p.context && <p className="mb-3 rounded-xl bg-stone-100 p-3 text-sm leading-relaxed dark:bg-stone-800">{p.context}</p>}
          <ol className="mb-3 list-decimal space-y-1.5 pl-5 text-[15px] leading-snug">
            {p.steps.map((s, j) => (
              <li key={j}>{s}</li>
            ))}
          </ol>
          <p className="mb-3 text-sm">
            <span className="font-semibold">Sản phẩm đầu ra: </span>
            {p.deliverable}
          </p>
          <Check
            checked={!!done[i]}
            onChange={() =>
              update((d) => {
                const arr = (d.practiceDone[weekNo] ??= []);
                arr[i] = !arr[i];
                if (arr[i]) markStudied(d);
              })
            }
          >
            Đã hoàn thành bài thực hành này
          </Check>
        </section>
      ))}
    </div>
  );
}

function TestTab({ weekNo }: { weekNo: number }) {
  const { state } = useStore();
  const w = getWeek(weekNo)!;
  const history = state.quizHistory.filter((a) => a.week === weekNo).reverse();
  const best = bestScore(state, weekNo);
  return (
    <div className="space-y-3">
      <section className="card text-center">
        <div className="mb-1 text-4xl">📝</div>
        <h2 className="font-semibold">Mini test tuần {weekNo}</h2>
        <p className="mb-4 text-sm text-stone-500">
          {w.quiz.mcq.length} câu trắc nghiệm + {w.quiz.cases.length} tình huống · Đạt ≥ {PASS_PCT}% để mở tuần sau
        </p>
        {best && (
          <p className={`mb-3 text-sm font-semibold ${best.pct >= PASS_PCT ? 'text-brand-700 dark:text-brand-400' : 'text-amber-600'}`}>
            Điểm cao nhất: {best.pct}% {best.pct >= PASS_PCT ? '· Đã đạt ✓' : '· Chưa đạt'}
          </p>
        )}
        <button className="btn-primary w-full" onClick={() => go(`/week/${weekNo}/quiz`)}>
          {history.length ? 'Làm lại' : 'Bắt đầu'}
        </button>
      </section>
      {history.length > 0 && (
        <section className="card">
          <div className="label mb-2">Lịch sử</div>
          <ul className="divide-y divide-stone-100 dark:divide-stone-800">
            {history.map((a, i) => (
              <li key={i} className="flex justify-between py-2 text-sm">
                <span className="text-stone-500">{formatDate(a.date)}</span>
                <span className="font-semibold tabular-nums">
                  {a.correct}/{a.total} · {a.pct}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function JournalTab({ weekNo }: { weekNo: number }) {
  const { state, update } = useStore();
  const saved = state.reflections[weekNo];
  const [learned, setLearned] = useState(saved?.learned ?? '');
  const [applied, setApplied] = useState(saved?.applied ?? '');
  const [flash, setFlash] = useState(false);
  const dirty = learned !== (saved?.learned ?? '') || applied !== (saved?.applied ?? '');

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(false), 1800);
    return () => clearTimeout(t);
  }, [flash]);

  const save = () => {
    update((d) => {
      d.reflections[weekNo] = { learned, applied, updated: new Date().toISOString() };
      markStudied(d);
    });
    sfx.drop();
    setFlash(true);
  };

  return (
    <section className="card space-y-4">
      <label className="block">
        <span className="mb-1.5 block font-semibold">Tuần này tôi học được gì?</span>
        <textarea className="input min-h-[140px]" value={learned} onChange={(e) => setLearned(e.target.value)} placeholder="3 ý quan trọng nhất, viết bằng lời của bạn…" />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-semibold">Áp dụng vào công việc ra sao?</span>
        <textarea className="input min-h-[140px]" value={applied} onChange={(e) => setApplied(e.target.value)} placeholder="Một việc cụ thể bạn đã/sẽ làm khác đi ở công ty…" />
      </label>
      <div className="flex items-center gap-3">
        <button className="btn-primary flex-1" onClick={save} disabled={!dirty}>
          {flash ? 'Đã lưu ✓' : 'Lưu nhật ký'}
        </button>
      </div>
      {saved && <p className="text-xs text-stone-500">Lưu lần cuối: {formatDate(saved.updated)}</p>}
    </section>
  );
}
