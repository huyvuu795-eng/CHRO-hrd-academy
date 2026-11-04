# C&B 1: Gross – Net, bảo hiểm bắt buộc và thuế TNCN — hiểu từng đồng trong offer

Ứng viên hỏi: *"Gross 25 triệu thì em thực nhận bao nhiêu?"* Nếu bạn phải nói "để em hỏi kế toán", bạn đang bỏ lỡ cơ hội chốt offer và chưa chạm tới C&B. Tuần này bạn sẽ tự tính được.

> ⚠️ **Lưu ý quan trọng về số liệu:** Tỷ lệ đóng bảo hiểm, mức giảm trừ gia cảnh, biểu thuế và lương tối thiểu vùng **thay đổi theo từng giai đoạn**. Bài học dùng số liệu để minh hoạ **phương pháp tính**. Trước khi tư vấn chính thức cho ứng viên/nhân viên, luôn kiểm tra văn bản hiện hành hoặc hỏi bộ phận C&B/Kế toán.

## 1. Bức tranh tổng: một đồng lương đi đâu?

```
Chi phí công ty  = Lương Gross + Bảo hiểm phần công ty đóng (≈ 21,5%)
Lương Gross      = Lương Net + Bảo hiểm phần NLĐ đóng (10,5%) + Thuế TNCN
```

- **Gross**: tổng thu nhập theo HĐLĐ trước khi trừ bảo hiểm và thuế.
- **Net**: số tiền thực nhận vào tài khoản.
- **Total cost / Chi phí công ty**: con số Ban Giám đốc quan tâm khi duyệt ngân sách headcount.

## 2. Bảo hiểm bắt buộc

Tỷ lệ đóng phổ biến cho doanh nghiệp (trên tiền lương tháng đóng bảo hiểm):

| Loại | Công ty đóng | NLĐ đóng |
|---|---|---|
| BHXH (hưu trí–tử tuất, ốm đau–thai sản, TNLĐ–BNN) | 17,5% | 8% |
| BHYT | 3% | 1,5% |
| BHTN | 1% | 1% |
| **Tổng** | **21,5%** | **10,5%** |

**Căn cứ:** Luật BHXH số 41/2024/QH15 (hiệu lực 01/7/2025), Luật BHYT, Luật Việc làm và các văn bản hướng dẫn. ⚠️ Cần kiểm tra lại văn bản gốc về tỷ lệ quỹ TNLĐ–BNN (có trường hợp áp dụng 0,3%).

**Tiền lương tháng đóng BHXH** gồm mức lương, phụ cấp lương và các khoản bổ sung được thoả thuận trả thường xuyên, ổn định. Có **mức sàn** (không thấp hơn lương tối thiểu vùng) và **mức trần** (20 lần mức tham chiếu/lương cơ sở với BHXH, BHYT; BHTN có trần riêng theo lương tối thiểu vùng). ⚠️ Cần kiểm tra lại mức cụ thể tại thời điểm tính.

**Thực tế ở startup:** nhiều công ty tách lương thành "lương cơ bản thấp + phụ cấp/thưởng cao" để giảm tiền đóng bảo hiểm. Đây là vùng rủi ro: nếu các khoản đó thực chất trả cố định hằng tháng, cơ quan BHXH có thể yêu cầu truy thu. Là HR, bạn cần hiểu và cảnh báo rủi ro này.

## 3. Thuế thu nhập cá nhân (TNCN) từ tiền lương

### Các bước tính

1. **Thu nhập chịu thuế** = Tổng thu nhập − Các khoản được miễn/không chịu thuế (vd: một phần phụ cấp ăn trưa theo quy định, tiền làm thêm giờ phần cao hơn lương ngày thường…).
2. **Thu nhập tính thuế** = Thu nhập chịu thuế − Bảo hiểm bắt buộc NLĐ đóng − Giảm trừ gia cảnh.
3. **Thuế TNCN** = áp biểu thuế luỹ tiến từng phần lên thu nhập tính thuế.

### Giảm trừ gia cảnh

