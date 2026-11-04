import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { useStore } from './lib/store';
import { BottomNav } from './components/BottomNav';
import { OceanBackdrop } from './components/Ocean';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Week from './pages/Week';
import Quiz from './pages/Quiz';
import Roadmap from './pages/Roadmap';
import Cards from './pages/Cards';
import Review from './pages/Review';
import Settings from './pages/Settings';
import Library from './pages/Library';
import Ask from './pages/Ask';

function useTheme() {
  const theme = useStore().state.settings.theme;
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0c0a09' : '#0f766e');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

/** Gợn sóng lan ra từ điểm chạm trên mọi nút có class .btn */
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

export default function App() {
  useTheme();
  useRipple();
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
  else page = <Dashboard />;

  const hideNav = p2 === 'quiz' || (p0 === 'cards' && p1 === 'review');

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {saveError && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
          Không lưu được vào bộ nhớ trình duyệt (chế độ ẩn danh?). Hãy Export JSON để không mất tiến độ.
        </div>
      )}
      <OceanBackdrop />
      <main className={`px-4 ${hideNav ? 'pb-8' : 'pb-28'}`}>
        <div key={parts.join('/')} className="page-enter">
          {page}
        </div>
      </main>
      {!hideNav && <BottomNav active={tab === 'week' ? 'learn' : tab} />}
    </div>
  );
}
