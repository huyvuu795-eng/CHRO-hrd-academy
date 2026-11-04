import { useRef, useState } from 'react';
import { PageHeader } from '../components/ui';
import { today } from '../lib/date';
import { defaultState, normalize, useStore } from '../lib/store';
import type { Theme } from '../types';
import { sfx } from '../lib/sound';

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button className="flex w-full items-center gap-3 text-left" role="switch" aria-checked={on} onClick={() => onChange(!on)}>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-stone-500 dark:text-stone-400">{hint}</span>}
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-brand-600' : 'bg-stone-300 dark:bg-stone-700'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

function Slider({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 pl-1 text-xs text-stone-500 dark:text-stone-400">
      <span className="w-28 shrink-0">{label}</span>
      <input type="range" min={0.05} max={1} step={0.05} value={value} onChange={(e) => onChange(Number(e.target.value))} className="flex-1 accent-brand-600" />
      <span className="w-8 text-right tabular-nums">{Math.round(value * 100)}</span>
    </label>
  );
}

export default function Settings() {
  const { state, update, replace } = useStore();
  const sound = state.settings.sound;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ app: 'hrd-academy', exportedAt: new Date().toISOString(), state }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hrd-academy-backup-${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Đã tải file sao lưu.');
  };

  const importJson = async (f: File) => {
    try {
      const data = JSON.parse(await f.text());
      const s = data?.state ?? data;
      if (!s || typeof s !== 'object' || !('quizHistory' in s || 'checklist' in s)) throw new Error('Sai định dạng');
      if (!confirm('Nhập dữ liệu sẽ GHI ĐÈ toàn bộ tiến độ hiện tại trên máy này. Tiếp tục?')) return;
      replace(normalize(s));
      setMsg('Đã nhập dữ liệu thành công.');
    } catch {
      setMsg('File không hợp lệ — hãy chọn file .json được xuất từ HRD Academy.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const themes: { id: Theme; label: string }[] = [
    { id: 'system', label: 'Theo máy' },
    { id: 'light', label: 'Sáng' },
    { id: 'dark', label: 'Tối' },
  ];

  return (
    <div>
      <PageHeader title="Cài đặt" />

      <section className="card mb-4">
        <div className="label mb-2">Giao diện</div>
        <div className="grid grid-cols-3 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-stone-800">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => update((d) => void (d.settings.theme = t.id))}
              className={`rounded-lg py-2 text-sm font-medium ${state.settings.theme === t.id ? 'bg-white shadow-sm dark:bg-stone-950' : 'text-stone-500'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section className="card mb-4">
        <div className="label mb-3">Âm thanh & rung</div>
        <div className="space-y-4">
          <Toggle
            label="Hiệu ứng âm thanh"
            hint="Khánh đồng khi tick, chuông chùa khi trả lời đúng, đột phá cảnh giới…"
            on={sound.sfx}
            onChange={(v) => update((d) => void (d.settings.sound.sfx = v))}
          />
          {sound.sfx && (
            <Slider value={sound.sfxVolume} onChange={(v) => update((d) => void (d.settings.sound.sfxVolume = v))} label="Âm lượng hiệu ứng" />
          )}
          <Toggle
            label="Tiếng gió núi nền"
            hint="Gió núi và chuông gió xa, giúp tập trung. Bắt đầu sau lần chạm đầu tiên."
            on={sound.ambient}
            onChange={(v) => update((d) => void (d.settings.sound.ambient = v))}
          />
          {sound.ambient && (
            <Slider value={sound.ambientVolume} onChange={(v) => update((d) => void (d.settings.sound.ambientVolume = v))} label="Âm lượng gió" />
          )}
          <Toggle
            label="Rung nhẹ (Android)"
            hint="Khi tick nhiệm vụ, trả lời đúng/sai, đột phá cảnh giới."
            on={sound.haptics}
            onChange={(v) => update((d) => void (d.settings.sound.haptics = v))}
          />
          <div>
            <div className="mb-2 text-sm font-medium">Nghe thử</div>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['🔔 Khánh đồng', sfx.drop],
                  ['🎵 Đàn tranh', sfx.bubble],
                  ['🛕 Đúng', sfx.chime],
                  ['🥁 Sai', sfx.wrong],
                  ['✨ Hoàn thành', sfx.fanfare],
                ] as const
              ).map(([name, play]) => (
                <button key={name} className="btn-ghost min-h-[36px] px-3 text-xs" onClick={() => play()} disabled={!sound.sfx}>
                  {name}
                </button>
              ))}
              <button
                className="btn-ghost min-h-[36px] px-3 text-xs"
                onClick={() => window.dispatchEvent(new CustomEvent('hrd:preview-treasure', { detail: 10 }))}
              >
                ⚡ Xem thử đột phá cảnh giới
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card mb-4">
        <div className="label mb-2">Thẻ luật mới mỗi phiên</div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={state.settings.dailyNewCards}
            onChange={(e) => update((d) => void (d.settings.dailyNewCards = Number(e.target.value)))}
            className="flex-1 accent-brand-600"
          />
          <span className="w-8 text-right font-bold tabular-nums">{state.settings.dailyNewCards}</span>
        </div>
      </section>

      <section className="card mb-4">
        <div className="label mb-1">Sao lưu & chuyển máy</div>
        <p className="mb-3 text-sm text-stone-500">Dữ liệu chỉ nằm trong trình duyệt này. Export định kỳ (vd. mỗi Chủ nhật) và lưu lên Google Drive.</p>
        <div className="grid grid-cols-2 gap-2">
          <button className="btn-primary" onClick={exportJson}>
            Export JSON
          </button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>
            Import JSON
          </button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        {msg && <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-400">{msg}</p>}
      </section>

      <section className="card mb-4">
        <div className="label mb-1">Thống kê dữ liệu</div>
        <ul className="text-sm text-stone-600 dark:text-stone-300">
          <li>Ngày đã học: {state.studyDays.length}</li>
          <li>Lượt làm mini test: {state.quizHistory.length}</li>
          <li>Thẻ luật đã học: {Object.keys(state.cards).length}</li>
          <li>Nhật ký tuần: {Object.keys(state.reflections).length}</li>
        </ul>
      </section>

      <section className="card mb-4 border-red-200 dark:border-red-900">
        <div className="label mb-1 text-red-600">Vùng nguy hiểm</div>
        <p className="mb-3 text-sm text-stone-500">Xoá toàn bộ tiến độ trên máy này. Hãy Export trước.</p>
        <button
          className="btn w-full border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
          onClick={() => {
            if (confirm('Xoá TOÀN BỘ tiến độ? Không thể hoàn tác.')) {
              replace(defaultState());
              setMsg('');
            }
          }}
        >
          Xoá dữ liệu
        </button>
      </section>

      <p className="pb-4 text-center text-xs text-stone-400">HRD Academy v1.0 · Hoạt động offline sau lần mở đầu tiên</p>
    </div>
  );
}
