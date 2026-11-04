# Hướng dẫn thêm & sửa nội dung

Mọi nội dung nằm trong thư mục **`/content`**. Bạn **không cần sửa code**: thêm file đúng định dạng → chạy `npm run check` → push lên GitHub là app tự cập nhật.

```
content/
├─ roadmap.json          Lộ trình 10 năm (5 giai đoạn)
├─ competencies.json     10 mảng năng lực cho radar chart
├─ year1-outline.json    Dàn ý các tuần chưa có nội dung đầy đủ
├─ weeks/week-01.json    Dữ liệu tuần: mục tiêu, checklist, thực hành, mini test
├─ lessons/week-01.md    Bài đọc của tuần (markdown)
└─ flashcards/01-hop-dong.json   Một file = một chủ đề thẻ luật
```

> **Mẹo:** sửa file JSON bằng **VS Code** (miễn phí) — nó tô đỏ ngay khi bạn quên dấu phẩy hay ngoặc. Luôn chạy `npm run check` trước khi push; lệnh này báo lỗi bằng tiếng Việt và chỉ rõ file/câu bị sai.

---

## 1. Thêm một tuần mới (vd. tuần 13)

### Bước 1 — Viết bài đọc: `content/lessons/week-13.md`

Markdown thông thường. Gợi ý cấu trúc (10–15 phút đọc ≈ 1.200–1.800 chữ):

```markdown
# Tiêu đề bài học

Đoạn mở đầu: vì sao chủ đề này quan trọng với bạn.

## 1. Khái niệm chính
...

| Cột A | Cột B |
|---|---|
| ... | ... |

> ⚠️ Chỗ nào chưa chắc về luật: ghi "Cần kiểm tra lại văn bản gốc".

## Tóm tắt
- Ý 1
- Ý 2
```

Hỗ trợ: tiêu đề `#`, `##`, `###`, **in đậm**, *nghiêng*, danh sách, bảng, trích dẫn `>`, khối code ```.

### Bước 2 — Tạo dữ liệu tuần: `content/weeks/week-13.json`

Copy một file tuần có sẵn (vd. `week-12.json`) rồi sửa. Giải thích từng trường:

```jsonc
{
  "week": 13,                         // số tuần (bắt buộc, không trùng)
  "title": "Tên tuần hiển thị",
  "phase": "C&B",                     // nhãn chủ đề ngắn
  "readingMinutes": 12,               // thời gian đọc ước tính (không bắt buộc)
  "objectives": ["Mục tiêu 1", "Mục tiêu 2"],
  "lesson": "week-13.md",             // tên file trong content/lessons
  "daily": {                          // đủ 7 ngày, mỗi ngày là một mảng việc
    "mon": ["Việc 1", "Việc 2"],
    "tue": [], "wed": [], "thu": [], "fri": [], "sat": [], "sun": []
  },
  "practice": [
    {
      "title": "Tên bài thực hành",
      "context": "Bối cảnh (không bắt buộc)",
      "steps": ["Bước 1", "Bước 2"],
      "deliverable": "Sản phẩm đầu ra"
    }
  ],
  "quiz": {
    "mcq": [
      {
        "q": "Câu hỏi?",
        "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        "answer": 1,                  // vị trí đáp án đúng, ĐẾM TỪ 0 (0 = A, 1 = B, 2 = C, 3 = D)
        "explain": "Giải thích vì sao đúng/sai"
      }
    ],
    "cases": [
      {
        "scenario": "Mô tả tình huống",
        "question": "Câu hỏi",
        "guide": "Gợi ý đáp án. Dùng \n để xuống dòng."
      }
    ]
  }
}
```

⚠️ Trong file `.json` thật **không được có comment** (`// ...`). Các comment ở trên chỉ để giải thích.

### Bước 3 — Kiểm tra & đăng

```bash
npm run check
```

