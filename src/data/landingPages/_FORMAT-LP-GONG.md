# FORMAT LP BÁN GỌNG — chuẩn viết nội dung (SONi)

Tài liệu này là **khuôn viết nội dung** cho mọi landing page bán gọng kính.
Khung (`LandingPageContent` trong `src/types/landingPage.ts`) đã chuẩn theo phễu skill *trangbanhang* — **không sửa khung**, chỉ viết đúng nội dung từng field theo hướng dẫn dưới.

> **Bài mẫu vàng:** `gng-bulsajo-hai-cu.ts`. Khi làm mẫu gọng mới: copy file đó, giữ cấu trúc, thay nội dung theo gọng mới + theo các quy tắc dưới đây.

---

## 4 nguyên tắc gốc (vi phạm là hỏng cả LP)

1. **Viết theo TRIGGER/nhu cầu, KHÔNG khoá vào một nghề.**
   Sai: dựng cả story quanh "nhân viên văn phòng họp với sếp" → loại bỏ khách khác.
   Đúng: bám **nỗi đau chung mọi người đeo kính đều thấy** (gọng nặng hằn mũi, đau tai, kính dày dìm mặt, tối tháo ra hai vệt đỏ). Cảnh cụ thể thì được, nhưng phải là cảnh **ai cũng từng gặp**, không gắn vào một nghề/khu vực/tuổi.

2. **TUYỆT ĐỐI không bịa số.** Không bịa rating sao, % đơn, "đã bán X nghìn", "bền gấp 3 lần", "chịu rơi 1m" nếu không có bằng chứng thật.
   - `proof.stats` chỉ dùng **sự thật kiểm chứng được**: trọng lượng (20g), chất liệu (Titanium IP), kiểu dáng (hai cầu), cam kết (tư vấn miễn phí / đổi trả / bảo hành). KHÔNG để rating trung bình bịa.
   - `testimonials`: nếu chưa có review thật → để `isPlaceholder: true`, gắn nhãn `[Tên khách hàng]`, viết `placeholderNote` rõ ràng. Thay bằng review + ảnh thật khi đủ.
   - Badge gói giá: dùng câu trung thực ("SONi khuyên dùng", "Tiết kiệm 510k" nếu đúng phép tính) — KHÔNG "chiếm 70% đơn" nếu chưa đo thật.

3. **Giọng SONi: ấm, chảy liền mạch, không lên gân.**
   - SONi tự xưng **"bên mình"**; gọi khách **"bạn"**. Không dùng "chúng tôi/quý khách" xa cách.
   - Câu kể như đang nói chuyện thật, không chẻ vụn thành khẩu hiệu cụt.
   - CTA cuối nói từ phía khách, ngôi "mình": *"Mình muốn đổi sang [Tên gọng]"*.

4. **Lồng cơ chế THẬT = uy tín thật.** Giải thích *vì sao* (vd: gọng nặng dồn trọng lượng lên 2 điểm tựa mũi nên hằn; đệm cứng biến dạng sau vài tháng nên tuột). Đây là authority thật, không phải credential giả. Tuyệt đối không vẽ bằng cấp/giải thưởng giả.

---

## Viết từng field

