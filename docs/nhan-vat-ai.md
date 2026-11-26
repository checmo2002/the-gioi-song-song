# Nhân vật AI của người đã khuất: bản thiết kế chờ duyệt

Trạng thái: **bản đề xuất, chưa làm gì.** Chủ dự án duyệt các mục ở phần "Cần chủ dự án quyết" thì mới bắt đầu.
Việc này tốn tiền (API trả phí) và đụng tới nội dung về người đã khuất, nên theo `CLAUDE.md` agent không được tự quyết.

## Ý tưởng gốc (từ `docs/tam-nhin.md`)

- Người đã khuất có một nhân vật sống trong thế giới song song, kiểu Sims / inZOI.
- Tương tác **chỉ bằng bấm chuột**.
- Gia đình kể về người thân để AI học. Nhân vật "lớn dần" theo mức tương tác và có giọng nói.
- Nhà của nhân vật dùng cùng đồ hoạ và cùng giờ thực Việt Nam với trang chính.

## Nguyên tắc (đề xuất)

1. **Nhân vật là một ký ức được gia đình kể lại, không phải người đã khuất sống lại.**
   - Trên mọi màn có dòng nhỏ cố định: "Nhân vật được dựng từ lời kể của gia đình".
   - Nhân vật không bao giờ nói mình là người thật, không hứa hẹn, không nói về "bên kia".
2. **Chỉ nói điều gia đình đã kể.**
   - Không bịa kỷ niệm, không đoán chuyện riêng.
   - Khi không biết, nhân vật nói là chưa được kể, và mời gia đình kể thêm.
3. **Chỉ gia đình mới tạo được.**
   - Chỉ trưởng họ, hoặc người được trưởng họ giao, mới tạo nhân vật cho một người trong gia phả dòng họ (`docs/gia-pha-dong-ho.md`).
   - Thành viên khác chỉ gửi lời kể, chờ duyệt như đề xuất gia phả.
4. **Không làm cho liệt sĩ, anh hùng, nhân vật lịch sử.**
   - `tam-nhin.md` đã ghi: không giả lời nói của nhân vật lịch sử có thật.
   - Liệt sĩ là chủ đề cần chủ dự án duyệt.
   - Đề xuất: giai đoạn đầu chỉ làm cho người thân thường trong gia phả. Nhân vật của liệt sĩ chỉ hiện ảnh, tiểu sử và lời tưởng niệm của gia đình, không trò chuyện.
5. **Giữ cho người dùng lành mạnh.**
   - Giới hạn số lượt mỗi ngày.
   - Không có thông báo kéo người dùng quay lại kiểu "bà nhớ con".
   - Nếu người dùng chọn những câu cho thấy đau buồn kéo dài, nhân vật nhẹ nhàng gợi ý nói chuyện với người thân, và có đường dẫn tới đường dây hỗ trợ.
6. **Dữ liệu là của gia đình.**
   - Xoá được hết: lời kể, nhân vật, giọng nói.
   - Không dùng lời kể để huấn luyện mô hình.
   - Không chia sẻ cho dòng họ khác.

## Người dùng làm gì (chỉ bấm, không gõ tự do)

Không cho gõ tự do. Như vậy vừa đúng ý "chỉ bấm chuột", vừa chặn được người dùng ép AI nói bậy, nói sai về người đã khuất.

- **Ghé thăm nhà:** nhân vật làm việc thường ngày theo giờ Việt Nam thật, ví dụ sáng tưới cây, chiều pha trà, tối ngồi hiên. Phần này chạy theo lịch, không gọi AI.
- **Bấm vào nhân vật** mở 3–4 lựa chọn. Mỗi lần bấm là một lượt gọi AI:
  - "Kể con nghe chuyện ngày xưa": nhân vật kể lại một kỷ niệm gia đình đã kể, bằng giọng ấm áp.
  - "Hôm nay con…": chọn một trong các câu có sẵn như "đi thi", "cưới vợ", "nhớ bà". Nhân vật đáp lại phù hợp với tính cách gia đình đã mô tả.
  - "Dặn dò": một lời khuyên rút từ những câu cửa miệng gia đình đã ghi.
- **"Lớn dần":** càng nhiều lời kể được duyệt thì nhân vật càng có nhiều chuyện để kể, và mở thêm hoạt động trong nhà như góc ảnh hay góc món ăn. Không có điểm số hay cấp độ kiểu game.

## Dữ liệu

| Dữ liệu | Ai nhập | Lưu ở đâu |
|---|---|---|
| Hồ sơ: tên gọi trong nhà, cách xưng hô, tính cách (chọn từ danh sách), câu cửa miệng, món ăn, nghề | Trưởng họ / người được giao | D1, bảng mới `nhan_vat` gắn với người trong cây gia phả |
| Lời kể (mỗi chuyện ≤ 1000 chữ) | Thành viên dòng họ, có duyệt | D1, bảng `loi_ke` |
| Giọng nói (nếu chủ dự án đồng ý, xem dưới) | Trưởng họ tải lên, kèm xác nhận quyền | Lưu ở nhà cung cấp giọng nói, không lưu tệp gốc |

Khi trả lời, máy chủ chỉ gửi cho mô hình hồ sơ và một vài lời kể liên quan, không gửi tên thật đầy đủ, ngày giỗ hay số điện thoại.

## An toàn

