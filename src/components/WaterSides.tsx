import { useEffect, useMemo, useState } from 'react';

// Hai panel trang trí hai bên màn hình rộng — phong cách mệnh Thủy:
// nước, cá Koi, sen, cá voi, ánh vàng kim (Kim sinh Thủy). Chỉ render khi màn hình đủ rộng.

const WIDE = '(min-width: 1100px)';

function useWide() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}

/** Cá Koi trắng – cam – vàng, đầu hướng sang phải */
function Koi({ id, size = 64, accent = '#ef7f22' }: { id: string; size?: number; accent?: string }) {
  return (
    <svg width={size} height={size * 0.5} viewBox="-16 0 72 24" overflow="visible">
      <defs>
        <clipPath id={`body-${id}`}>
          <path d="M0 12 C8 2 27 0 41 6 C47 8 51 10 54 12 C51 14 47 16 41 18 C27 24 8 22 0 12 Z" />
        </clipPath>
        <linearGradient id={`sheen-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3e8d6" />
        </linearGradient>
      </defs>
      {/* vây đuôi lượn */}
      <g className="koi-tail">
        <path d="M3 12 C-4 6 -10 2 -15 1 C-11 7 -11 17 -15 23 C-10 22 -4 18 3 12 Z" fill="#fff4e3" opacity="0.92" />
        <path d="M2 12 L-12 6 M2 12 L-12 18" stroke={accent} strokeWidth="0.8" opacity="0.5" />
      </g>
      {/* vây ngực */}
      <ellipse cx="34" cy="4.5" rx="6" ry="2.4" transform="rotate(-28 34 4.5)" fill="#fff4e3" opacity="0.85" />
      <ellipse cx="34" cy="19.5" rx="6" ry="2.4" transform="rotate(28 34 19.5)" fill="#fff4e3" opacity="0.85" />
      {/* thân + đốm màu */}
      <path d="M0 12 C8 2 27 0 41 6 C47 8 51 10 54 12 C51 14 47 16 41 18 C27 24 8 22 0 12 Z" fill={`url(#sheen-${id})`} />
      <g clipPath={`url(#body-${id})`}>
        <ellipse cx="38" cy="10" rx="9" ry="6" fill={accent} />
        <ellipse cx="20" cy="15" rx="8" ry="5" fill={accent} opacity="0.9" />
        <ellipse cx="11" cy="8" rx="4" ry="3" fill="#d4a434" />
        <path d="M6 12 C20 9 34 9 50 12" stroke="#ffffff" strokeWidth="1" opacity="0.5" fill="none" />
      </g>
      <circle cx="48.5" cy="9.6" r="1" fill="#1d2b33" />
    </svg>
  );
}

/** Đoá sen hồng – trắng nhuỵ vàng */
function Lotus({ size = 70 }: { size?: number }) {
  const petal = 'M0 0 C-7 -10 -6 -24 0 -32 C6 -24 7 -10 0 0 Z';
  return (
    <svg width={size} height={size * 0.75} viewBox="-40 -36 80 60">
      <defs>
        <linearGradient id="petal" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#fff7f4" />
          <stop offset="1" stopColor="#f2a6bd" />
        </linearGradient>
      </defs>
      {[-62, -40, -18, 18, 40, 62].map((r) => (
        <path key={r} d={petal} transform={`rotate(${r}) scale(${Math.abs(r) > 50 ? 0.8 : 1})`} fill="url(#petal)" stroke="#e98aa6" strokeWidth="0.5" />
      ))}
      <path d={petal} fill="url(#petal)" stroke="#e98aa6" strokeWidth="0.5" />
      <ellipse cx="0" cy="-2" rx="7" ry="3.5" fill="#e3b341" />
      {[-4, -1.5, 1.5, 4].map((x) => (
        <circle key={x} cx={x} cy="-3" r="0.9" fill="#a86f12" />
      ))}
    </svg>
  );
}

/** Lá súng có khe */
function LilyPad({ size = 80, rotate = 0 }: { size?: number; rotate?: number }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="-50 -30 100 60" style={{ transform: `rotate(${rotate}deg)` }}>
      {/* điểm đầu/cuối nằm đúng trên elip (±8°), đi vòng cung lớn ngược chiều kim đồng hồ để chừa khe lá */}
      <path d="M0 0 L45.5 -3.9 A46 28 0 1 0 45.5 3.9 Z" fill="#2f8f7c" opacity="0.9" />
      <path d="M0 0 L45.5 -3.9 A46 28 0 1 0 45.5 3.9 Z" fill="none" stroke="#7fd1bf" strokeWidth="1" opacity="0.6" />
      {[30, 90, 150, 210, 270].map((a) => (
        <line key={a} x1="0" y1="0" x2={Math.cos((a * Math.PI) / 180) * 40} y2={Math.sin((a * Math.PI) / 180) * 24} stroke="#7fd1bf" strokeWidth="0.6" opacity="0.5" />
      ))}
    </svg>
  );
}

/** Bóng cá voi dưới tầng nước sâu */
function Whale({ width = 260 }: { width?: number }) {
  return (
    <svg width={width} height={width * 0.42} viewBox="0 0 260 110" className="whale-shade">
      <path
        d="M8 60 C30 30 90 18 150 26 C190 31 222 44 238 52 C246 40 252 30 258 26 C256 40 254 50 250 58 C256 66 258 76 258 88 C250 82 244 74 236 66 C214 80 176 92 130 92 C80 92 36 82 8 60 Z"
        fill="currentColor"
      />
      <path d="M90 84 C96 96 106 104 118 106 C112 98 108 90 108 86 Z" fill="currentColor" />
      <path d="M30 66 C70 78 120 82 170 76" stroke="rgba(255,255,255,0.18)" strokeWidth="2" fill="none" />
    </svg>
  );
}

function Starfish({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-20 -20 40 40">
      <path
        d="M0 -18 L4.5 -6 L17 -5.5 L7 2.5 L10.5 15 L0 7.5 L-10.5 15 L-7 2.5 L-17 -5.5 L-4.5 -6 Z"
        fill="#e7a24d"
        stroke="#c97c2a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {[[0, -10], [7, -3], [5, 7], [-5, 7], [-7, -3]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.2" fill="#fbe2b8" />
      ))}
    </svg>
  );
}

