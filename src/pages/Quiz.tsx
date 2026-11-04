import { useEffect, useMemo, useState } from 'react';
import { sfx } from '../lib/sound';
import { PageHeader, Progress } from '../components/ui';
import { getWeek } from '../lib/content';
import { go } from '../lib/router';
import { PASS_PCT, markStudied, useStore } from '../lib/store';
import type { MCQ } from '../types';

type Phase = 'mcq' | 'case' | 'result';

/** Xáo thứ tự đáp án mỗi lần làm bài để không thể "đoán theo vị trí" */
function shuffleOptions(list: MCQ[]): MCQ[] {
  return list.map((q) => {
    const order = q.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
  });
}

export default function Quiz({ week }: { week: number }) {
  const { update } = useStore();
  const w = getWeek(week);
  const [phase, setPhase] = useState<Phase>('mcq');
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [caseIdx, setCaseIdx] = useState(0);
  const [caseAnswers, setCaseAnswers] = useState<string[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const [mcq] = useState(() => shuffleOptions(w?.quiz.mcq ?? []));
  const cases = w?.quiz.cases ?? [];
  const correct = useMemo(() => answers.filter((a, i) => a === mcq[i]?.answer).length, [answers, mcq]);
  const pct = mcq.length ? Math.round((correct / mcq.length) * 100) : 0;

  if (!w) return <PageHeader title="Không tìm thấy bài test" backTo="/learn" />;

  const finish = (finalCases: string[]) => {
    update((d) => {
      d.quizHistory.push({
        week,
        date: new Date().toISOString(),
        correct,
        total: mcq.length,
        pct,
        caseAnswers: finalCases,
      });
      markStudied(d);
    });
    setPhase('result');
  };

  const totalSteps = mcq.length + cases.length;
  const step = phase === 'mcq' ? idx : phase === 'case' ? mcq.length + caseIdx : totalSteps;

  const close = () => {
    if (phase === 'result' || confirm('Thoát bài test? Kết quả lần này sẽ không được lưu.')) go(`/week/${week}?tab=test`);
  };

  return (
    <div>
      <PageHeader
        title={`Khảo hạch · Tuần ${week}`}
        subtitle="Mini test cuối tuần"
        right={
          <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full text-xl hover:bg-stone-200/60 dark:hover:bg-stone-800" aria-label="Đóng">
            ✕
          </button>
        }
      />
      <Progress value={(step / totalSteps) * 100} className="mb-5" />

      {phase === 'mcq' && mcq[idx] && (
        <McqView
          key={idx}
          n={idx + 1}
          total={mcq.length}
          q={mcq[idx]}
          picked={picked}
          onPick={setPicked}
          onNext={() => {
            const next = [...answers, picked!];
            setAnswers(next);
            setPicked(null);
            if (idx + 1 < mcq.length) setIdx(idx + 1);
            else if (cases.length) setPhase('case');
            else {
              // tính lại trực tiếp vì state answers chưa cập nhật
              const c = next.filter((a, i) => a === mcq[i].answer).length;
              update((d) => {
                d.quizHistory.push({ week, date: new Date().toISOString(), correct: c, total: mcq.length, pct: Math.round((c / mcq.length) * 100), caseAnswers: [] });
                markStudied(d);
              });
              setPhase('result');
            }
          }}
        />
      )}

      {phase === 'case' && cases[caseIdx] && (
        <section>
          <div className="label mb-2">
            Tình huống {caseIdx + 1}/{cases.length} · tự chấm, không tính điểm
          </div>
          <div className="card mb-3 text-[15px] leading-relaxed">{cases[caseIdx].scenario}</div>
          <p className="mb-2 font-semibold">{cases[caseIdx].question}</p>
          <textarea
            className="input mb-3 min-h-[160px]"
            value={caseAnswers[caseIdx] ?? ''}
            onChange={(e) => {
              const a = [...caseAnswers];
              a[caseIdx] = e.target.value;
              setCaseAnswers(a);
            }}
            placeholder="Viết hướng xử lý của bạn trước khi xem gợi ý…"
          />
          {showGuide && (
            <div className="mb-3 rounded-xl border border-brand-200 bg-brand-50 p-3 text-sm leading-relaxed text-brand-900 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100">
              <div className="mb-1 font-semibold">Gợi ý đáp án</div>
              <div className="whitespace-pre-line">{cases[caseIdx].guide}</div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost" onClick={() => setShowGuide(true)} disabled={showGuide}>
              Xem gợi ý
            </button>
            <button
              className="btn-primary"
              onClick={() => {
                setShowGuide(false);
                if (caseIdx + 1 < cases.length) setCaseIdx(caseIdx + 1);
                else finish(caseAnswers);
              }}
            >
              {caseIdx + 1 < cases.length ? 'Tiếp' : 'Nộp bài'}
            </button>
          </div>
        </section>
      )}

      {phase === 'result' && <ResultView week={week} pct={pct} correct={correct} mcq={mcq} answers={answers} />}
    </div>
  );
}

function McqView({
  n,
  total,
  q,
  picked,
  onPick,
  onNext,
}: {
  n: number;
  total: number;
  q: { q: string; options: string[]; answer: number; explain: string };
  picked: number | null;
  onPick: (i: number) => void;
  onNext: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const right = picked === q.answer;
  return (
    <section>
      <div className="label mb-2">
        Câu {n}/{total}
      </div>
      <h2 className="mb-4 text-[17px] font-semibold leading-snug">{q.q}</h2>
      <div className="mb-4 space-y-2">
        {q.options.map((o, i) => {
          let cls = 'border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900';
          if (!checked && picked === i) cls = 'border-brand-600 bg-brand-50 ring-2 ring-brand-600/20 dark:bg-brand-900/30';
          if (checked && i === q.answer) cls = 'border-brand-600 bg-brand-50 dark:bg-brand-900/30';
          if (checked && picked === i && !right) cls = 'border-red-400 bg-red-50 dark:bg-red-900/20';
          return (
            <button
              key={i}
              disabled={checked}
              onClick={() => onPick(i)}
              className={`flex w-full gap-3 rounded-xl border-2 p-3 text-left text-[15px] leading-snug transition ${cls}`}
            >
              <span className="font-bold text-stone-400">{String.fromCharCode(65 + i)}</span>
              <span>{o}</span>
            </button>
          );
        })}
      </div>
      {checked && (
        <div className={`mb-4 rounded-xl p-3 text-sm leading-relaxed ${right ? 'bg-brand-50 text-brand-900 dark:bg-brand-900/30 dark:text-brand-100' : 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-100'}`}>
          <div className="mb-1 font-semibold">{right ? '✓ Chính xác' : `✗ Chưa đúng · Đáp án: ${String.fromCharCode(65 + q.answer)}`}</div>
          {q.explain}
        </div>
      )}
      {checked ? (
        <button className="btn-primary w-full" onClick={onNext}>
          Tiếp tục
        </button>
      ) : (
        <button
          className="btn-primary w-full"
          disabled={picked === null}
          onClick={() => {
            if (picked === q.answer) sfx.chime();
            else sfx.wrong();
            setChecked(true);
          }}
        >
          Kiểm tra
        </button>
      )}
    </section>
  );
}

function ResultView({ week, pct, correct, mcq, answers }: { week: number; pct: number; correct: number; mcq: MCQ[]; answers: number[] }) {
  const total = mcq.length;
  const pass = pct >= PASS_PCT;
  useEffect(() => {
    if (pass) sfx.fanfare();
    // chỉ phát một lần khi màn kết quả hiện ra
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wrong = mcq.map((q, i) => ({ q, i })).filter(({ q, i }) => answers[i] !== q.answer);
  return (
    <section>
      <div className="card mb-4 text-center">
        <div className="mb-2 text-5xl">{pass ? '🎉' : '💪'}</div>
        <div className="text-4xl font-bold tabular-nums">{pct}%</div>
        <p className="mb-1 text-sm text-stone-500">
          Đúng {correct}/{total} câu trắc nghiệm
        </p>
        <p className={`font-semibold ${pass ? 'text-brand-700 dark:text-brand-400' : 'text-amber-600'}`}>
          {pass ? (getWeek(week + 1) ? `Đạt! Tuần ${week + 1} đã mở khoá.` : 'Đạt! Bạn đã hoàn thành phần nội dung hiện có.') : `Cần ≥ ${PASS_PCT}% để mở tuần sau. Đọc lại bài và thử lần nữa.`}
        </p>
      </div>
      {wrong.length > 0 && (
        <div className="card mb-4">
          <div className="label mb-2">Ôn lại câu sai</div>
          <ul className="space-y-3">
            {wrong.map(({ q, i }) => (
              <li key={i} className="text-sm leading-relaxed">
                <p className="font-medium">
                  {i + 1}. {q.q}
                </p>
                <p className="text-brand-700 dark:text-brand-400">→ {q.options[q.answer]}</p>
                <p className="text-stone-500">{q.explain}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-ghost" onClick={() => go(`/week/${week}?tab=journal`)}>
          Viết nhật ký
        </button>
        <button className="btn-primary" onClick={() => go(pass && getWeek(week + 1) ? `/week/${week + 1}` : `/week/${week}`)}>
          {pass && getWeek(week + 1) ? `Sang tuần ${week + 1}` : 'Về bài học'}
        </button>
      </div>
    </section>
  );
}
