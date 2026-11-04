import { useEffect, useState } from 'react';

export interface Route {
  parts: string[];
  query: URLSearchParams;
}

function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  const [path, qs] = h.split('?');
  return { parts: path.split('/').filter(Boolean), query: new URLSearchParams(qs ?? '') };
}

/** Router dạng hash (#/week/3) — chạy được trên GitHub Pages không cần cấu hình server */
export function useRoute(): Route {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      setRoute(parse());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return route;
}

export function go(path: string) {
  window.location.hash = path.startsWith('/') ? path : '/' + path;
}

export function back(fallback = '/') {
  if (window.history.length > 1) window.history.back();
  else go(fallback);
}
