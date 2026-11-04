import { useState } from 'react';
import { Empty, PageHeader, Progress } from '../components/ui';
import { getWeek } from '../lib/content';
import { dueMistakes, gradeMistake, mistakeStats } from '../lib/mistakes';
import { go } from '../lib/router';
import { sfx } from '../lib/sound';
import { markStudied, useStore } from '../lib/store';
import type { MCQ } from '../types';
import { McqView, shuffleOptions } from './Quiz';

/** Sổ câu sai: ôn lại các câu khảo hạch từng trả lời sai, giãn cách theo SM-2 */
export default function Mistakes() {
  const { state, update } = useStore();
  const stats = mistakeStats(state);

  // Hàng đợi chốt khi mở phiên; mỗi câu được xáo đáp án mới
  const [queue, setQueue] = useState<{ key: string; week: number; q: MCQ }[]>(() =>
    dueMistakes(state).map((m) => ({
      key: m.key,
      week: m.state.week,
      q: shuffleOptions([getWeek(m.state.week)!.quiz.mcq[m.state.q]])[0],
    })),
  );
  const [initial] = useState(queue.length);
  const [done, setDone] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [round, setRound] = useState(0); // đổi key để McqView làm mới khi gặp lại câu

  const cur = queue[0];

  const next = () => {
    if (!cur) return;
    const correct = picked === cur.q.answer;
    update((d) => {
      const m = d.mistakes[cur.key];
      if (m) d.mistakes[cur.key] = gradeMistake(m, correct);
      markStudied(d);
    });
    setPicked(null);
    setRound((r) => r + 1);
    if (correct) {
      if (queue.length === 1) sfx.fanfare();
      setQueue((q) => q.slice(1));
      setDone((n) => n + 1);
    } else {
      // sai thì gặp lại ở cuối phiên, với đáp án xáo lại
      setQueue((q) => [...q.slice(1), { ...q[0], q: shuffleOptions([getWeek(q[0].week)!.quiz.mcq.find((x) => x.q === q[0].q.q)!])[0] }]);
    }
  };

  return (
    <div>
      <PageHeader title="Sổ câu sai" subtitle={`${stats.total} câu · ${stats.mastered} đã thuộc · ${stats.due} đến hạn`} backTo="/learn" />

      {initial > 0 && (
        <div className="mb-4 flex items-center gap-3 text-xs text-stone-500">
          <Progress value={(done / initial) * 100} />
          <span className="shrink-0 tabular-nums">
            {done}/{initial}
          </span>
        </div>
      )}

      {cur ? (
        <>
          <div className="label mb-2">Từ khảo hạch tuần {cur.week}</div>
          <McqView key={`${cur.key}-${round}`} n={done + 1} total={initial} q={cur.q} picked={picked} onPick={setPicked} onNext={next} />
        </>
      ) : stats.total === 0 ? (
        <Empty>
          Sổ đang trống. Câu nào bạn trả lời sai trong khảo hạch sẽ tự vào đây để ôn lại đến khi thuộc.
          <div className="mt-3">
            <button className="btn-primary" onClick={() => go('/learn')}>
              Vào lộ trình học
            </button>
          </div>
        </Empty>
      ) : (
        <div className="card text-center">
          <div className="mb-2 text-4xl">🏯</div>
          <h2 className="mb-1 font-semibold">{initial ? 'Xong phiên ôn câu sai!' : 'Hôm nay không có câu nào đến hạn'}</h2>
          <p className="mb-4 text-sm text-stone-500">
            Câu trả lời đúng sẽ được giãn lịch ôn dần; khi khoảng ôn đạt 21 ngày, câu được tính là đã thuộc.
          </p>
          <button className="btn-ghost w-full" onClick={() => go('/learn')}>
            Về lộ trình học
          </button>
        </div>
      )}
    </div>
  );
}
