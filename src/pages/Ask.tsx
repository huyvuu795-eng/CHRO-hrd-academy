import { PageHeader } from '../components/ui';
import { library } from '../lib/content';

// Trang Hỏi đáp chạy trên claude.ai (Artifact) và dùng tài khoản Claude của bạn — không cần API key.
// Khi đăng lại trang (npm run qa rồi nhờ Claude publish), link giữ nguyên.
const QA_URL = 'https://claude.ai/artifact/FC3HH7jDRUGnzUe6e3c3dX';

const TIPS = [
  'Nêu đủ dữ kiện: loại HĐLĐ, thời gian đã làm, số lao động của công ty…',
  'Bấm vào "Điều N" trong câu trả lời để xem nguyên văn Điều đó.',
  'Chế độ "Tra Điều" tìm theo từ khoá hoặc số Điều, không tốn lượt dùng Claude.',
  'Ý nào gắn ⚠️ là chưa đối chiếu được văn bản gốc — kiểm tra lại trước khi áp dụng.',
];

export default function Ask() {
  const verified = library.filter((d) => d.status === 'verified');
  return (
    <div>
      <PageHeader title="Hỏi đáp luật" subtitle="Hỏi Trưởng lão · Claude trả lời dựa trên văn bản gốc" />

      <section className="card mb-4">
        <h2 className="mb-1 text-lg font-semibold">Hỏi nhanh về luật lao động</h2>
        <p className="mb-4 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          Mở trang Hỏi đáp trên Claude. Claude đọc nguyên văn Bộ luật Lao động 2019 và các điểm đã đối chiếu trong app, trả lời kèm số Điều cụ thể.
          Câu hỏi dùng hạn mức tài khoản Claude của bạn, không cần API key.
        </p>
        <a href={QA_URL} target="_blank" rel="noopener noreferrer" className="btn-primary w-full">
          Mở Hỏi đáp trên Claude ↗
        </a>
        <p className="mt-2 text-xs text-stone-500">Lần đầu, Claude hỏi bạn có cho phép trang dùng Claude không — chọn Cho phép.</p>
      </section>

      <section className="card mb-4">
        <div className="label mb-2">Mẹo hỏi cho chính xác</div>
        <ul className="space-y-1.5">
          {TIPS.map((t) => (
            <li key={t} className="flex gap-2 text-sm leading-snug">
              <span className="text-brand-600">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <div className="label mb-2">Nguồn Claude dùng để trả lời</div>
        <ul className="space-y-1 text-sm">
          {verified.map((d) => (
            <li key={d.id}>
              <span className="font-semibold text-brand-700 dark:text-brand-400">{d.number}</span> · {d.title}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-stone-500">Đọc được nguyên văn BLLĐ 2019, NĐ 145/2020, Luật BHXH 2024 và Luật Việc làm 2025. Các nghị định hướng dẫn BHXH (NĐ 158, 274…) chưa có nguyên văn — Claude sẽ đánh dấu ⚠️ khi câu hỏi chạm tới.</p>
      </section>
    </div>
  );
}
