// Kiểm tra nội dung trong /content trước khi build. Chạy: npm run check
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = 'content';
const errors = [];
const warn = [];
const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const read = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch (e) {
    errors.push(`${p}: JSON lỗi — ${e.message}`);
    return null;
  }
};

const weekNums = new Set();
for (const f of readdirSync(join(root, 'weeks')).filter((f) => f.endsWith('.json'))) {
  const p = join(root, 'weeks', f);
  const w = read(p);
  if (!w) continue;
  if (typeof w.week !== 'number') errors.push(`${p}: thiếu "week" (số)`);
  if (weekNums.has(w.week)) errors.push(`${p}: trùng số tuần ${w.week}`);
  weekNums.add(w.week);
  for (const k of ['title', 'phase', 'lesson']) if (!w[k]) errors.push(`${p}: thiếu "${k}"`);
  if (w.lesson && !existsSync(join(root, 'lessons', w.lesson))) errors.push(`${p}: không thấy file bài học lessons/${w.lesson}`);
  if (!Array.isArray(w.objectives) || !w.objectives.length) errors.push(`${p}: thiếu "objectives"`);
  for (const d of DAYS) if (!Array.isArray(w.daily?.[d])) errors.push(`${p}: daily.${d} phải là mảng`);
  if (!Array.isArray(w.practice) || !w.practice.length) errors.push(`${p}: thiếu "practice"`);
  const mcq = w.quiz?.mcq ?? [];
  if (mcq.length < 10) warn.push(`${p}: chỉ có ${mcq.length} câu trắc nghiệm (khuyến nghị 10)`);
  mcq.forEach((q, i) => {
    if (!q.q || !Array.isArray(q.options) || q.options.length < 2) errors.push(`${p}: câu ${i + 1} thiếu q/options`);
    if (!(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < (q.options?.length ?? 0)))
      errors.push(`${p}: câu ${i + 1} có "answer" ngoài phạm vi options`);
    if (!q.explain) warn.push(`${p}: câu ${i + 1} chưa có giải thích`);
  });
  for (const [i, c] of (w.quiz?.cases ?? []).entries())
    if (!c.scenario || !c.question || !c.guide) errors.push(`${p}: case ${i + 1} thiếu scenario/question/guide`);
}

const ids = new Set();
let cardCount = 0;
for (const f of readdirSync(join(root, 'flashcards')).filter((f) => f.endsWith('.json'))) {
  const p = join(root, 'flashcards', f);
  const d = read(p);
  if (!d) continue;
  if (!d.topic?.id || !d.topic?.name) errors.push(`${p}: thiếu topic.id/topic.name`);
  for (const c of d.cards ?? []) {
    cardCount++;
    if (!c.id || !c.front || !c.back || !c.ref) errors.push(`${p}: thẻ ${c.id ?? '?'} thiếu id/front/back/ref`);
    if (ids.has(c.id)) errors.push(`${p}: trùng id thẻ "${c.id}"`);
    ids.add(c.id);
  }
}

const lib = read(join(root, 'library.json')) ?? [];
const libIds = new Set();
for (const d of lib) {
  const where = `library.json: "${d.id ?? '?'}"`;
  for (const k of ['id', 'group', 'number', 'title', 'issued', 'effective']) if (!d[k]) errors.push(`${where} thiếu "${k}"`);
  if (!['verified', 'link'].includes(d.status)) errors.push(`${where} "status" phải là "verified" hoặc "link"`);
  if (libIds.has(d.id)) errors.push(`${where} trùng id`);
  libIds.add(d.id);
  if (!Array.isArray(d.links) || !d.links.length) errors.push(`${where} cần ít nhất 1 link`);
  for (const l of d.links ?? []) if (!/^https:\/\//.test(l.url ?? '')) errors.push(`${where} link phải bắt đầu bằng https://`);
}

const quotes = read(join(root, 'quotes.json')) ?? [];
const quoteIds = new Set();
for (const q of quotes) {
  const where = `quotes.json: "${q.id ?? '?'}"`;
  if (!q.id || !q.text || !q.author) errors.push(`${where} thiếu id/text/author`);
  if (quoteIds.has(q.id)) errors.push(`${where} trùng id`);
  quoteIds.add(q.id);
  for (const k of ['highlight', 'underline'])
    if (q[k] && !q.text.includes(q[k])) errors.push(`${where} "${k}" không nằm trong câu (phải chép đúng từng chữ)`);
}

read(join(root, 'roadmap.json'));
read(join(root, 'competencies.json'));
read(join(root, 'year1-outline.json'));

console.log(`✔ ${weekNums.size} tuần · ${cardCount} thẻ luật · ${lib.length} văn bản trong thư viện · ${quotes.length} quote`);
warn.forEach((w) => console.log('⚠ ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('✖ ' + e));
  process.exit(1);
}
console.log('Nội dung hợp lệ.');