Thấy `Nội dung hợp lệ.` là xong. Tuần 13 tự xuất hiện trong tab **Học** thay cho dòng dàn ý, và tự mở khoá khi bạn đạt ≥ 70% test tuần 12.

### Viết câu hỏi mini test tốt

- **Kiểm tra vận dụng, không chỉ học thuộc**: đặt câu hỏi trong tình huống ở công ty ("Nhân viên kho làm 8 giờ… được làm thêm tối đa bao nhiêu?") thay vì "Điều 107 quy định gì?".
- Đáp án sai nên là **lỗi hiểu nhầm phổ biến** (vd. áp thuế suất bậc cao nhất cho toàn bộ thu nhập).
- Phần `explain` luôn nêu **căn cứ** (số Điều, công thức) và vì sao các đáp án khác sai.
- App **tự xáo thứ tự đáp án** mỗi lần làm bài, nên trong `explain` đừng viết "đáp án A/B" — hãy nhắc lại nội dung đáp án.

---

## 2. Thêm thẻ luật

### Thêm thẻ vào chủ đề có sẵn

Mở file trong `content/flashcards/`, thêm một object vào mảng `cards`:

```json
{
  "id": "tl-10",
  "front": "Câu hỏi mặt trước",
  "back": "Đáp án mặt sau.\nDùng \\n để xuống dòng.",
  "ref": "Khoản 1 Điều 101 BLLĐ 2019",
  "verify": true
}
```

- `id`: **duy nhất trên toàn bộ thẻ**, không đổi sau khi tạo (tiến độ ôn của bạn gắn với id này).
- `ref`: căn cứ pháp lý cụ thể đến Khoản/Điều.
- `verify`: đặt `true` nếu nội dung có thể đã bị sửa đổi hoặc bạn chưa chắc — thẻ sẽ hiện cảnh báo ⚠️ "Cần kiểm tra lại văn bản gốc". Bỏ trường này nếu đã đối chiếu chắc chắn.

### Thêm chủ đề mới

Tạo file mới, vd. `content/flashcards/09-tranh-chap.json`:

```json
{
  "topic": { "id": "tranh-chap", "name": "Tranh chấp lao động", "order": 9 },
  "cards": [ ]
}
```

`order` quyết định thứ tự hiển thị.

### Khi luật thay đổi

Sửa trực tiếp `back`, `ref` của thẻ, giữ nguyên `id`. Nếu muốn ôn lại từ đầu thẻ đó, đổi sang `id` mới.

---

## 3. Sửa lộ trình 10 năm — `roadmap.json`

Mỗi giai đoạn trong mảng `stages`:

```json
{
  "id": "senior",
  "title": "Giai đoạn 2 · Senior HR / HRBP Junior",
  "realm": "Trúc Cơ",
  "role": "Chức danh",
  "years": "Năm 2 – 4 (2028 – 2030)",
  "summary": "Mô tả ngắn",
  "competencies": ["..."],
  "experience": ["..."],
  "certifications": ["..."],
  "milestones": ["..."]
}
```

`realm` là tên cảnh giới tu tiên hiển thị kèm tên giai đoạn (không bắt buộc). Không đổi `id` của giai đoạn bạn đang đánh dấu "hiện tại" (app lưu theo id). Phần trước dấu ` · ` trong `title` được hiển thị làm nhãn ngắn trên Dashboard.

## 4. Sửa mảng năng lực — `competencies.json`

```json
{ "id": "cb", "name": "Lương thưởng & Phúc lợi (C&B)", "short": "C&B", "description": "..." }
```

`short` là nhãn trên radar chart — nên ≤ 10 ký tự. Đổi `id` sẽ làm mất điểm tự đánh giá cũ của mảng đó.

## 5. Dàn ý tuần — `year1-outline.json`

```json
{ "week": 14, "title": "Employer Branding nâng cao & EVP", "focus": "Tuyển dụng" }
```

