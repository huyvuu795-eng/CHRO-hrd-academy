# Recruitment Analytics: nhập môn HR Analytics bằng dữ liệu bạn đã có

HR Director được mời vào phòng họp Ban Giám đốc vì họ **nói bằng số**. Bước đầu tiên trên con đường đó: biến dữ liệu tuyển dụng hằng ngày của bạn thành insight cho quản lý.

## 1. Bốn cấp độ của HR Analytics

| Cấp độ | Câu hỏi | Ví dụ tuyển dụng |
|---|---|---|
| Mô tả (Descriptive) | Chuyện gì đã xảy ra? | Tháng 10 tuyển được 25 người |
| Chẩn đoán (Diagnostic) | Vì sao? | Kênh referral có tỷ lệ chuyển đổi gấp 3 lần job board |
| Dự báo (Predictive) | Chuyện gì sẽ xảy ra? | Mùa sale Q4 cần thêm 40 người, phải mở tuyển từ tháng 9 |
| Đề xuất (Prescriptive) | Nên làm gì? | Chuyển 30% ngân sách job board sang chương trình referral |

Phần lớn phòng HR ở Việt Nam đang ở cấp 1. Chỉ cần bạn làm tốt cấp 2 là đã nổi bật.

## 2. Bộ chỉ số tuyển dụng cốt lõi

### Tốc độ

- **Time-to-fill**: số ngày từ lúc mở yêu cầu tuyển đến khi ứng viên nhận offer. Đo hiệu quả quy trình.
- **Time-to-hire**: số ngày từ lúc ứng viên vào phễu (nộp CV/được tiếp cận) đến khi nhận offer. Đo trải nghiệm ứng viên.

### Chi phí

- **Cost-per-hire (CPH)** = (Chi phí nội bộ + Chi phí bên ngoài) ÷ Số người tuyển được.
  - Nội bộ: lương phần thời gian của team tuyển dụng, thưởng referral, chi phí phỏng vấn.
  - Bên ngoài: job board, headhunter, sự kiện, quảng cáo.

**Ví dụ:** Quý 3, chi job board 30 triệu, headhunter 45 triệu (1 vị trí quản lý), thưởng referral 10 triệu, chi phí nhân sự tuyển dụng phân bổ 60 triệu. Tuyển được 29 người.
CPH = (30 + 45 + 10 + 60) ÷ 29 ≈ **5 triệu/người**. Nhưng nếu tách riêng: vị trí quản lý qua headhunter tốn 45 triệu — cần báo cáo theo nhóm vị trí, đừng chỉ một con số bình quân.

### Chất lượng

- **Quality of hire**: thường kết hợp điểm hiệu suất sau 6–12 tháng, tỷ lệ qua thử việc, đánh giá của quản lý.
- **Tỷ lệ nghỉ việc sớm (Early turnover)**: % người mới nghỉ trong 90 ngày đầu.
- **Offer acceptance rate** = Số offer được nhận ÷ Số offer gửi đi.

### Phễu tuyển dụng (Funnel)

| Bước | Số lượng | Tỷ lệ chuyển đổi |
|---|---|---|
| CV nhận được | 400 | — |
| Qua sàng lọc CV | 120 | 30% |
| Qua phỏng vấn sơ bộ | 50 | 42% |
| Qua phỏng vấn quản lý | 18 | 36% |
| Gửi offer | 12 | 67% |
| Nhận offer | 9 | 75% |

Đọc phễu để tìm **điểm nghẽn**: nếu tỷ lệ qua phỏng vấn quản lý chỉ 10%, có thể recruiter và quản lý chưa thống nhất tiêu chí (quay lại tuần 3!).

## 3. Phân tích theo kênh (Source of hire)

Đừng chỉ đếm CV theo kênh — hãy đo **kênh nào tạo ra người giỏi và ở lại**:

| Kênh | CV | Tuyển được | Tỷ lệ | Còn làm sau 6 tháng |
|---|---|---|---|---|
| Job board A | 250 | 6 | 2,4% | 3 (50%) |
| Facebook group | 90 | 5 | 5,6% | 3 (60%) |
| Referral | 30 | 5 | 16,7% | 5 (100%) |
| LinkedIn | 30 | 2 | 6,7% | 2 (100%) |

Insight: referral ít CV nhưng hiệu quả cao nhất cả về chuyển đổi và giữ chân → đề xuất tăng thưởng referral.

## 4. Kỹ năng Excel/Google Sheets tối thiểu

Bạn không cần Python ngay. Thành thạo những hàm sau là đủ cho 80% báo cáo HR:

- `COUNTIFS`, `SUMIFS`, `AVERAGEIFS` — đếm, cộng, trung bình có điều kiện.
- `XLOOKUP` (hoặc `VLOOKUP`/`INDEX-MATCH`) — nối dữ liệu giữa các sheet.
- `NETWORKDAYS` — tính số ngày làm việc (time-to-fill).
- **Pivot Table** — tổng hợp theo kênh, phòng ban, tháng.
- Biểu đồ cột, đường, phễu.

**Ví dụ công thức time-to-fill trung bình của phòng Vận hành trong tháng 10:**
`=AVERAGEIFS(TTF_col, Dept_col, "Vận hành", Close_month_col, "2026-10")`

## 5. Kể chuyện bằng dữ liệu (Data Storytelling)

Quản lý không cần 20 biểu đồ. Họ cần **3 thông điệp + đề xuất**. Cấu trúc 1 slide báo cáo:

1. **Tiêu đề là kết luận**, không phải chủ đề: ❌ "Báo cáo tuyển dụng Q3" → ✅ "Referral rẻ hơn 60% và giữ người tốt gấp đôi job board".
2. **Một biểu đồ** chứng minh kết luận.
3. **So what?** — Điều này nghĩa là gì cho kinh doanh?
4. **Đề xuất** — cần quyết định gì, ngân sách bao nhiêu.

## 6. Chất lượng dữ liệu

Rác vào thì rác ra (garbage in, garbage out). Ba nguyên tắc:

- Mỗi yêu cầu tuyển có **mã riêng**, ngày mở/ngày đóng rõ ràng.
- **Danh mục chuẩn hoá** cho kênh, phòng ban, lý do từ chối (dùng data validation dropdown).
- Cập nhật **ngay** khi trạng thái ứng viên thay đổi, không dồn cuối tháng.

## Tóm tắt

- 4 cấp độ analytics: mô tả → chẩn đoán → dự báo → đề xuất.
- Chỉ số cốt lõi: time-to-fill, cost-per-hire, quality of hire, offer acceptance, early turnover, funnel conversion.
- Phân tích kênh theo kết quả cuối (tuyển được, ở lại), không theo số CV.
- Báo cáo = kết luận + 1 biểu đồ + ý nghĩa + đề xuất.
