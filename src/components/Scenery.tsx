import { useState, type ReactNode } from 'react';
import { quotes } from '../lib/content';
import type { Quote } from '../types';

const BG_URL = `${import.meta.env.BASE_URL}bg/tien-gioi.webp`;

/** Tranh tiên cảnh làm nền tĩnh cho toàn app */
export function TienBackground() {
  return <div className="tien-bg" style={{ backgroundImage: `url(${BG_URL})` }} aria-hidden />;
}

/** Hai phướn thư pháp treo hai bên (chỉ hiện trên màn hình rộng, ẩn bằng CSS) */
export function PhuonHaiBen() {
  return (
    <>
      <Phuon side="trai" chu="天道酬勤" dich="Thiên đạo thù cần" />
      <Phuon side="phai" chu="學無止境" dich="Học vô chỉ cảnh" />
    </>
  );
}

function Phuon({ side, chu, dich }: { side: 'trai' | 'phai'; chu: string; dich: string }) {
  return (
    <div className={`phuon ${side}`} aria-hidden>
      <div className="truc" />
      <div className="vai">
        <span className="chu">{chu}</span>
        <span className="dich">{dich}</span>
      </div>
      <div className="tua" />
    </div>
  );
}

/** Vòng pháp trận tĩnh (hoạ tiết góc bảng hiệu) */
function PhapTran({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="-50 -50 100 100" fill="none" stroke="currentColor" aria-hidden>
      <circle r="46" strokeWidth="0.8" />
      <circle r="40" strokeWidth="0.5" strokeDasharray="1.5 2.5" />
      <circle r="26" strokeWidth="0.8" />
      <path d="M0 -40 L34.6 20 L-34.6 20 Z M0 40 L34.6 -20 L-34.6 -20 Z" strokeWidth="0.6" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d="M-4 -44 H4 M-4 -42 H-1 M1 -42 H4" strokeWidth="1" transform={`rotate(${i * 45})`} />
      ))}
    </svg>
  );
}

/** Bảng hiệu tông môn ở đầu trang Tổng quan */
export function TongMonHero({ children }: { children: ReactNode }) {
  return (
    <section className="tong-mon mb-5 mt-4 rounded-2xl px-5 pb-5 pt-5">
      <PhapTran className="phap-tran" />
      <div className="relative">{children}</div>
    </section>
  );
}

const LAST_KEY = 'hrd-academy:last-quote';

function pickQuote(exclude?: string): Quote {
  const pool = quotes.filter((q) => q.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)] ?? quotes[0];
}

/** Tô highlight và gạch chân các cụm đã khai báo trong câu */
function Decorated({ q }: { q: Quote }) {
  const marks = [q.highlight && { s: q.highlight, cls: 'mark' }, q.underline && { s: q.underline, cls: 'pen-line' }].filter(Boolean) as {
    s: string;
    cls: string;
  }[];
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

/** Cuộn giấy đạo ngôn — mỗi lần mở app một câu khác */
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
    <figure className="cuon-giay mx-1 mb-6 mt-2 rounded-sm px-5 pb-4 pt-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7a6a4c]">Đạo ngôn</span>
        <span className="dau-trien" aria-hidden>
          道
        </span>
      </div>
      <blockquote className="text-center text-[17px] leading-relaxed">
        “<Decorated q={q} />”
      </blockquote>
      {q.vi && <p className="mt-3 text-center font-sans text-[13px] italic leading-snug text-[#5b554b]">{q.vi}</p>}
      <figcaption className="mt-3 flex items-center justify-between gap-3 border-t border-[#d9ccb2] pt-3 font-sans">
        <span className="text-xs font-medium text-[#5b554b]">— {q.author}</span>
        <button onClick={another} className="btn min-h-[34px] shrink-0 bg-[#e8dcc3] px-3 text-xs text-[#3b372f] hover:bg-[#dfd0b2]">
          ↻ Câu khác
        </button>
      </figcaption>
    </figure>
  );
}
