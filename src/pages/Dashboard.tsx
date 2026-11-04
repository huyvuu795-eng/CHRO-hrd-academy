import { useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Check, Empty, Progress, Stat } from '../components/ui';
import { OceanHero, QuoteCard } from '../components/Ocean';
import { allCards, competencies, stages } from '../lib/content';
import { DAYS, formatDate, streak, thisMonth, todayKey } from '../lib/date';
import { currentWeek, weekPct } from '../lib/progress';
import { go } from '../lib/router';
import { isDue } from '../lib/sm2';
import { PASS_PCT, markStudied, useStore } from '../lib/store';

export default function Dashboard() {
  const { state, update } = useStore();
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
      <OceanHero>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-white/75">Xin chào 👋</p>
            <h1 className="text-2xl font-bold tracking-tight">HRD Academy</h1>
            <p className="mt-1 text-xs text-white/70">Từ Recruiter đến HR Director · lặn sâu mỗi ngày một chút</p>
          </div>
          <button onClick={() => go('/roadmap')} className="btn min-h-[34px] shrink-0 rounded-full bg-white/15 px-3 text-xs text-white backdrop-blur hover:bg-white/25">
            {stage?.title.split(' · ')[0] ?? 'Chọn giai đoạn'} →
          </button>
        </div>
      </OceanHero>
      <QuoteCard />

      <div className="mb-4 grid grid-cols-3 gap-2">
        <Stat label="Streak" value={<>🔥 {streak(state.studyDays)}</>} hint="ngày liên tiếp" />
        <Stat label="Tuần này" value={`${cw ? weekPct(state, cw) : 0}%`} hint={cw ? `Tuần ${cw.week}` : '—'} />
        <Stat label="Thẻ luật" value={dueCount} hint="đến hạn ôn" />
      </div>

      {cw && (
        <section className="card mb-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="label">Đang học · Tuần {cw.week}</span>
            <span className="text-xs text-stone-500">{cw.phase}</span>
          </div>
          <h2 className="mb-3 text-base font-semibold leading-snug">{cw.title}</h2>
          <Progress value={weekPct(state, cw)} className="mb-3" />
          <div className="label mb-1">Hôm nay · {DAYS.find((d) => d.key === dk)?.label}</div>
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
        </section>
      )}

      <section className="card mb-4">
        <div className="label mb-3">Điểm mini test theo thời gian</div>
        {scoreData.length ? (
          <div className="h-52">
            <ResponsiveContainer>
              <LineChart data={scoreData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-stone-200 dark:text-stone-800" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#a8a29e" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#a8a29e" />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, 'Điểm']}
                  labelFormatter={(_, p) => (p?.[0] ? `${p[0].payload.name} · ${p[0].payload.date}` : '')}
                  contentStyle={{ borderRadius: 12, fontSize: 12 }}
                />
                <ReferenceLine y={PASS_PCT} stroke="#f59e0b" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="pct" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty>Làm mini test cuối tuần để thấy biểu đồ tiến bộ.</Empty>
        )}
      </section>

      <SelfAssessCard />
    </div>
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
    setEditing(false);
  };

  return (
    <section className="card mb-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label">Bản đồ năng lực HR</span>
        {latest && <span className="text-xs text-stone-500">Cập nhật: {latest.month}</span>}
      </div>

      {!editing && latest && (
        <div className="h-72">
          <ResponsiveContainer>
            <RadarChart data={data} outerRadius="70%">
              <PolarGrid stroke="#d6d3d1" />
              <PolarAngleAxis dataKey="area" tick={{ fontSize: 10, fill: '#78716c' }} />
              <PolarRadiusAxis domain={[0, 5]} tickCount={6} tick={false} axisLine={false} />
              {prev && <Radar name={`Tháng ${prev.month}`} dataKey="before" stroke="#a8a29e" fill="#a8a29e" fillOpacity={0.15} />}
              <Radar name={`Tháng ${latest.month}`} dataKey="now" stroke="#0d9488" fill="#14b8a6" fillOpacity={0.35} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
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
