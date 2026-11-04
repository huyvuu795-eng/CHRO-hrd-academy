import { useState } from 'react';
import { PageHeader, Tabs } from '../components/ui';
import { library } from '../lib/content';

export default function Library() {
  const groups = ['Tất cả', ...new Set(library.map((d) => d.group))];
  const [group, setGroup] = useState('Tất cả');
  const [open, setOpen] = useState<string | null>(null);
  const list = library.filter((d) => group === 'Tất cả' || d.group === group);

  return (
    <div>
      <PageHeader title="Thư viện văn bản" subtitle="Tàng Kinh Các · văn bản gốc từ cổng thông tin Chính phủ" backTo="/cards" />
      <Tabs tabs={groups.map((g) => ({ id: g, label: g }))} value={group} onChange={setGroup} />

      <div className="space-y-2">
        {list.map((d) => {
          const isOpen = open === d.id;
          return (
            <section key={d.id} className="card">
              <button className="w-full text-left" onClick={() => setOpen(isOpen ? null : d.id)}>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-400">{d.number}</span>
                  {d.status === 'verified' ? (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                      ✓ App đã đối chiếu
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                      Chỉ có link
                    </span>
                  )}
                </div>
                <h2 className="font-semibold leading-snug">{d.title}</h2>
                <p className="mt-0.5 text-xs text-stone-500">
                  Ban hành {d.issued} · Hiệu lực {d.effective}
                </p>
              </button>
              {isOpen && (
                <div className="mt-3 border-t border-stone-100 pt-3 dark:border-stone-800">
                  <div className="label mb-1">Ý chính cho HR</div>
                  <ul className="mb-3 space-y-1.5">
                    {d.highlights.map((h, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-snug">
                        <span className="text-brand-600">•</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="grid gap-2">
                    {d.links.map((l) => (
                      <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-ghost justify-between">
                        <span>{l.label}</span>
                        <span aria-hidden>↗</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-stone-500">
        Mở PDF cần có mạng. Văn bản pháp luật có thể bị sửa đổi, thay thế — kiểm tra tình trạng hiệu lực trên vbpl.vn trước khi áp dụng.
      </p>
    </div>
  );
}
