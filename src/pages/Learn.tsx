import { PageHeader, Progress } from '../components/ui';
import { getWeek, yearPlan } from '../lib/content';
import { weekPct } from '../lib/progress';
import { go } from '../lib/router';
import { bestScore, isPassed, isUnlocked, useStore } from '../lib/store';

export default function Learn() {
  const { state } = useStore();
  const quarters = [1, 2, 3, 4].map((q) => yearPlan.filter((w) => Math.ceil(w.week / 13) === q));
  const names = ['Q1 · Nền tảng HR Generalist', 'Q2 · Mở rộng chuyên môn', 'Q3 · Tư duy HRBP', 'Q4 · Chiến lược & chứng chỉ'];

  return (
    <div>
      <PageHeader title="Lộ trình năm 1" subtitle="52 tuần · mở khoá tuần sau khi đạt mini test ≥ 70%" />
      {quarters.map((list, qi) =>
        list.length ? (
          <section key={qi} className="mb-6">
            <h2 className="label mb-2">{names[qi]}</h2>
            <div className="space-y-2">
              {list.map((w) => {
                const full = w.full ? getWeek(w.week) : undefined;
                const unlocked = isUnlocked(state, w.week);
                const passed = isPassed(state, w.week);
                const best = bestScore(state, w.week);
                const pct = full ? weekPct(state, full) : 0;
                const clickable = !!full;
                return (
                  <button
                    key={w.week}
                    disabled={!clickable}
                    onClick={() => go(`/week/${w.week}`)}
                    className={`card flex w-full items-center gap-3 text-left transition ${
                      clickable ? 'hover:border-brand-400 active:scale-[0.99]' : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl text-sm font-bold ${
                        passed
                          ? 'bg-brand-600 text-white'
                          : unlocked && full
                            ? 'bg-brand-50 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200'
                            : 'bg-stone-100 text-stone-400 dark:bg-stone-800'
                      }`}
                    >
                      {passed ? '✓' : !unlocked && full ? '🔒' : w.week}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-stone-500">Tuần {w.week} · {w.focus}</div>
                      <div className="truncate font-semibold">{w.title}</div>
                      {full && unlocked && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <Progress value={pct} className="h-1.5" />
                          <span className="shrink-0 text-xs tabular-nums text-stone-500">{pct}%</span>
                          {best && <span className="shrink-0 text-xs font-medium text-stone-600 dark:text-stone-300">· Test {best.pct}%</span>}
                        </div>
                      )}
                      {!full && <div className="mt-0.5 text-xs text-stone-400">Dàn ý · thêm nội dung trong /content/weeks</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null,
      )}
    </div>
  );
}
