# Danh sách việc

Trưởng nhóm chuyển mỗi mục thành một GitHub Issue trước khi giao. Thứ tự là thứ tự ưu tiên đề xuất; chủ dự án có thể đổi.

## Đợt 1 — Dọn nền móng (đội: trưởng nhóm, coder, tester)

1. ~~Tách `js/07-loi-chinh.js`~~ — xong: thành 13 file `js/07-NN-*.js`. Còn lại: gom tên dùng chung vào một đối tượng `SS` để bớt phụ thuộc thứ tự nạp (làm sau, khi có kiểm tra hình ảnh tự động ở việc 5).
2. ~~Tách `js/04-the-gioi-nui.js`~~ — xong: 108 KB dữ liệu cảnh ra `js/04-00-du-lieu-canh.js`, phần chạy còn 27 KB ở `js/04-01-the-gioi-nui.js`.
3. ~~Tách `css/27-dai-sanh.css` và `css/26-trang-ca-nhan.css`~~ — xong: thành `css/27-01…09-*.css` và `css/26-01…05-*.css`. Lưu ý: hai file gốc là các lớp sửa chồng lên nhau theo thời gian, nên một khu (ví dụ thế giới núi) có thể có kiểu ở vài file; thứ tự nạp vẫn quyết định.
4. ~~Đưa dữ liệu mẫu ra file riêng~~ — xong: `data/du-lieu-mau.js` (JSON thuần trong `window.SS_DATA`, nạp đồng bộ để không đổi thứ tự khởi động). Còn lại: làng mẫu họ Phạm trong `20-lang-rieng.js`.
5. ~~Kiểm tra hình ảnh tự động~~ — xong: `tests/hinh-anh.py` chụp 6 màn (cổng, thế giới, người thân, tiểu sử, cửa hàng, gia đình) ở 1366px và 390px, so với `tests/anh-chuan/`, chạy trên GitHub mỗi PR.
6. ~~Sắp xếp lại bố cục cho dễ dùng~~ — xong phần màn thế giới theo **hướng A** (chủ dự án chọn 04/11/2026): một thanh điều hướng có chữ, một nút "Bày tỏ", ô trực tuyến gọn và chỉ hiện từ 2 người, sửa tên cảnh và nhãn chạm mép. Kiểu nằm ở `css/28-bo-cuc-huong-a.css`.

## Đợt 2 — Đưa lên mạng thật (thêm agent vận hành)

7. Chọn hosting tĩnh (Cloudflare Pages / GitHub Pages / Vercel) và tên miền. *Cần chủ dự án duyệt.*
8. Môi trường staging tự cập nhật theo nhánh `main`, production chỉ cập nhật khi chủ dự án duyệt.
9. Giám sát lỗi và thời gian tải (Sentry hoặc tương đương), báo cáo hằng ngày.

## Đợt 3 — Backend (thêm kiến trúc sư, coder backend, kiểm duyệt nội dung)

10. Đăng nhập thật bằng số điện thoại / email (Supabase hoặc tương đương). *Cần duyệt chi phí.*
11. Lưu hồ sơ, gia phả, ký ức lên máy chủ; ảnh lên kho lưu trữ. Sao lưu hằng ngày.
12. Thay `window.claude` room bằng dịch vụ thời gian thực riêng (thấy người khác online).
13. Quyền riêng tư theo hồ sơ: công khai / chỉ gia đình / riêng tư.
14. Thanh toán thật cho ví nén và gói chăm mộ. *Chờ chủ dự án chốt mô hình kinh doanh.*

## Đợt 4 — Đồ hoạ, video, nhân vật AI (thêm đội 3D, video, nhân vật AI)

15. Render lại các không gian còn lệch phong cách isometric theo `docs/do-hoa.md`.
15b. **Camera xoay vòng** (chủ dự án muốn có): mỗi cảnh hiện là một ảnh render một góc, nên muốn xoay phải render thêm góc nhìn (ví dụ 4 góc × 7 cảnh) kèm lưới đi được cho từng góc. Làm cùng đợt render lại.
16. Hoàn thiện đại sảnh chân núi và lối lên đỉnh núi thờ.
17. Video giới thiệu và hoạt cảnh mở cửa hai lối.
17b. ~~Hình riêng cho NPC~~ — xong: bộ 10 nhân vật riêng của Song Song (ông áo nâu, bà cụ, chị bà ba, phụ nữ áo tím, cô áo dài, cựu chiến binh, thanh niên, học sinh, sư thầy, nữ tu), tạo bằng Meshy (chủ dự án duyệt chi phí 04/11/2026), file gốc `E:\5.2\TheGioiSongSong\nhan-vat\nhan-vat.blend`. Dựng bằng `tools/dung-nhan-vat.py`, render bằng `tools/render-npc.py`.
18. Nhân vật AI người đã khuất: thiết kế trước (dữ liệu, an toàn, giọng nói, chi phí), chủ dự án duyệt rồi mới làm.
