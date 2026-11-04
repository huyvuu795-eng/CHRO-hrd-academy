import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppState, QuizAttempt } from '../types';
import { today } from './date';
import { stages } from './content';
import { defaultSound } from './sound';

const KEY = 'hrd-academy:v1';
export const PASS_PCT = 70;

export function defaultState(): AppState {
  return {
    version: 1,
    currentStage: stages[0]?.id ?? 'specialist',
    checklist: {},
    practiceDone: {},
    quizHistory: [],
    overrides: [],
    cards: {},
    studyDays: [],
    selfAssessments: [],
    reflections: {},
    streakRewards: [],
    mistakes: {},
    settings: { theme: 'system', dailyNewCards: 10, sound: { ...defaultSound } },
  };
}

/** Gộp dữ liệu đọc được với mặc định để file cũ/thiếu trường vẫn chạy */
export function normalize(raw: unknown): AppState {
  const base = defaultState();
  if (!raw || typeof raw !== 'object') return base;
  const r = raw as Partial<AppState>;
  return {
    ...base,
    ...r,
    version: 1,
    settings: {
      ...base.settings,
      ...(r.settings ?? {}),
      sound: { ...base.settings.sound, ...(r.settings?.sound ?? {}) },
    },
  };
}

function load(): AppState {
  try {
    const s = localStorage.getItem(KEY);
    return s ? normalize(JSON.parse(s)) : defaultState();
  } catch {
    return defaultState();
  }
}

function save(s: AppState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
    return true;
  } catch {
    return false;
  }
}

interface Ctx {
  state: AppState;
  update: (fn: (draft: AppState) => void) => void;
  replace: (s: AppState) => void;
  saveError: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(load);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    setSaveError(!save(state));
  }, [state]);

  const update = useCallback((fn: (draft: AppState) => void) => {
    setState((prev) => {
      const draft = structuredClone(prev);
      fn(draft);
      return draft;
    });
  }, []);

  const replace = useCallback((s: AppState) => setState(normalize(s)), []);

  return (
    <StoreContext.Provider value={{ state, update, replace, saveError }}>{children}</StoreContext.Provider>
  );
}

export function useStore(): Ctx {
  const c = useContext(StoreContext);
  if (!c) throw new Error('useStore phải nằm trong StoreProvider');
  return c;
}

// ===== Helpers thuần (dùng chung giữa các màn hình) =====

export function markStudied(d: AppState) {
  const t = today();
  if (!d.studyDays.includes(t)) d.studyDays.push(t);
}

export function bestScore(s: AppState, week: number): QuizAttempt | undefined {
  return s.quizHistory
    .filter((a) => a.week === week)
    .reduce<QuizAttempt | undefined>((best, a) => (!best || a.pct > best.pct ? a : best), undefined);
}

export function isPassed(s: AppState, week: number): boolean {
  return (bestScore(s, week)?.pct ?? 0) >= PASS_PCT;
}

export function isUnlocked(s: AppState, week: number): boolean {
  if (week <= 1) return true;
  return s.overrides.includes(week) || isPassed(s, week - 1);
}
