# Bảo mật

Agent phụ trách: `.claude/agents/bao-mat.md`. Bài kiểm tra: `tests/bao-mat.py`, chạy trên GitHub mỗi PR.

## Bài kiểm tra tự động soi gì

| Phần | Nội dung |
|---|---|
| Soi mã | Khoá bí mật lọt vào repo (OpenAI, AWS, GitHub, Google, Slack, JWT, khoá riêng) |
| Soi mã | `eval`, `new Function`, `document.write`, `setTimeout` với chuỗi |
| Soi mã | Tải JS từ máy chủ ngoài (`import … from 'https://…'`, `<script src="https://…">`) |
| Soi mã | Link `target="_blank"` thiếu `rel="noopener"` |
| Soi mã | Dữ liệu người dùng (`p.name`, `.place`, `.b`, `.d`…) đi vào HTML mà không qua `esc()` |
| Thử tấn công | Cài tên người thân, quê quán, năm sinh/mất chứa mã độc vào `localStorage`, mở 12 trang mục và hồ sơ, bản đồ, nghi thức, ở 1366px và 390px. Không được có mã nào chạy, không thẻ lạ nào lọt vào trang |

## Đã sửa (04/11/2026)

- **XSS qua dữ liệu người dùng (Cao):** tên, quê, năm sinh/mất người dùng nhập được chèn thẳng vào hồ sơ, danh sách tìm kiếm, bản đồ mộ phần, ô chọn người nhận quà, cây gia phả. Hiện chỉ hại chính người nhập vì dữ liệu nằm trên máy họ, nhưng khi có máy chủ và hồ sơ công khai (Đợt 3) sẽ thành lỗi cài mã vào trang người khác. Đã lọc bằng `esc()`; bài thử có 38 chỗ hiển thị như chữ thường.
- **Thư viện tải từ máy chủ ngoài (Vừa):** morphicons tải từ jsdelivr mỗi lần mở trang. Đã đưa vào `js/thu-vien/morphicons-1.7.1/` (giấy phép MIT kèm theo).
- **Workflow GitHub:** "Kiểm tra" chỉ còn quyền đọc.
- Độ ẩm từ Open-Meteo ép về số trước khi hiển thị.

## Bên thứ ba trang đang gọi

| Dịch vụ | Gửi gì | Ghi chú |
|---|---|---|
| Google Fonts | Không có dữ liệu người dùng | Lộ địa chỉ IP người xem cho Google. Có thể tự lưu font sau |
| Open-Meteo | Toạ độ thành phố người dùng chọn (không phải vị trí thật) | Không cần khoá |
| Google Maps | Toạ độ mộ, chỉ khi người dùng bấm "Mở Google Maps" | Mở tab mới, có `noopener` |
| `window.claude` | Tên hiển thị, vị trí nhân vật trong phòng chung | Chỉ có trên bản thử claude.ai |
| Google (`accounts.google.com`, `oauth2.googleapis.com`, `openidconnect.googleapis.com`) | Trình duyệt chỉ được chuyển sang trang đăng nhập của Google (phạm vi `openid profile`). Máy chủ gửi Google `code`, `code_verifier`, Client ID và khoá bí mật (trong thân yêu cầu, không trên URL); nhận lại mã và tên người dùng Google | Chỉ khi người dùng đăng nhập gia phả dòng họ. Trang không gọi Google bằng JS nên không cần thêm vào `connect-src` |
| Zalo (`oauth.zaloapp.com`, `graph.zalo.me`) | Trình duyệt chỉ được chuyển sang trang đăng nhập của Zalo. Máy chủ gửi Zalo `code`, `code_verifier`, App ID và khoá bí mật (trong thân/đầu yêu cầu, không trên URL); nhận lại mã và tên người dùng Zalo | Chỉ khi máy chủ có khoá Zalo (hiện chưa bật) và người dùng chọn Zalo. Trang không gọi Zalo bằng JS nên không cần thêm vào `connect-src` |

## Việc cần làm khi lên hosting và máy chủ (Đợt 2, 3)

- Đặt header ở hosting: `Content-Security-Policy` (chỉ cho script cùng nguồn), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, HSTS. Chưa đặt CSP trong `index.html` vì bản thử trên claude.ai tự chèn mã của nó.
- Máy chủ: kiểm tra và lọc lại mọi dữ liệu ở phía máy chủ, không tin trình duyệt. Giới hạn độ dài tên, câu chuyện.
- Ảnh tải lên: kiểm tra đúng là ảnh, xoá thông tin GPS trong ảnh (EXIF), giới hạn dung lượng.
- Đăng nhập: không tự viết mật khẩu, dùng dịch vụ có sẵn (Supabase Auth hoặc tương đương). Giới hạn số lần thử. Gia phả dòng họ đăng nhập bằng Google (Zalo để sẵn), máy chủ chỉ cấp phiên (cookie HttpOnly) sau khi Zalo xác nhận: `docs/gia-pha-dong-ho.md`.
- Quyền riêng tư hồ sơ (việc 13): bài thử phải chứng minh người ngoài không đọc được hồ sơ "chỉ gia đình".
- Thanh toán: chỉ qua cổng thanh toán, trang không bao giờ thấy số thẻ.
- Dữ liệu trong `localStorage` hiện để dạng chữ thường trên máy người dùng. Máy dùng chung thì người sau đọc được: khi có máy chủ, chỉ giữ phiên đăng nhập trên máy.