| Field | Viết gì | Ghi nhớ |
|---|---|---|
| `metaTitle` / `metaDescription` | Tên gọng + lợi ích cốt lõi + 1 cam kết khử rủi ro. ~60 / ~155 ký tự. | Chỉ nêu cam kết/khuyến mãi CÓ THẬT |
| `hero.title` + `titleHighlight` | Lợi ích dẫn đầu: "Cùng khuôn mặt đó, đổi sang X — [nhẹ hơn / thoải mái / sáng mặt hơn]". Phần highlight = cụm lợi ích. | Không nêu tính năng khô (titanium) ở title — nêu *kết quả* |
| `hero.subtitle` | 1–2 câu mở rộng lợi ích + nhắc cơ chế (vì sao tin) + cảm giác sau khi dùng. | |
| `hero.ctaMicrocopy` | Chuỗi khử ma sát: Freeship · COD · Bảo hành · Tư vấn miễn phí. | |
| `hero.trustStrip` | 4 gạch đầu dòng = 4 lợi ích/cam kết theo trigger. | |
| `story.title` | Câu **villain reframe** gỡ tự trách. Có thể bọc `*...*` để in nghiêng 1 cụm. | "Không phải bạn kém sắc đi. Là cặp kính đang dìm bạn." |
| `story.intro` | 2 câu dẫn cảnh, giọng ấm. | |
| `story.breakingPoint` | **Một** khoảnh khắc đau/ngượng đỉnh điểm làm hook — cảnh **phổ quát** (xem ảnh chụp chung, soi gương tối, tháo kính hằn đỏ). | KHÔNG cảnh gắn nghề |
| `story.timeline` | Nỗi đau leo thang theo mốc (Sáng → Trưa → Chiều → Tối). 1 mốc đặt `isClimax: true`. Mỗi mốc 1 chi tiết giác quan cụ thể. | Mốc dùng "Sáng/Trưa/Chiều/Tối", không gắn lịch công sở |
| `story.villain` | `myth` = phủ nhận các lý do tự trách; `truth` = chỉ thủ phạm thật (cơ chế: trọng lượng/đệm cứng). | Cơ chế thật |
| `story.twist` | Cú lật: nhận ra qua người khác đã đổi gọng. | |
| `solution.items` (4) | Mỗi item: `featureLabel` (tính năng, IN HOA nhỏ) → `benefitTitle` (LỢI ÍCH) → `mechanism` (cơ chế ngắn vì sao đạt lợi ích). Mỗi item gỡ 1 nỗi đau đã nêu ở story. | Lợi ích trước tính năng |
| `proof.stats` (4) | **Chỉ sự thật**: trọng lượng / chất liệu / kiểu dáng / cam kết miễn phí. | KHÔNG rating bịa |
| `proof.testimonials` | Review thật + ảnh. Chưa có → `isPlaceholder: true` + `[Tên khách hàng]`. | |
| `proof.placeholderNote` | Nói rõ đang là mẫu, sẽ thay bằng thật. | |
| `guarantees.items` (4) | Đảo rủi ro sang người bán: tư vấn miễn phí · đổi trả · bảo hành · COD. Nêu đúng điều kiện thật (đổi trả chỉ áp dụng gói gọng riêng). | |
| `pricing` | **3 gói neo giá** (xem dưới). Gói giữa `highlighted: true`. | |
| `faq.items` | 6–7 câu khách thật hay hỏi: hợp mặt không / dễ gãy không / đổi trả–bảo hành / nhìn khác không / bao lâu nhận / thử trước trả tiền / lắp được tròng gì. | |
| `finalCta` | **Future fork**: 6 tháng nữa 2 ngả — không đổi vs đã đổi. CTA ngôi "mình". | |

---

## Quy tắc 3 gói giá (anchor pricing)

Theo tri thức trong não (định giá 3-tier): khách hay chọn **gói giữa**, gói 3 để neo cho gói giữa trông hợp lý.

- **Gói 1 — Chỉ gọng**: rẻ nhất, cho người đã có tròng. `preset: { type: 'no-lens' }`.
- **Gói 2 — Gọng + Tròng cận** ★ `highlighted: true`: **đích bán**. Badge trung thực ("SONi khuyên dùng"). `preset` trỏ nhóm tròng phù hợp (vd `blue`).
- **Gói 3 — Trọn bộ cao cấp**: tròng cao cấp + phụ kiện, neo giá. Phải là gói **có thật**, không phải mồi ảo.

`footnote`: nhắc gói có tròng không đổi trả 7 ngày (đã cắt theo độ) → mời gửi ảnh tư vấn trước.

---

## Checklist trước khi xuất 1 LP gọng mới

- [ ] Story không gắn nghề/khu vực cụ thể — đọc lại có khoá vào "dân văn phòng" không?
- [ ] `proof.stats` không có số/rating nào bịa.
- [ ] Review chưa thật → đã `isPlaceholder` + có `placeholderNote`.
- [ ] Badge/giá không có % hay "bán chạy" bịa.
- [ ] Giọng "bên mình / bạn", ấm, không chẻ vụn.
- [ ] Mỗi `solution.item` gỡ đúng 1 nỗi đau đã nêu ở story.
- [ ] Mọi cam kết (đổi trả, bảo hành, freeship, giảm giá) đều CÓ THẬT.
- [ ] `productId` + `slug` + `preset.categoryId` đúng với sản phẩm trên hệ thống.

---

*Trình bày/typography do `src/components/landing/LandingPageView.tsx` lo (không sửa per-LP). Font: Be Vietnam Pro — chuẩn tiếng Việt, giữ nguyên.*
