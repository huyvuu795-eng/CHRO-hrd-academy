import { Suspense, lazy, useState } from 'react';

// Biểu đồ tải sau, không chặn phần chính của trang
const ScoreChart = lazy(() => import('../components/Charts').then((m) => ({ default: m.ScoreChart })));
const CompetencyRadar = lazy(() => import('../components/Charts').then((m) => ({ default: m.CompetencyRadar })));

function ChartSkeleton() {
  return <div className="h-full w-full animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800/60" />;
}
import { Check, Empty, Progress, Stat } from '../components/ui';
import { QuoteCard, TongMonHero } from '../components/Scenery';
import { sfx } from '../lib/sound';
import { allCards, competencies, stages } from '../lib/content';
import { DAYS, addDays, formatDate, streak, thisMonth, today, todayKey } from '../lib/date';
import { daysSinceBackup, downloadBackup, needsBackup } from '../lib/backup';
import { mistakeStats } from '../lib/mistakes';
import { currentWeek, weekPct } from '../lib/progress';
import { go } from '../lib/router';
import { isDue } from '../lib/sm2';
import { PASS_PCT, markStudied, useStore } from '../lib/store';

export default function Dashboard() {
  const { state, update } = useStore();
  const sound = state.settings.sound;
  const mist = mistakeStats(state);
  const cw = currentWeek(state);
  const stage = stages.find((s) => s.id === state.currentStage);
  const dueCount = allCards.filter((c) => isDue(state.cards[c.id])).length;
  const newCount = allCards.filter((c) => !state.cards[c.id]).length;
  const dk = todayKey();
  const todayTasks = cw?.daily[dk] ?? [];
  const todayDone = state.checklist[cw?.week ?? 0]?.[dk] ?? [];

  const toggle = (i: number) =>
    update((d) => {
      if (!cw) return;
      const wk = (d.checklist[cw.week] ??= {});
      const arr = (wk[dk] ??= []);
      arr[i] = !arr[i];
      if (arr[i]) markStudied(d);
    });

  const scoreData = state.quizHistory.map((a, i) => ({
    name: `T${a.week}`,
    idx: i + 1,
    pct: a.pct,
    date: formatDate(a.date),
  }));

  return (
    <div>
      <TongMonHero>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-stone-600 dark:text-stone-300">Đạo hữu, chào mừng trở lại</p>
            <h1 className="font-serif text-[26px] font-bold leading-tight tracking-tight text-stone-900 dark:text-kim-100">HRD Academy</h1>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">Tông môn tu luyện · Từ Recruiter đến HR Director</p>
            <button
              onClick={() => go('/roadmap')}
              className="btn mt-3 min-h-[32px] rounded-full border border-kim-400/70 bg-kim-100 px-3 text-xs text-kim-700 hover:bg-kim-200 dark:border-kim-600 dark:bg-kim-700/30 dark:text-kim-200"
            >
              {stage?.realm ? `${stage.realm} · ` : ''}
              {stage?.title.split(' · ')[0] ?? 'Chọn giai đoạn'} →
            </button>
          </div>
          <div className="flex shrink-0 gap-1.5">
            <button
              onClick={() => update((d) => void (d.settings.sound.sfx = !d.settings.sound.sfx))}
              className={`btn min-h-[34px] rounded-full border border-stone-300/70 px-2.5 text-sm dark:border-stone-600 ${sound.sfx ? 'bg-white dark:bg-stone-800' : 'bg-white/50 opacity-60 dark:bg-stone-800/50'}`}
              aria-pressed={sound.sfx}
              title={sound.sfx ? 'Tắt hiệu ứng âm thanh' : 'Bật hiệu ứng âm thanh'}
            >
              {sound.sfx ? '🔔' : '🔕'}
            </button>
            <button
              onClick={() => update((d) => void (d.settings.sound.ambient = !d.settings.sound.ambient))}
              className={`btn min-h-[34px] rounded-full border border-stone-300/70 px-2.5 text-sm dark:border-stone-600 ${sound.ambient ? 'bg-white dark:bg-stone-800' : 'bg-white/50 opacity-60 dark:bg-stone-800/50'}`}
              aria-pressed={sound.ambient}
              title={sound.ambient ? 'Tắt tiếng gió núi' : 'Bật tiếng gió núi'}
            >
              🎐
            </button>
          </div>
        </div>
      </TongMonHero>
      <BackupReminder />
      <QuoteCard />

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Bế quan" value={<>🔥 {streak(state.studyDays)}</>} hint="ngày streak" />
        <Stat label="Tu vi" value={`${cw ? weekPct(state, cw) : 0}%`} hint={cw ? `tiến độ tuần ${cw.week}` : '—'} />
        <Stat label="Ngọc giản" value={dueCount} hint="thẻ luật đến hạn" />
      </div>

      {cw && (
        <section className="card mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="label">Đang học · Tuần {cw.week}</span>
            <span className="text-xs text-stone-500">{cw.phase}</span>
          </div>
          <h2 className="mb-3 text-base font-semibold leading-snug">{cw.title}</h2>
          <Progress value={weekPct(state, cw)} className="mb-3" />
          <div className="label mb-1">Nhiệm vụ tu luyện · {DAYS.find((d) => d.key === dk)?.label}</div>
          {todayTasks.length ? (
            todayTasks.map((t, i) => (
              <Check key={i} checked={!!todayDone[i]} onChange={() => toggle(i)}>
                {t}
              </Check>
            ))
          ) : (
            <p className="py-2 text-sm text-stone-500">Không có việc cho hôm nay.</p>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={() => go(`/week/${cw.week}`)}>
              Vào bài học
            </button>
            <button className="btn-ghost" onClick={() => go('/cards/review?topic=all')} disabled={!dueCount && !newCount}>
              Ôn thẻ luật
            </button>
          </div>
          {mist.due > 0 && (
            <button onClick={() => go('/mistakes')} className="mt-2 w-full rounded-xl bg-kim-100 px-3 py-2 text-left text-sm font-medium text-kim-700 dark:bg-kim-700/25 dark:text-kim-200">
              📕 {mist.due} câu trong Sổ câu sai đến hạn ôn →
            </button>
          )}
        </section>
      )}

      <section className="card mb-4">
        <div className="label mb-3">Điểm mini test theo thời gian</div>
        {scoreData.length ? (
          <div className="h-52">
            <Suspense fallback={<ChartSkeleton />}>
              <ScoreChart data={scoreData} pass={PASS_PCT} />
            </Suspense>
          </div>
        ) : (
          <Empty>Làm mini test cuối tuần để thấy biểu đồ tiến bộ.</Empty>
        )}
      </section>

      <SelfAssessCard />
    </div>
  );
}

/** Nhắc Export JSON khi đã quá 7 ngày chưa sao lưu — tiến độ chỉ nằm trong trình duyệt */
function BackupReminder() {
  const { state, update } = useStore();
  if (!needsBackup(state)) return null;
  const since = daysSinceBackup(state);
  return (
    <section className="mb-5 flex items-start gap-3 rounded-2xl border border-kim-400/60 bg-kim-100/95 p-4 text-kim-700 dark:border-kim-600/60 dark:bg-stone-900/95 dark:text-kim-200">
      <span className="text-2xl" aria-hidden>
        📜
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{since === null ? 'Bạn chưa sao lưu tiến độ lần nào' : `Đã ${since} ngày chưa sao lưu`}</p>
        <p className="mt-0.5 text-xs leading-relaxed opacity-80">Tiến độ chỉ nằm trong trình duyệt này. Tải file sao lưu và cất lên Google Drive để không mất khi đổi máy.</p>
        <div className="mt-3 flex gap-2">
          <button
            className="btn-primary min-h-[36px] px-3 text-xs"
            onClick={() => {
              downloadBackup(state);
              update((d) => void (d.lastBackup = new Date().toISOString()));
              sfx.drop();
            }}
          >
            Sao lưu ngay
          </button>
          <button className="btn-ghost min-h-[36px] px-3 text-xs" onClick={() => update((d) => void (d.backupSnoozeUntil = addDays(today(), 3)))}>
            Để sau
          </button>
        </div>
      </div>
    </section>
  );
}

function SelfAssessCard() {
  const { state, update } = useStore();
  const month = thisMonth();
  const list = [...state.selfAssessments].sort((a, b) => a.month.localeCompare(b.month));
  const latest = list[list.length - 1];
  const prev = list[list.length - 2];
  const doneThisMonth = latest?.month === month;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, number>>(() =>
    Object.fromEntries(competencies.map((c) => [c.id, latest?.scores[c.id] ?? 1])),
  );

  const data = competencies.map((c) => ({
    area: c.short,
    now: latest?.scores[c.id] ?? 0,
    before: prev?.scores[c.id] ?? 0,
  }));

  const saveDraft = () => {
    update((d) => {
      d.selfAssessments = d.selfAssessments.filter((s) => s.month !== month);
      d.selfAssessments.push({ month, scores: draft });
      markStudied(d);
    });
    sfx.chime();
    setEditing(false);
  };

  return (
    <section className="card mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Bản đồ năng lực · Linh căn</span>
        {latest && <span className="text-xs text-stone-500">Cập nhật: {latest.month}</span>}
      </div>

      {!editing && latest && (
        <div className="h-72">
          <Suspense fallback={<ChartSkeleton />}>
            <CompetencyRadar data={data} latest={latest.month} prev={prev?.month} />
          </Suspense>
        </div>
      )}

      {!editing && !latest && <Empty>Tự chấm 10 mảng năng lực (1–5) để có điểm xuất phát.</Empty>}

      {editing && (
        <div className="space-y-4 py-2">
          {competencies.map((c) => (
            <div key={c.id}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium">{c.name}</span>
                <span className="text-sm font-bold tabular-nums text-brand-700 dark:text-brand-400">{draft[c.id]}</span>
              </div>
              <p className="mb-1 text-xs text-stone-500">{c.description}</p>
              <input
                type="range"
                min={1}
                max={5}
                value={draft[c.id]}
                onChange={(e) => setDraft({ ...draft, [c.id]: Number(e.target.value) })}
                className="w-full accent-brand-600"
              />
            </div>
          ))}
          <p className="text-xs text-stone-500">1 = chưa biết · 2 = biết lý thuyết · 3 = làm được có hướng dẫn · 4 = làm độc lập · 5 = dạy/dẫn dắt người khác</p>
        </div>
      )}

      <div className="mt-3 flex gap-2">
        {editing ? (
          <>
            <button className="btn-ghost flex-1" onClick={() => setEditing(false)}>Huỷ</button>
            <button className="btn-primary flex-1" onClick={saveDraft}>Lưu tháng {month}</button>
          </>
        ) : (
          <button className={doneThisMonth ? 'btn-ghost w-full' : 'btn-primary w-full'} onClick={() => setEditing(true)}>
            {doneThisMonth ? 'Sửa đánh giá tháng này' : 'Tự đánh giá tháng này'}
          </button>
        )}
      </div>
    </section>
  );
}