Khi đã có `weeks/week-14.json`, app tự dùng file đầy đủ; dòng dàn ý có thể giữ hoặc xoá.

---

## 6. Thư viện văn bản — `library.json`

Mỗi văn bản là một object trong mảng:

```json
{
  "id": "nd-399-2026",
  "group": "Tiền lương",
  "number": "399/2026/NĐ-CP",
  "title": "Nghị định quy định mức lương tối thiểu (áp dụng từ 2027)",
  "issued": "02/11/2026",
  "effective": "01/01/2027",
  "status": "verified",
  "highlights": ["Ý chính 1 cho HR", "Ý chính 2"],
  "links": [{ "label": "PDF Nghị định (Cổng TTĐT Chính phủ)", "url": "https://..." }]
}
```

- `group`: tạo tab lọc trong trang Thư viện (văn bản cùng nhóm hiện chung một tab).
- `status`: `"verified"` khi nội dung thẻ/bài học đã được đối chiếu với văn bản gốc; `"link"` khi mới chỉ lưu đường dẫn.
- `links`: ưu tiên link chính thức (`chinhphu.vn`, `congbao.chinhphu.vn`, `vbpl.vn`), bắt buộc `https://`.
- **Không chép file PDF vào repo** (repo đang public). Nếu muốn giữ bản tải về, để trong thư mục `tai-lieu/` — thư mục này đã được `.gitignore` nên không bị push.

## 7. Dữ liệu cho mục Hỏi đáp

Trang Hỏi đáp trên claude.ai được sinh từ chính `/content`:

- `content/legal/blld-2019.txt` — toàn văn Bộ luật Lao động (script tự tách thành 220 Điều).
- `content/flashcards/*.json` và `content/library.json` — các điểm đã tóm tắt, đã đối chiếu.

Sau khi sửa những file này: `npm run qa` → nhờ Claude Code đăng lại `qa-page/hoi-dap-luat.html` lên link cũ. Script sẽ báo lỗi nếu tách Bộ luật không ra đúng 220 Điều.

## 8. Quote trên trang Tổng quan — `quotes.json`

Mỗi lần mở app hiện ngẫu nhiên một câu (không lặp câu vừa xem). Thêm câu mới:

```json
{
  "id": "buffett-reputation",
  "text": "It takes 20 years to build a reputation and five minutes to ruin it.",
  "highlight": "five minutes to ruin it",
  "underline": "build a reputation",
  "author": "Warren Buffett — nhà đầu tư, tỉ phú",
  "vi": "Phải mất 20 năm để xây dựng danh tiếng và 5 phút để huỷ hoại nó."
}
```

- `highlight` (tô vàng) và `underline` (gạch chân đỏ) không bắt buộc, nhưng nếu có phải **chép đúng từng chữ** trong `text` — `npm run check` sẽ báo nếu sai.
- `vi`: bản dịch; bỏ trống nếu câu gốc là tiếng Việt.
- Kiểm tra tác giả trước khi thêm: rất nhiều quote trên mạng bị gán nhầm (vd. "What gets measured gets managed" không phải của Peter Drucker). Câu là diễn ý thì ghi rõ "(diễn ý)" trong `author`.

## 9. Lỗi thường gặp

| Thông báo | Cách sửa |
|---|---|
| `JSON lỗi — Unexpected token` | Thiếu/thừa dấu phẩy, ngoặc kép. Mở file bằng VS Code để thấy vị trí tô đỏ. |
| `không thấy file bài học` | Trường `lesson` phải trùng tên file trong `content/lessons/`. |
| `"answer" ngoài phạm vi options` | `answer` đếm từ 0; 4 đáp án thì chỉ được 0–3. |
| `trùng id thẻ` | Đổi `id` thẻ mới thành giá trị chưa dùng. |
| `daily.sun phải là mảng` | Đủ 7 ngày; ngày không có việc thì để `[]`. |
