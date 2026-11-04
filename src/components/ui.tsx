import type { ReactNode } from 'react';
import { back } from '../lib/router';
import { sfx, vibrate } from '../lib/sound';

export function PageHeader({
  title,
  subtitle,
  backTo,
  right,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 -mx-4 mb-4 flex items-center gap-2 border-b border-stone-200/70 bg-stone-50/90 px-4 py-3 backdrop-blur dark:border-stone-800/70 dark:bg-stone-950/90">
      {backTo !== undefined && (
        <button
          onClick={() => back(backTo)}
          className="-ml-2 grid h-10 w-10 place-items-center rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800"
          aria-label="Quay lại"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold leading-tight">{title}</h1>
        {subtitle && <p className="truncate text-xs text-stone-500 dark:text-stone-400">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}

export function Progress({ value, className = '' }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-800 ${className}`}>
      <div className="h-full rounded-full bg-brand-600 transition-all duration-500" style={{ width: `${v}%` }} />
    </div>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-1 overflow-x-auto px-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => {
            if (t.id !== value) sfx.bubble();
            onChange(t.id);
          }}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
            value === t.id
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 hover:bg-stone-200/60 dark:text-stone-400 dark:hover:bg-stone-800'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Check({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <button
      onClick={() => {
        if (!checked) {
          sfx.drop();
          vibrate(12);
        }
        onChange();
      }}
      className="flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-stone-100 dark:hover:bg-stone-800/60"
      role="checkbox"
      aria-checked={checked}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition ${
          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300 dark:border-stone-600'
        }`}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <path d="M5 12l5 5L20 7" />
          </svg>
        )}
      </span>
      <span className={`text-[15px] leading-snug ${checked ? 'text-stone-400 line-through' : ''}`}>{children}</span>
    </button>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="card p-3">
      <div className="label">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
      {hint && <div className="text-xs text-stone-500 dark:text-stone-400">{hint}</div>}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500 dark:border-stone-700">{children}</div>;
}
