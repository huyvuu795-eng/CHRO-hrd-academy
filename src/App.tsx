import { Suspense, lazy, useEffect, useState } from 'react';
import { useRoute } from './lib/router';
import { useStore } from './lib/store';
import { setSoundConfig, unlockAudio } from './lib/sound';
import { pendingTreasure, treasureFor, type Treasure } from './lib/streak';
import { Breakthrough } from './components/Breakthrough';
import { BottomNav } from './components/BottomNav';
import { PhuonHaiBen, TienBackground } from './components/Scenery';
import Dashboard from './pages/Dashboard';

// Các trang khác chỉ tải khi mở tới — trang đầu tiên hiện nhanh hơn
const Learn = lazy(() => import('./pages/Learn'));
const Week = lazy(() => import('./pages/Week'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Roadmap = lazy(() => import('./pages/Roadmap'));
const Cards = lazy(() => import('./pages/Cards'));
const Review = lazy(() => import('./pages/Review'));
const Settings = lazy(() => import('./pages/Settings'));
const Library = lazy(() => import('./pages/Library'));
const Ask = lazy(() => import('./pages/Ask'));
const Mistakes = lazy(() => import('./pages/Mistakes'));

function useTheme() {
  const theme = useStore().state.settings.theme;
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d121c' : '#dfe8f2');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

/** Gợn sáng lan ra từ điểm chạm trên mọi nút có class .btn */
function useRipple() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('.btn, .btn-primary, .btn-ghost');
      if (!el || (el as HTMLButtonElement).disabled) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const dot = document.createElement('span');
      dot.className = 'ripple';
      dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      el.appendChild(dot);
      dot.addEventListener('animationend', () => dot.remove());
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, []);
}

/** Đồng bộ cài đặt âm thanh; mở khoá audio ở lần chạm/phím đầu tiên (luật của trình duyệt) */
function useSound() {
  const sound = useStore().state.settings.sound;
  useEffect(() => setSoundConfig(sound), [sound]);
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener('pointerdown', unlock);
    document.addEventListener('keydown', unlock);
    return () => {
      document.removeEventListener('pointerdown', unlock);
      document.removeEventListener('keydown', unlock);
    };
  }, []);
}

/** Hiện màn đột phá cảnh giới khi chuỗi ngày học chạm mốc mới (3, 10, 30, 90, 100, 365, 1.000, 2.000…) */
function useTreasure() {
  const { state, update } = useStore();
  const [shown, setShown] = useState<Treasure | null>(null);
  useEffect(() => {
    if (shown) return;
    const pending = pendingTreasure(state.studyDays, state.streakRewards);
    if (!pending) return;
    update((d) => {
      for (const k of pending.keys) if (!d.streakRewards.includes(k)) d.streakRewards.push(k);
    });
    setShown(pending.treasure);
  }, [state.studyDays, state.streakRewards, shown, update]);
  useEffect(() => {
    // Cho phép xem thử rương từ trang Cài đặt
    const preview = (e: Event) => setShown(treasureFor((e as CustomEvent<number>).detail));
    window.addEventListener('hrd:preview-treasure', preview);
    return () => window.removeEventListener('hrd:preview-treasure', preview);
  }, []);
  return { shown, close: () => setShown(null) };
}

export default function App() {
  useTheme();
  useRipple();
  useSound();
  const treasure = useTreasure();
  const { parts, query } = useRoute();
  const { saveError } = useStore();
  const [p0, p1, p2] = parts;

  let page;
  let tab = p0 ?? '';
  if (p0 === 'learn') page = <Learn />;
  else if (p0 === 'week' && p2 === 'quiz') page = <Quiz week={Number(p1)} />;
  else if (p0 === 'week') {
    page = <Week week={Number(p1)} tab={query.get('tab') ?? 'lesson'} />;
    tab = 'learn';
  } else if (p0 === 'roadmap') page = <Roadmap />;
  else if (p0 === 'cards' && p1 === 'review') {
    page = <Review topic={query.get('topic') ?? 'all'} />;
    tab = 'cards';
  } else if (p0 === 'cards') page = <Cards />;
  else if (p0 === 'library') {
    page = <Library />;
    tab = 'cards';
  }
  else if (p0 === 'settings') page = <Settings />;
  else if (p0 === 'ask') page = <Ask />;
  else if (p0 === 'mistakes') {
    page = <Mistakes />;
    tab = 'learn';
  }
  else page = <Dashboard />;

  const hideNav = p2 === 'quiz' || (p0 === 'cards' && p1 === 'review');

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {saveError && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
          Không lưu được vào bộ nhớ trình duyệt (chế độ ẩn danh?). Hãy Export JSON để không mất tiến độ.
        </div>
      )}
      <TienBackground />
      <PhuonHaiBen />
      <main className={`px-4 ${hideNav ? 'pb-8' : 'pb-28'}`}>
        <Suspense fallback={<div className="pt-10 text-center text-sm text-stone-400">Đang mở…</div>}>
          <div key={parts.join('/')} className="page-enter">
            {page}
          </div>
        </Suspense>
      </main>
      {!hideNav && <BottomNav active={tab === 'week' ? 'learn' : tab} />}
      {treasure.shown && <Breakthrough treasure={treasure.shown} onClose={treasure.close} />}
    </div>
  );
}