- Theo NQ 954/2020/UBTVQH14: **11 triệu/tháng** cho bản thân, **4,4 triệu/tháng** cho mỗi người phụ thuộc.
- Từ kỳ tính thuế 2026: điều chỉnh lên **15,5 triệu** (bản thân) và **6,2 triệu** (mỗi người phụ thuộc). ⚠️ Cần kiểm tra lại văn bản gốc (Nghị quyết của UBTVQH năm 2025).

### Biểu thuế luỹ tiến từng phần (7 bậc — áp dụng cho thu nhập từ tiền lương, tiền công)

| Bậc | Thu nhập tính thuế/tháng | Thuế suất |
|---|---|---|
| 1 | Đến 5 triệu | 5% |
| 2 | Trên 5 – 10 triệu | 10% |
| 3 | Trên 10 – 18 triệu | 15% |
| 4 | Trên 18 – 32 triệu | 20% |
| 5 | Trên 32 – 52 triệu | 25% |
| 6 | Trên 52 – 80 triệu | 30% |
| 7 | Trên 80 triệu | 35% |

⚠️ **Luật Thuế TNCN sửa đổi** được Quốc hội thông qua năm 2025 có thể thay đổi số bậc và khoảng thu nhập của biểu thuế từ năm 2026. Cần kiểm tra lại văn bản gốc trước khi áp dụng con số — **phương pháp tính luỹ tiến từng phần thì không đổi**.

## 4. Ví dụ tính đầy đủ

**Ứng viên:** Senior Content, Gross 25.000.000đ/tháng, toàn bộ là lương đóng bảo hiểm, không có khoản miễn thuế, chưa có người phụ thuộc. Dùng giảm trừ 15,5 triệu.

| Bước | Tính toán | Kết quả |
|---|---|---|
| Bảo hiểm NLĐ (10,5%) | 25.000.000 × 10,5% | 2.625.000 |
| Thu nhập tính thuế | 25.000.000 − 2.625.000 − 15.500.000 | 6.875.000 |
| Thuế bậc 1 | 5.000.000 × 5% | 250.000 |
| Thuế bậc 2 | 1.875.000 × 10% | 187.500 |
| **Thuế TNCN** | | **437.500** |
| **Net** | 25.000.000 − 2.625.000 − 437.500 | **21.937.500** |
| Bảo hiểm công ty (21,5%) | 25.000.000 × 21,5% | 5.375.000 |
| **Chi phí công ty** | 25.000.000 + 5.375.000 | **30.375.000** |

Nếu ứng viên có **1 người phụ thuộc** đã đăng ký: thu nhập tính thuế = 6.875.000 − 6.200.000 = 675.000 → thuế = 33.750đ → Net ≈ 22.341.250đ.

## 5. Offer theo Net — cẩn thận!

Ứng viên đòi "Net 20 triệu". Bạn phải **quy đổi ngược Net → Gross**, và nhớ: nếu sau này giảm trừ gia cảnh hoặc biểu thuế thay đổi, ai chịu phần chênh lệch? Thoả thuận Net khiến công ty gánh rủi ro thay đổi thuế/bảo hiểm. Thực hành tốt: **ký HĐ theo Gross**, chỉ dùng Net để tham khảo khi đàm phán.

## 6. Ứng dụng ngay trong tuyển dụng

- Khi trao đổi lương, luôn hỏi rõ: *"Mức anh/chị đang nhận là Gross hay Net? Có những khoản thưởng nào, trả cố định hay theo hiệu suất?"*
- So sánh offer giữa các công ty bằng **tổng thu nhập năm** (lương × 12 + thưởng + phúc lợi quy đổi), không chỉ lương tháng.
- Khi trình ngân sách headcount, dùng **chi phí công ty** chứ không phải Gross.

## Tóm tắt

- Chi phí công ty = Gross + ~21,5%; Net = Gross − 10,5% − thuế TNCN.
- Thuế TNCN: thu nhập chịu thuế → trừ bảo hiểm & giảm trừ gia cảnh → áp biểu luỹ tiến từng phần.
- Số liệu thay đổi theo thời kỳ — học phương pháp, kiểm tra số liệu hiện hành trước khi tư vấn.
- Ký HĐ theo Gross; tách lương để "né" bảo hiểm là rủi ro truy thu.
