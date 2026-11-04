import { useEffect, useMemo } from 'react';
import { sfx } from '../lib/sound';
import type { Treasure } from '../lib/streak';

/** Màn ăn mừng mốc streak: rương mở nắp, toả sáng, xu vàng bắn ra */
export function TreasureChest({ treasure, onClose }: { treasure: Treasure; onClose: () => void }) {
  const coins = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
        const dist = 90 + Math.random() * 90;
        return {
          dx: Math.cos(angle) * dist,
          dy: Math.sin(angle) * dist,
          r: Math.round((Math.random() - 0.5) * 720),
          delay: 0.75 + (i % 8) * 0.05,
          size: 12 + Math.random() * 10,
        };
      }),
    [],
  );

  useEffect(() => {
    // Phát tiếng khi nắp bắt đầu bật
    const t = setTimeout(() => sfx.treasure(), 250);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div className="treasure-overlay" role="dialog" aria-modal="true" aria-labelledby="treasure-title">
      <div className="treasure-stage">
        <div className="treasure-rays" aria-hidden />
        <div className="treasure-glow" aria-hidden />
        <svg className="treasure-svg" viewBox="0 0 200 170" aria-hidden>
          <defs>
            <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#9a5b2c" />
              <stop offset="1" stopColor="#5e3417" />
            </linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff1a8" />
              <stop offset="0.5" stopColor="#e2b23c" />
              <stop offset="1" stopColor="#a8761d" />
            </linearGradient>
            <radialGradient id="inner" cx="0.5" cy="0.2" r="0.8">
              <stop offset="0" stopColor="#fff6c9" />
              <stop offset="0.5" stopColor="#f2c14e" />
              <stop offset="1" stopColor="#7a4a14" />
            </radialGradient>
          </defs>
          {/* lòng rương phát sáng (lộ ra khi nắp mở) */}
          <rect x="30" y="72" width="140" height="22" rx="4" fill="url(#inner)" />
          {/* thân rương */}
          <rect x="26" y="86" width="148" height="70" rx="8" fill="url(#wood)" stroke="#3d2210" strokeWidth="2" />
          {[52, 100, 148].map((x) => (
            <rect key={x} x={x - 6} y="86" width="12" height="70" fill="url(#gold)" opacity="0.95" />
          ))}
          <rect x="26" y="86" width="148" height="9" fill="url(#gold)" />
          <rect x="86" y="96" width="28" height="30" rx="5" fill="url(#gold)" stroke="#8a5d14" strokeWidth="1.5" />
          <circle cx="100" cy="108" r="4" fill="#5e3417" />
          <rect x="98.5" y="110" width="3" height="9" rx="1" fill="#5e3417" />
          {/* nắp rương — xoay quanh bản lề phía sau */}
          <g className="treasure-lid">
            <path d="M26 86 L26 62 C26 34 174 34 174 62 L174 86 Z" fill="url(#wood)" stroke="#3d2210" strokeWidth="2" />
            {[52, 100, 148].map((x) => (
              <path key={x} d={`M${x - 6} 86 L${x - 6} ${x === 100 ? 41 : 47} L${x + 6} ${x === 100 ? 41 : 47} L${x + 6} 86 Z`} fill="url(#gold)" />
            ))}
            <rect x="24" y="80" width="152" height="8" rx="2" fill="url(#gold)" />
          </g>
        </svg>
        {coins.map((c, i) => (
          <span
            key={i}
            className="treasure-coin"
            style={
              {
                width: c.size,
                height: c.size,
                animationDelay: `${c.delay}s`,
                '--dx': `${c.dx}px`,
                '--dy': `${c.dy}px`,
                '--r': `${c.r}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className="treasure-text">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-200">🔥 Chuỗi {treasure.days.toLocaleString('vi-VN')} ngày</div>
        <h2 id="treasure-title" className="mt-1 text-2xl font-bold text-white">
          {treasure.title}
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/80">{treasure.message}</p>
        <button className="btn mt-5 bg-gradient-to-b from-amber-300 to-amber-500 px-8 text-amber-950 shadow-lg" onClick={onClose} autoFocus>
          Nhận kho báu
        </button>
      </div>
    </div>
  );
}