function Shell({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="-20 -18 40 34">
      <path d="M0 14 C-14 10 -19 -4 -12 -12 C-6 -18 6 -18 12 -12 C19 -4 14 10 0 14 Z" fill="#f6ece0" stroke="#d8c4ad" strokeWidth="0.8" />
      {[-9, -4.5, 0, 4.5, 9].map((x) => (
        <path key={x} d={`M0 13 L${x * 1.3} -14`} stroke="#d8c4ad" strokeWidth="0.8" />
      ))}
      <path d="M-5 14 L5 14 L3 17 L-3 17 Z" fill="#e9d8c4" />
    </svg>
  );
}

function Coin({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24">
      <circle r="11" fill="#e6c25a" stroke="#b8902c" strokeWidth="1.2" />
      <circle r="8" fill="none" stroke="#fff1b8" strokeWidth="0.8" opacity="0.7" />
      <rect x="-3" y="-3" width="6" height="6" fill="#b8902c" />
    </svg>
  );
}

function Sparkles({ n }: { n: number }) {
  const items = useMemo(
    () => Array.from({ length: n }, () => ({ left: Math.random() * 92, top: Math.random() * 92, size: 6 + Math.random() * 8, delay: -Math.random() * 5, dur: 3 + Math.random() * 3 })),
    [n],
  );
  return (
    <>
      {items.map((s, i) => (
        <svg
          key={i}
          className="sparkle"
          width={s.size}
          height={s.size}
          viewBox="-10 -10 20 20"
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        >
          <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10 Z" fill="#f3d27a" />
        </svg>
      ))}
    </>
  );
}

function Ripples({ spots }: { spots: [number, number, number][] }) {
  return (
    <>
      {spots.map(([left, top, delay], i) => (
        <span key={i} className="ripple-spot" style={{ left: `${left}%`, top: `${top}%` }}>
          <i style={{ animationDelay: `${delay}s` }} />
          <i style={{ animationDelay: `${delay + 1.3}s` }} />
          <i style={{ animationDelay: `${delay + 2.6}s` }} />
        </span>
      ))}
    </>
  );
}

function LeftPanel() {
  return (
    <aside className="water-side left" aria-hidden>
      <div className="water-glyph">水</div>
      <div className="water-verse">
        <span className="cjk">上善若水</span>
        <span className="viet">Thượng thiện nhược thủy · Lão Tử</span>
      </div>
      <Ripples spots={[[50, 46, 0], [30, 72, 1.8], [68, 22, 3.1]]} />
      {/* hai cá Koi bơi vòng quanh đoá sen — hình âm dương */}
      <div className="koi-pond">
        <div className="koi-orbit">
          <div className="koi koi-a">
            <Koi id="a" size={104} />
          </div>
          <div className="koi koi-b">
            <Koi id="b" size={96} accent="#e2a32a" />
          </div>
        </div>
        <div className="pond-center bob-slow">
          <Lotus size={84} />
        </div>
      </div>
      <div className="float-item bob" style={{ left: '12%', bottom: '14%' }}>
        <LilyPad size={92} rotate={-18} />
      </div>
      <div className="float-item bob-slow" style={{ right: '10%', bottom: '24%' }}>
        <LilyPad size={64} rotate={140} />
      </div>
      <Sparkles n={9} />
    </aside>
  );
}

function RightPanel() {
  return (
    <aside className="water-side right" aria-hidden>
      <div className="whale-swim">
        <Whale width={300} />
      </div>
      <div className="koi-dive">
        <Koi id="c" size={84} />
      </div>
      <Ripples spots={[[40, 30, 0.6], [62, 64, 2.2]]} />
      <div className="coin-fall" style={{ left: '28%', animationDelay: '-2s' }}>
        <Coin size={20} />
      </div>
      <div className="coin-fall" style={{ left: '64%', animationDelay: '-9s', animationDuration: '20s' }}>
        <Coin size={16} />
      </div>
      <div className="coin-fall" style={{ left: '46%', animationDelay: '-15s', animationDuration: '24s' }}>
        <Coin size={14} />
      </div>
      <div className="lotus-cluster">
        <div className="bob">
          <LilyPad size={110} rotate={12} />
        </div>
        <div className="bob-slow" style={{ marginTop: -54, marginLeft: 30 }}>
          <Lotus size={78} />
        </div>
        <div className="bob" style={{ marginTop: -18, marginLeft: -40 }}>
          <LilyPad size={70} rotate={200} />
        </div>
      </div>
      <div className="seabed">
        <Starfish size={42} />
        <Shell size={40} />
        <Starfish size={28} />
      </div>
      <Sparkles n={10} />
    </aside>
  );
}

export function WaterSides() {
  const wide = useWide();
  if (!wide) return null;
  return (
    <>
      <LeftPanel />
      <RightPanel />
    </>
  );
}
