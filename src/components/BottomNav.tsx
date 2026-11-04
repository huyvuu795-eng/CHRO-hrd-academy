import { go } from '../lib/router';
import { sfx } from '../lib/sound';

const items = [
  { id: '', label: 'Tổng quan', icon: 'M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10' },
  { id: 'learn', label: 'Học', icon: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zm0 16a2 2 0 012-2h13' },
  { id: 'cards', label: 'Thẻ luật', icon: 'M7 4h12a1 1 0 011 1v12M4 8h12a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z' },
  { id: 'ask', label: 'Hỏi đáp', icon: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12zM8.5 10.5h7M8.5 13.5h4.5' },
  { id: 'roadmap', label: 'Lộ trình', icon: 'M4 19V5m0 14h16M8 15l4-4 3 3 5-6' },
  { id: 'settings', label: 'Cài đặt', icon: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z' },
];

export function BottomNav({ active }: { active: string }) {
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 backdrop-blur dark:border-stone-800 dark:bg-stone-950/95">
      <div className="mx-auto grid max-w-2xl grid-cols-6">
        {items.map((it) => {
          const on = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => {
                if (!on) sfx.bubble();
                go('/' + it.id);
              }}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                on ? 'text-brand-700 dark:text-brand-400' : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={on ? 2.2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
                <path d={it.icon} />
              </svg>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
