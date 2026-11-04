# Danh sách việc

Trưởng nhóm chuyển mỗi mục thành một GitHub Issue trước khi giao. Thứ tự là thứ tự ưu tiên đề xuất; chủ dự án có thể đổi.

## Đợt 1 — Dọn nền móng (đội: trưởng nhóm, coder, tester)

1. ~~Tách `js/07-loi-chinh.js`~~ — xong: thành 13 file `js/07-NN-*.js`. Còn lại: gom tên dùng chung vào một đối tượng `SS` để bớt phụ thuộc thứ tự nạp (làm sau, khi có kiểm tra hình ảnh tự động ở việc 5).
2. ~~Tách `js/04-the-gioi-nui.js`~~ — xong: 108 KB dữ liệu cảnh ra `js/04-00-du-lieu-canh.js`, phần chạy còn 27 KB ở `js/04-01-the-gioi-nui.js`.
3. ~~Tách `css/27-dai-sanh.css` và `css/26-trang-ca-nhan.css`~~ — xong: thành `css/27-01…09-*.css` và `css/26-01…05-*.css`. Lưu ý: hai file gốc là các lớp sửa chồng lên nhau theo thời gian, nên một khu (ví dụ thế giới núi) có thể có kiểu ở vài file; thứ tự nạp vẫn quyết định.
4. ~~Đưa dữ liệu mẫu ra file riêng~~ — xong: `data/du-lieu-mau.js` (JSON thuần trong `window.SS_DATA`, nạp đồng bộ để không đổi thứ tự khởi động). Còn lại: làng mẫu họ Phạm trong `20-lang-rieng.js`.
5. **Kiểm tra hình ảnh tự động:** chụp các màn chính, so với ảnh chuẩn để phát hiện vỡ giao diện.
6. **Sắp xếp lại bố cục cho dễ dùng** (ưu tiên của chủ dự án): rà từng màn, đề xuất bố cục mới bằng ảnh, chờ duyệt rồi mới làm.

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
16. Hoàn thiện đại sảnh chân núi và lối lên đỉnh núi thờ.
17. Video giới thiệu và hoạt cảnh mở cửa hai lối.
18. Nhân vật AI người đã khuất: thiết kế trước (dữ liệu, an toàn, giọng nói, chi phí), chủ dự án duyệt rồi mới làm.
