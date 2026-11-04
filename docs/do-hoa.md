# Chuẩn đồ hoạ

## Phong cách đã chốt

- **Góc nhìn chéo từ trên xuống (isometric)**, render từ Blender. Chuẩn là ảnh làng tưởng niệm `img/lang/lang-iso.webp`.
- **Mọi không gian dùng chung một phong cách**: đại sảnh, làng, chính điện, nhà, làng dòng họ. Không gian mới phải đặt cạnh ảnh chuẩn mà không lạc tông.
- **Nhân vật tỉ lệ người bình thường**, bán tả thực, ánh sáng điện ảnh nhẹ. **Không chibi** (người nhỏ đầu to), không dễ thương kiểu hoạt hình.
- Ánh sáng cảnh đổi theo **giờ thực Việt Nam (GMT+7)**: ngày, hoàng hôn, đêm.

## Bảng màu và chữ

- Nền kem giấy: `#FBF6EC`, `#F1E8D8`. Chữ nâu đậm: `#2B241C`, chữ phụ `#6E6253`.
- Điểm nhấn vàng đồng: `#B8862F`, đậm `#9A6E22`. Ngọc: `#4F7A6A`. Sơn mài đỏ: `#9A3B2B`.
- Màu theo khu: liệt sĩ `#8B3A1E`, thương binh `#2F5D8A`, dòng họ `#4E7A3A`, người thân `#7A4A8C`.
- **Một họ chữ duy nhất: Be Vietnam Pro.** Tiêu đề 300, tiêu đề phụ 400, nội dung 400, nhãn 600 chữ hoa giãn cách.
- Biến màu nằm ở `css/01-co-ban.css`. Dùng biến, không viết mã màu mới.

## Logo

Hai vòng tròn lồng nhau, phần giao nhau tô vàng `#B8862F`. Bản SVG có trong header của `index.html`.

## Quy trình làm asset

- Dựng bằng **Blender** (có Blender MCP), có thể dùng **Meshy AI** làm mẫu thô.
- Xuất **WebP**, đặt đúng thư mục: `img/lang/` (cảnh), `img/nv/` (nhân vật, mỗi tư thế một ảnh: đứng, đi, chắp tay, lạy, ngồi), `img/ho/` (đồ trong nhà).
- Mỗi cảnh cần thêm dữ liệu lưới đi được trong `js/04-00-du-lieu-canh.js` (cùng tên cảnh với ảnh).
- Ảnh cảnh nên dưới 400 KB để điện thoại tải nhanh.
- Asset miễn phí là chính. Mua asset trả phí phải hỏi chủ dự án.
- File gốc Blender ở máy chủ dự án: `E:\5.2\TheGioiSongSong`, chưa đưa vào repo.

## Lịch sử phong cách (đừng quay lại)

Đã thử rồi bỏ: hoạt hình toon, Party Animals, phim AI, Naraka, Three.js 3D thời gian thực. Phong cách isometric là quyết định hiện tại.
