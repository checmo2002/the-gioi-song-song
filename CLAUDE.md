# Thế Giới Song Song — luật chung cho mọi agent

Đọc file này trước khi làm bất cứ việc gì. Sau đó đọc tài liệu trong `docs/` liên quan tới việc được giao.

## Dự án là gì

Thế Giới Song Song là một **không gian tưởng niệm trực tuyến** cho người đã khuất, anh hùng liệt sĩ và thương binh.
Người dùng chọn lối **Phật giáo** hoặc **Công giáo**, bước vào đại sảnh, rồi đi tới các khu: làng tưởng niệm, chính điện / nhà thờ (thắp nhang, thắp nến), người thân, gia phả, ký ức, cửa hàng vật phẩm.

Đây **không phải game thương mại**. Giọng điệu luôn trang nghiêm, ấm áp, tôn trọng. Chi tiết: `docs/tam-nhin.md`.

## Ngôn ngữ

- Mọi giao diện, nội dung, thông báo, commit message và báo cáo cho chủ dự án: **tiếng Việt**.
- Tên biến, tên hàm trong code: giữ cách đặt tên đang có trong file đó.

## Cấu trúc mã nguồn

```
index.html      Khung trang: toàn bộ HTML, nạp CSS và JS theo đúng thứ tự
css/NN-*.css    Giao diện, mỗi file một khu. Thứ tự số = thứ tự nạp (quan trọng vì CSS đè nhau)
js/NN-*.js      Mỗi file một tính năng, đa số là IIFE độc lập. Thứ tự số = thứ tự chạy
data/           Dữ liệu mẫu (JSON thuần trong window.SS_DATA), nạp ngay trước js/07-*
img/            Ảnh render isometric (lang/), nhân vật (nv/), đồ trong nhà (ho/)
tests/smoke.py  Kiểm tra nhanh, bắt buộc ĐẠT trước khi gộp
tests/hinh-anh.py  So ảnh chụp 6 màn × 2 cỡ với tests/anh-chuan/, bắt buộc ĐẠT
docs/           Tầm nhìn, bản đồ tính năng, chuẩn đồ hoạ, danh sách việc
```

Bản đồ file → tính năng: `docs/tinh-nang.md`.

Không có bước build. Mở bằng một web server tĩnh bất kỳ:

```
python3 -m http.server 8000
# mở http://localhost:8000
```

## Luật làm việc

1. **Mỗi việc một nhánh, mỗi nhánh một Pull Request.** Không đẩy thẳng lên `main`.
2. **Chỉ sửa file thuộc việc của mình.** Hai agent không sửa cùng một file cùng lúc. Trưởng nhóm phân file khi chia việc.
3. **Không thêm thư viện** nếu vài dòng code tự viết được. Thêm thư viện phải ghi lý do trong PR.
4. **Không đổi thứ tự** file trong `index.html` trừ khi việc yêu cầu, vì CSS và JS phụ thuộc thứ tự.
5. **Chạy `python3 tests/smoke.py` và `python3 tests/hinh-anh.py` trước khi mở PR.** Cả hai phải ĐẠT.
   Chỉ thay ảnh chuẩn khi thay đổi giao diện **đã được chủ dự án duyệt**, và ghi rõ trong PR. Ảnh chuẩn phải chụp trên máy GitHub
   (máy khác vẽ font khác): vào Actions → "Cập nhật ảnh chuẩn" → Run workflow trên nhánh của PR.
6. **Mọi thay đổi giao diện phải kèm ảnh chụp** trước/sau (máy tính 1366px và điện thoại 390px).
7. **Giữ đồ hoạ thống nhất** theo `docs/do-hoa.md`. Không tự đổi phong cách.
8. **Dữ liệu hiện là dữ liệu mẫu hư cấu**, lưu trong `localStorage` (khoá bắt đầu bằng `ss-`). Không bao giờ dùng tên, ảnh, giấy tờ của người thật làm dữ liệu mẫu.
9. **Không lấy dữ liệu liệt sĩ** từ trang web khác về (lietsi.net, thongtinlietsi.com…). Chỉ dùng dữ liệu được phép rõ ràng.

## Cần chủ dự án duyệt (agent không tự quyết)

- Thay đổi giao diện lớn, đổi phong cách đồ hoạ, đổi bố cục đại sảnh.
- Nội dung liên quan tôn giáo, nghi thức, liệt sĩ.
- Đưa lên production, đổi tên miền.
- Bất cứ việc gì tốn tiền: API trả phí, mua asset 3D, dịch vụ hosting.
- Thu thập dữ liệu cá nhân thật của người dùng.

## Định nghĩa "xong"

Một việc chỉ xong khi:
- Làm đúng yêu cầu, không thêm thứ không ai yêu cầu.
- `tests/smoke.py` ĐẠT.
- Chạy tốt trên điện thoại (390px) và máy tính.
- Có ảnh chụp nếu đụng tới giao diện.
- PR mô tả bằng tiếng Việt: làm gì, file nào, đã kiểm tra gì, còn gì chưa làm.
