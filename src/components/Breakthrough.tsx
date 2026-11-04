import { useEffect, type CSSProperties } from 'react';
import { sfx } from '../lib/sound';
import type { Treasure } from '../lib/streak';

/** Màn đột phá cảnh giới khi chuỗi ngày học chạm mốc: pháp trận vẽ nét, kim quang loé, hiện tên cảnh giới */
export function Breakthrough({ treasure, onClose }: { treasure: Treasure; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => sfx.treasure(), 150);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  // --len = chu vi (xấp xỉ) để hiệu ứng vẽ nét chạy đủ một vòng
  const line = (len: number): CSSProperties => ({ ['--len' as string]: len });

  return (
    <div className="dot-pha" role="dialog" aria-modal="true" aria-labelledby="dot-pha-title">
      <svg className="dot-pha-tran" viewBox="-100 -100 200 200" fill="none" stroke="currentColor" aria-hidden>
        <circle className="loe" r="70" fill="rgba(230,201,119,0.16)" stroke="none" />
        <circle className="ve" r="92" strokeWidth="1.2" style={line(580)} />
        <circle className="ve" r="80" strokeWidth="0.6" strokeDasharray="3 5" style={line(503)} />
        <circle className="ve" r="52" strokeWidth="1.2" style={line(327)} />
        <path className="ve" d="M0 -80 L69.3 40 L-69.3 40 Z" strokeWidth="1" style={line(416)} />
        <path className="ve" d="M0 80 L69.3 -40 L-69.3 -40 Z" strokeWidth="1" style={line(416)} />
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`rotate(${i * 45})`} className="loe">
            <path d="M-9 -88 H9 M-9 -84 H-2 M2 -84 H9 M-9 -80 H9" strokeWidth="1.6" />
          </g>
        ))}
        <text className="loe" y="12" textAnchor="middle" fill="currentColor" stroke="none" fontSize="34" fontFamily="'Noto Serif', serif" fontWeight="700">
          破
        </text>
      </svg>

      <div className="dot-pha-chu">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-kim-300">🔥 Bế quan {treasure.days.toLocaleString('vi-VN')} ngày</div>
        <h2 id="dot-pha-title" className="mt-1 font-serif text-2xl font-bold text-kim-100">
          Đột phá · {treasure.title}
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-200">{treasure.message}</p>
        <button className="btn mt-5 bg-gradient-to-b from-kim-300 to-kim-500 px-8 text-kim-700 shadow-lg" onClick={onClose} autoFocus>
          Tiếp tục tu luyện
        </button>
      </div>
    </div>
  );
}