- **Chặn đầu vào:** người dùng không gõ được gì. Lời kể là chữ do gia đình nhập, nhưng có duyệt và được đưa vào lời nhắc như **dữ liệu**, không phải lệnh. Điều này giúp giảm rủi ro chèn lệnh vào lời nhắc.
- **Kiểm đầu ra:** câu trả lời ngắn (≤ 120 chữ). Máy chủ lọc từ cấm có sẵn (`tenGoi` / `XAU`). Mỗi câu có nút "Câu này không đúng", bấm vào thì câu đó bị ẩn và báo cho trưởng họ.
- **Lưu đệm:** cùng một lựa chọn trong cùng ngày trả lại câu cũ. Cách này vừa đỡ tiền, vừa giữ nhân vật nhất quán.
- **Giới hạn:** mỗi tài khoản 20 lượt mỗi ngày, mỗi dòng họ 300 lượt mỗi ngày (con số đề xuất).
- **Trẻ em:** nhân vật của "thiên thần nhỏ" (trẻ mất sớm) **không làm trò chuyện**, chỉ có góc tưởng niệm. Đây là chủ đề rất đau, chủ dự án quyết.

## Giọng nói

Có ba mức, đề xuất làm mức 1 trước:

1. **Không có giọng**, chỉ chữ hiện dần. Không tốn thêm tiền.
2. **Giọng đọc tiếng Việt có sẵn** (TTS), chọn theo giới và vùng miền (Bắc, Trung, Nam). Có tốn tiền theo số ký tự, cần báo giá nhà cung cấp trước khi chọn.
3. **Nhân bản giọng thật từ đoạn ghi âm cũ.** Rủi ro cao nhất:
   - cần xác nhận gia đình có quyền với đoạn ghi âm;
   - dễ gây sốc cho người nghe;
   - giọng có thể bị lạm dụng.
   Đề xuất **không làm** ở giai đoạn đầu.

## Chi phí ước tính (giá API Claude, xem lúc 27/11/2026)

Giả sử mỗi lượt gửi khoảng 3.000 token hồ sơ và lời kể (lưu đệm lời nhắc), 200 token câu hỏi và 150 token trả lời:

| Mô hình | Giá (USD / triệu token: vào / ra / đọc đệm) | Mỗi lượt | 1.000 người × 5 lượt/ngày × 30 ngày |
|---|---|---|---|
| Claude Haiku 5.5 | 0,10 / 0,50 / 0,01 | ~0,000125 USD (~3 đồng) | ~19 USD/tháng |
| Claude Sonnet 5.5 | 2 / 10 / 0,10 | ~0,0022 USD (~55 đồng) | ~330 USD/tháng |

- Đề xuất dùng **Haiku** vì câu trả lời ngắn và đã có khuôn. Lưu đệm câu trả lời trong ngày sẽ làm chi phí thấp hơn nữa.
- Chưa tính phí ghi đệm lần đầu và phí giọng nói.
- Cần một khoá API trả phí. Khoá cất trong biến môi trường bí mật trên Cloudflare, do chủ dự án tự dán.
- Nguồn giá: https://platform.claude.com/docs/en/about-claude/pricing

## Kỹ thuật (tóm tắt)

- **Máy chủ:** thêm vào `functions/api` các lệnh:
  - `POST /api/nhan-vat/<id>/noi` với `{chon: 'chuyen-xua'|'hom-nay'|'dan-do', y: <mã câu có sẵn>}`;
  - các lệnh quản lý hồ sơ và lời kể, theo đúng quyền của dòng họ.
- **Gọi mô hình:**
  - lời nhắc hệ thống cố định, nêu nguyên tắc ở trên;
  - hồ sơ và lời kể nằm trong thẻ dữ liệu;
  - trả về JSON gồm câu nói và hoạt động gợi ý.
- **Trang:** nhà nhân vật là một cảnh 3D mới, theo `docs/do-hoa.md` và sổ tay mỹ thuật. Nhân vật dùng hệ nhân vật hiện có (`js/26`).
- **Kiểm thử:** thêm vào `tests/may-chu.py` (quyền dòng họ, giới hạn lượt) và `tests/bao-mat.py` (lời kể chứa lệnh chèn).

## Các bước làm (sau khi duyệt)

1. Hồ sơ và lời kể, chưa có AI: gia đình nhập, nhà nhân vật hiện các lời kể như một cuốn sổ. Không tốn tiền.
2. Thêm AI (chỉ chữ) cho một dòng họ thử. Chủ dự án tự dùng thử một tuần.
3. Mở cho mọi dòng họ, có giới hạn lượt.
4. Giọng nói (mức 2) nếu chủ dự án muốn và đã có báo giá.

## Cần chủ dự án quyết

1. Có làm tính năng này không, và chấp nhận chi phí API khoảng bao nhiêu mỗi tháng?
2. Nhân vật xưng hô thế nào:
   - (a) xưng như người thân ("bà", "ông"), có dòng ghi chú là nhân vật dựng từ lời kể; hoặc
   - (b) kể ở ngôi thứ ba ("Bà thường kể…").
   Ngôi thứ ba an toàn hơn về cảm xúc.
3. Liệt sĩ và trẻ mất sớm: đồng ý **không** làm trò chuyện không?
4. Giọng nói: dừng ở mức 1, hay làm mức 2?
5. Lối Phật giáo / Công giáo: nhân vật có nhắc tới tín ngưỡng (ví dụ "bà vẫn đi chùa rằm") không? Nếu có thì chỉ được nhắc theo lời gia đình kể.
