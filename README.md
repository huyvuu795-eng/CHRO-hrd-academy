# HRD Academy

Web app học tập cá nhân: lộ trình 10 năm từ **Recruiter → HR Director/CHRO**.
Chạy trên điện thoại như một app thật (PWA), dùng được offline, không cần tài khoản hay máy chủ.

**Có gì bên trong**

- **Lộ trình 10 năm**: 5 giai đoạn, mỗi giai đoạn có năng lực, kinh nghiệm, chứng chỉ, dấu mốc; đánh dấu được giai đoạn hiện tại.
- **Lộ trình năm 1**: 12 tuần đầy đủ nội dung (bài đọc, checklist Thứ 2 → Chủ nhật, bài thực hành, mini test) + dàn ý tuần 13–52.
- **Mini test**: 10 câu trắc nghiệm có giải thích + câu tình huống, lưu lịch sử điểm, mở tuần sau khi đạt ≥ 70% (có nút mở khoá thủ công).
- **Thẻ luật lao động**: 70 thẻ theo 8 chủ đề, ghi rõ số Điều, ôn bằng thuật toán SM-2 (Quên / Khó / Nhớ / Dễ).
- **Dashboard**: streak, % hoàn thành tuần, biểu đồ điểm, radar 10 mảng năng lực tự đánh giá hằng tháng.
- **Nhật ký** mỗi tuần, **Export/Import JSON** để sao lưu và chuyển máy, **giao diện sáng/tối**.

> ⚠️ Nội dung luật được viết cẩn thận và ghi số Điều, nhưng văn bản pháp luật thay đổi thường xuyên. Các thẻ/đoạn có dấu ⚠️ cần đối chiếu văn bản gốc (vbpl.vn, thuvienphapluat.vn) trước khi áp dụng thực tế.

---

## 1. Chạy trên máy tính (local)

### Cài một lần

1. Cài **Node.js** bản LTS từ <https://nodejs.org> (bấm nút tải bản "LTS", cài như phần mềm bình thường).
2. Mở thư mục `hrd-academy`, bấm chuột phải vào khoảng trống → **Open in Terminal** (hoặc mở PowerShell rồi `cd` tới thư mục này).
3. Chạy lệnh cài thư viện:

```bash
npm install
```

### Chạy app

```bash
npm run dev
```

Mở trình duyệt vào địa chỉ hiện ra (thường là <http://localhost:5173>).

### Các lệnh khác

| Lệnh | Tác dụng |
|---|---|
| `npm run check` | Kiểm tra file nội dung trong `/content` có đúng định dạng không |
| `npm run build` | Kiểm tra nội dung + đóng gói app vào thư mục `dist/` |
| `npm run preview` | Chạy thử bản đã đóng gói (để thử PWA/offline) |
| `npm run icons` | Tạo lại icon app trong `/public` |

---

## 2. Đưa app lên mạng miễn phí

Chọn **một** trong hai cách. Cả hai đều cần tài khoản **GitHub** (miễn phí) để lưu mã nguồn.

### Bước chung: đưa mã nguồn lên GitHub

Cách dễ nhất cho người không chuyên code là dùng **GitHub Desktop**:

1. Tạo tài khoản tại <https://github.com>.
2. Tải và cài **GitHub Desktop**: <https://desktop.github.com>, đăng nhập bằng tài khoản vừa tạo.
3. Trong GitHub Desktop: **File → Add local repository…** → chọn thư mục `hrd-academy`.
   Nếu được hỏi "This directory does not appear to be a Git repository", bấm **create a repository** → **Create repository**.
4. Bấm **Publish repository**. Bỏ tick "Keep this code private" nếu muốn dùng GitHub Pages miễn phí với repo công khai (Vercel thì để private được).
5. Từ nay, mỗi khi sửa nội dung: mở GitHub Desktop → gõ mô tả ngắn ở ô **Summary** → **Commit to main** → **Push origin**.

### Cách A — Vercel (khuyến nghị, đơn giản nhất)

1. Vào <https://vercel.com> → **Sign Up** → chọn **Continue with GitHub**.
2. Bấm **Add New… → Project** → chọn repo `hrd-academy` → **Import**.
3. Vercel tự nhận ra đây là dự án **Vite**. Giữ nguyên mọi thiết lập (Build Command: `npm run build`, Output Directory: `dist`) → bấm **Deploy**.
4. Đợi 1–2 phút, bạn nhận được địa chỉ dạng `https://hrd-academy-xxx.vercel.app`.
5. Mỗi lần bạn **Push** lên GitHub, Vercel tự cập nhật app.

### Cách B — GitHub Pages

Dự án đã có sẵn file tự động `.github/workflows/deploy.yml`.

1. Trên trang repo GitHub: **Settings → Pages**.
2. Ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
3. Push bất kỳ thay đổi nào lên nhánh `main` (hoặc vào tab **Actions → Deploy to GitHub Pages → Run workflow**).
4. Đợi tab **Actions** hiện dấu ✓ xanh. App nằm ở `https://<tên-tài-khoản>.github.io/hrd-academy/`.

---

## 3. Cài lên màn hình điện thoại Android

1. Mở địa chỉ app (Vercel hoặc GitHub Pages) bằng **Chrome** trên điện thoại.
2. Bấm menu **⋮** → **Thêm vào màn hình chính** (hoặc **Cài đặt ứng dụng**).
3. App xuất hiện như ứng dụng bình thường. Sau lần mở đầu tiên, dùng được cả khi không có mạng.

---

## 4. Dữ liệu của bạn nằm ở đâu?

- Toàn bộ tiến độ lưu trong **bộ nhớ trình duyệt (localStorage)** của thiết bị đang dùng — không gửi lên máy chủ nào.
- **Xoá dữ liệu trình duyệt, dùng tab ẩn danh, hoặc đổi máy sẽ mất tiến độ** nếu chưa sao lưu.
- Vào **Cài đặt → Export JSON** mỗi tuần, lưu file lên Google Drive. Sang máy mới: **Import JSON**.
- Dữ liệu trên máy tính và điện thoại **không tự đồng bộ** — dùng Export/Import để chuyển.

---

## 5. Thêm nội dung mới

Xem **[CONTENT_GUIDE.md](CONTENT_GUIDE.md)**: thêm tuần 13+, thêm thẻ luật, sửa lộ trình — chỉ sửa file trong `/content`, không đụng tới code.

---

## Công nghệ

Vite + React 18 + TypeScript + Tailwind CSS + Recharts + react-markdown + vite-plugin-pwa. Điều hướng bằng hash (`#/week/3`) để chạy được trên GitHub Pages mà không cần cấu hình máy chủ.

```
hrd-academy/
├─ content/            ← nội dung (bạn sửa ở đây)
│  ├─ roadmap.json, competencies.json, year1-outline.json
│  ├─ weeks/week-XX.json
│  ├─ lessons/week-XX.md
│  └─ flashcards/*.json
├─ src/
│  ├─ lib/             (content loader, store/localStorage, SM-2, router)
│  ├─ components/
│  └─ pages/           (Dashboard, Learn, Week, Quiz, Roadmap, Cards, Review, Settings)
├─ scripts/            (check-content.mjs, gen-icons.mjs)
└─ public/             (icon PWA)
```
