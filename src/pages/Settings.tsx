import { useRef, useState } from 'react';
import { PageHeader } from '../components/ui';
import { today } from '../lib/date';
import { defaultState, normalize, useStore } from '../lib/store';
import type { Theme } from '../types';

export default function Settings() {
  const { state, update, replace } = useStore();
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
