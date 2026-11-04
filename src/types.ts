// ===== Nội dung (đọc từ /content) =====

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface MCQ {
  q: string;
  options: string[];
  /** index của đáp án đúng (0-based) */
  answer: number;
  explain: string;
}

export interface CaseQuestion {
  scenario: string;
  question: string;
  /** gợi ý đáp án / tiêu chí tự chấm */
  guide: string;
}

export interface PracticeTask {
  title: string;
  context?: string;
  steps: string[];
  deliverable: string;
}

export interface WeekContent {
  week: number;
  title: string;
  phase: string;
  objectives: string[];
  /** tên file trong content/lessons */
  lesson: string;
  readingMinutes?: number;
  daily: Record<DayKey, string[]>;
  practice: PracticeTask[];
  quiz: { mcq: MCQ[]; cases: CaseQuestion[] };
}

export interface OutlineWeek {
  week: number;
  title: string;
  focus: string;
}

export interface Stage {
  id: string;
  title: string;
  role: string;
  years: string;
  summary: string;
  competencies: string[];
  experience: string[];
  certifications: string[];
  milestones: string[];
}

export interface Competency {
  id: string;
  name: string;
  short: string;
  description: string;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  /** căn cứ pháp lý, vd "Điều 25 BLLĐ 2019" */
  ref: string;
  /** true = cần kiểm tra lại văn bản gốc */
  verify?: boolean;
}

export interface FlashcardDeck {
  topic: { id: string; name: string; order: number };
  cards: Flashcard[];
}

export interface Quote {
  id: string;
  text: string;
  /** cụm tô highlight vàng — phải nằm trong text */
  highlight?: string;
  /** cụm gạch chân đỏ — phải nằm trong text */
  underline?: string;
  author: string;
  /** bản dịch tiếng Việt (bỏ trống nếu câu gốc đã là tiếng Việt) */
  vi?: string;
}

export interface LegalDoc {
  id: string;
  group: string;
  number: string;
  title: string;
  issued: string;
  effective: string;
  /** verified = nội dung app đã đối chiếu với văn bản gốc; link = mới chỉ có đường dẫn */
  status: 'verified' | 'link';
  highlights: string[];
  links: { label: string; url: string }[];
}

// ===== Tiến độ người dùng (lưu localStorage) =====

export interface CardState {
  ef: number;
  interval: number;
  reps: number;
  lapses: number;
  /** YYYY-MM-DD */
  due: string;
  last?: string;
}

export interface QuizAttempt {
  week: number;
  date: string; // ISO datetime
  correct: number;
  total: number;
  pct: number;
  caseAnswers: string[];
}

export interface Reflection {
  learned: string;
  applied: string;
  updated: string;
}

export interface SelfAssessment {
  month: string; // YYYY-MM
  scores: Record<string, number>;
}

export type Theme = 'system' | 'light' | 'dark';

export interface AppState {
  version: 1;
  currentStage: string;
  /** checklist[week][day] = mảng boolean theo thứ tự task */
  checklist: Record<string, Partial<Record<DayKey, boolean[]>>>;
  practiceDone: Record<string, boolean[]>;
  quizHistory: QuizAttempt[];
  overrides: number[];
  cards: Record<string, CardState>;
  studyDays: string[];
  selfAssessments: SelfAssessment[];
  reflections: Record<string, Reflection>;
  settings: { theme: Theme; dailyNewCards: number };
}
