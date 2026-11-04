// Sinh trang "Hỏi đáp Luật Lao động" (Artifact trên claude.ai) từ dữ liệu trong /content.
// Trang gọi Claude bằng tài khoản Claude của người xem (capability `sample`) — không cần API key.
// Chạy: npm run qa  → qa-page/hoi-dap-luat.html  (rồi nhờ Claude đăng lại lên đúng link cũ)
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ---- Văn bản luật → mảng Điều ----
function parseLaw(file, expected) {
  const law = readFileSync(file, 'utf8').split('\n');
  const articles = [];
  let chapter = '';
  for (let i = 0; i < law.length; i++) {
    const line = law[i];
    const ch = line.match(/^Chương ([IVXLC]+)\s*$/);
    if (ch) {
      chapter = `Chương ${ch[1]}. ${(law[i + 1] ?? '').trim()}`;
      continue;
    }
    const m = line.match(/^Điều (\d+)\. (.*)$/);
    if (m) {
      articles.push({ n: Number(m[1]), title: m[2].trim(), chapter, lines: [] });
      continue;
    }
    if (articles.length && !/^Mục \d+\./.test(line)) articles[articles.length - 1].lines.push(line);
  }
  // Tiêu đề Điều dài bị xuống dòng: dòng kế tiếp bắt đầu bằng chữ thường (không phải "a) ") là phần nối
  const lowerStart = /^\p{Ll}/u;
  for (const a of articles) {
    while (a.lines.length && lowerStart.test(a.lines[0]) && !/^\p{Ll}\) /u.test(a.lines[0])) {
      a.title += ' ' + a.lines.shift().trim();
    }
    a.text = a.lines.join('\n').replace(/\n(Chương [IVXLC]+)\s*$/, '').trim();
    delete a.lines;
  }
  if (articles.length !== expected) throw new Error(`${file}: tách được ${articles.length} Điều, mong đợi ${expected}`);
  return articles.map(({ n, title, chapter, text }) => ({ n, t: title, c: chapter, x: text }));
}

const articles = parseLaw('content/legal/blld-2019.txt', 220);
// Bản Công báo đã tải chỉ có Điều 1–101 của NĐ 145 (Điều 102–115 nằm ở số Công báo kế tiếp)
const nd145 = parseLaw('content/legal/nd-145-2020.txt', 101);

// ---- Thẻ luật + thư viện văn bản ----
const decks = readdirSync('content/flashcards')
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(readFileSync(join('content/flashcards', f), 'utf8')));
const facts =
  '# DANH MỤC VĂN BẢN (đã tải bản gốc)\n' +
  JSON.parse(readFileSync('content/library.json', 'utf8'))
    .map((d) => `- ${d.number} — ${d.title}; ban hành ${d.issued}; hiệu lực ${d.effective}; ${d.status === 'verified' ? 'đã đối chiếu' : 'CHƯA đối chiếu nội dung'}. ${d.highlights.join('; ')}`)
    .join('\n') +
  '\n\n# CÁC ĐIỂM ĐÃ TÓM TẮT\n' +
  decks
    .map((d) => `## ${d.topic.name}\n` + d.cards.map((c) => `- ${c.front} → ${c.back.replace(/\n/g, ' ')} [${c.ref}]${c.verify ? ' ⚠️chưa đối chiếu' : ''}`).join('\n'))
    .join('\n');

const embed = (v) => JSON.stringify(v).replace(/</g, '\\u003c');
const built = new Date().toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const template = readFileSync('scripts/qa-page.template.html', 'utf8');
const html = template
  .replace('/*__ARTICLES__*/[]', embed(articles))
  .replace('/*__ND145__*/[]', embed(nd145))
  .replace('/*__FACTS__*/""', embed(facts))
  .replace('__BUILT__', built);

mkdirSync('qa-page', { recursive: true });
writeFileSync('qa-page/hoi-dap-luat.html', html);
console.log(
  `qa-page/hoi-dap-luat.html — BLLĐ ${articles.length} Điều · NĐ 145 ${nd145.length} Điều · ${(html.length / 1024).toFixed(0)} KB · tóm tắt ${(Buffer.byteLength(facts) / 1024).toFixed(0)} KB`,
);
