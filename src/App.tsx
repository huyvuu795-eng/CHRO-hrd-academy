import { useEffect } from 'react';
import { useRoute } from './lib/router';
import { useStore } from './lib/store';
import { BottomNav } from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Week from './pages/Week';
import Quiz from './pages/Quiz';
import Roadmap from './pages/Roadmap';
import Cards from './pages/Cards';
import Review from './pages/Review';
import Settings from './pages/Settings';
import Library from './pages/Library';

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

export default function App() {
  useTheme();
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
  else page = <Dashboard />;

  const hideNav = p2 === 'quiz' || (p0 === 'cards' && p1 === 'review');

  return (
    <div className="mx-auto min-h-screen max-w-2xl">
      {saveError && (
        <div className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900">
          Không lưu được vào bộ nhớ trình duyệt (chế độ ẩn danh?). Hãy Export JSON để không mất tiến độ.
        </div>
      )}
      <main className={`px-4 ${hideNav ? 'pb-8' : 'pb-28'}`}>{page}</main>
      {!hideNav && <BottomNav active={tab === 'week' ? 'learn' : tab} />}
    </div>
  );
}
