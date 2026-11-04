import { useMemo, useState, type ReactNode } from 'react';
import { quotes } from '../lib/content';
import type { Quote } from '../types';

type Bubble = { left: string; size: number; duration: number; delay: number };

function makeBubbles(n: number, maxSize: number, minDur: number, maxDur: number): Bubble[] {
  return Array.from({ length: n }, () => ({
    left: `${Math.round(Math.random() * 96)}%`,
    size: Math.round(4 + Math.random() * maxSize),
    duration: minDur + Math.random() * (maxDur - minDur),
    delay: -Math.random() * maxDur, // âm để bọt đã đang nổi ngay khi mở trang
  }));
}

function Bubbles({ items }: { items: Bubble[] }) {
  return (
    <>
      {items.map((b, i) => (
        <span
          key={i}
          className="bubble"
          style={{ left: b.left, width: b.size, height: b.size, animationDuration: `${b.duration}s`, animationDelay: `${b.delay}s` }}
        />
      ))}
    </>
  );
}

/** Lớp nền cố định phía sau toàn app: vệt sáng mặt nước + vài bọt nước thưa */
export function OceanBackdrop() {
  const bubbles = useMemo(() => makeBubbles(7, 10, 22, 40), []);
  return (
    <div className="ocean-backdrop" aria-hidden>
      <div className="caustic" />
      <div className="caustic c2" />
      <div className="caustic c3" />
      <Bubbles items={bubbles} />
    </div>
  );
}

function Wave({ fill, height, duration, opacity, bob }: { fill: string; height: number; duration: number; opacity: number; bob?: boolean }) {
  // Hai chu kỳ sóng giống hệt nhau nối liền → trượt -50% là lặp liền mạch
  const path = 'M0 20 C 100 0 200 40 300 20 S 500 0 600 20 S 800 40 900 20 S 1100 0 1200 20 V 60 H 0 Z';
  return (
    <div className={bob ? 'wave-bob' : undefined} style={{ position: 'absolute', inset: 0 }}>
      <svg className="wave-track" style={{ height, animationDuration: `${duration}s`, opacity }} viewBox="0 0 1200 60" preserveAspectRatio="none">
        <path d={path} fill={fill} />
      </svg>
    </div>
  );
}

/** Dải biển ở đầu trang Tổng quan: tia nắng, bọt nước, ba lớp sóng */
export function OceanHero({ children }: { children: ReactNode }) {
  const bubbles = useMemo(() => makeBubbles(12, 12, 6, 12), []);
  return (
    <section className="ocean-hero -mx-4 mb-5 px-4 pb-14 pt-6 text-white sm:mx-0 sm:rounded-3xl">
      <div className="rays" aria-hidden />
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <Bubbles items={bubbles} />
      </div>
      <div className="relative">{children}</div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12">
        <Wave fill="rgba(255,255,255,0.18)" height={46} duration={18} opacity={1} bob />
        <Wave fill="rgba(255,255,255,0.28)" height={38} duration={12} opacity={1} />
        <Wave fill="var(--sea-floor)" height={30} duration={8} opacity={1} />
      </div>
    </section>
  );
}

const LAST_KEY = 'hrd-academy:last-quote';

function pickQuote(exclude?: string): Quote {
  const pool = quotes.filter((q) => q.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? quotes[0];
}

/** Tô highlight và gạch chân các cụm đã khai báo trong quote */
function Decorated({ q }: { q: Quote }) {
  const marks = [
    q.highlight && { s: q.highlight, cls: 'mark' },
    q.underline && { s: q.underline, cls: 'pen-line' },
  ].filter(Boolean) as { s: string; cls: string }[];
  const spans = marks
    .map((m) => ({ ...m, i: q.text.indexOf(m.s) }))
    .filter((m) => m.i >= 0)
    .sort((a, b) => a.i - b.i);
  const out: ReactNode[] = [];
  let pos = 0;
  for (const m of spans) {
    if (m.i < pos) continue; // bỏ cụm chồng lên cụm trước
    out.push(q.text.slice(pos, m.i));
    out.push(
      <span key={m.i} className={m.cls}>
        {m.s}
      </span>,
    );
    pos = m.i + m.s.length;
  }
  out.push(q.text.slice(pos));
  return <>{out}</>;
}

/** Thẻ quote kiểu trang giấy — mỗi lần mở app hiện một câu khác */
export function QuoteCard() {
  const [q, setQ] = useState<Quote>(() => {
    let last: string | undefined;
    try {
      last = localStorage.getItem(LAST_KEY) ?? undefined;
    } catch {
      /* bộ nhớ bị chặn: vẫn chọn ngẫu nhiên */
    }
    const next = pickQuote(last);
    try {
      localStorage.setItem(LAST_KEY, next.id);
    } catch {
      /* bỏ qua */
    }
    return next;
  });

  const another = () => {
    const next = pickQuote(q.id);
    try {
      localStorage.setItem(LAST_KEY, next.id);
    } catch {
      /* bỏ qua */
    }
    setQ(next);
  };

  return (
    <figure key={q.id} className="paper surface-in relative -mt-10 mb-5 rounded-2xl px-5 pb-4 pt-6">
      <blockquote className="text-center text-[17px] leading-relaxed">
        <span className="select-none text-stone-500">“</span>
        <Decorated q={q} />
        <span className="select-none text-stone-500">”</span>
      </blockquote>
      {q.vi && <p className="mt-3 text-center font-sans text-[13px] italic leading-snug text-[#5b554b]">{q.vi}</p>}
      <figcaption className="mt-3 flex items-center justify-between gap-3 border-t border-[#d9d1c3] pt-3 font-sans">
        <span className="text-xs font-medium text-[#5b554b]">— {q.author}</span>
        <button onClick={another} className="btn min-h-[34px] shrink-0 bg-[#e6dfd2] px-3 text-xs text-[#3b372f] hover:bg-[#ddd4c4]">
          ↻ Câu khác
        </button>
      </figcaption>
    </figure>
  );
}
