# Hướng đồ hoạ chung: sa bàn xoay tự do (chờ chủ dự án chốt)

Đội 3D, 05/11/2026.

## Chủ dự án đã chọn

- **Kiểu đồ hoạ:** đúng như cảnh chân núi hiện tại (`img/lang/chan-iso.webp`). Đó là kiểu sa bàn: khối gọn, cây tròn mềm, sân gạch đỏ, màu phẳng có vân nhiễu nhẹ, nắng ấm, bóng mềm. Mọi cảnh, đồ vật, nhân vật đều theo kiểu này.
- **Camera xoay tự do,** không khoá một góc nghiêng.
- Đã thử và bị từ chối: cảnh 3D dựng mới bằng code với vật liệu tả thực ("Sân chùa thử đồ hoạ"). Không đi hướng đó.

Bản thử đã làm: artifact "Chân núi xoay tự do". Đây là chính cảnh chân núi xuất từ file Blender gốc, giữ nguyên khối, màu, vân, hướng nắng, nay xoay 360° và nghiêng được, có 9 người viếng.

## Vì sao làm được mà không đổi kiểu

Cảnh sa bàn chỉ có khối đơn giản với 33 vật liệu màu. Mỗi vật liệu chỉ là màu đơn, hoặc vân nhiễu pha giữa hai màu. Trình duyệt dựng lại y hệt được:

- Xuất file Blender ra glb bằng `tools/xuat-canh.py`, giữ tên vật liệu.
- Trên web, mỗi vật liệu lấy đúng hai màu và độ thô từ file Blender. Vân nhiễu viết lại bằng shader.
- Gộp khối theo vật liệu: cảnh chân núi 1.445 khối còn khoảng 50 lượt vẽ.
- Tông màu AgX giống Blender, cùng hướng và màu nắng.

Số đo bản thử chân núi: khoảng 326 nghìn tam giác, file cảnh 0,8 MB, 35 khung hình/giây trên máy ảo không card đồ hoạ.

## File gốc các cảnh

Ở `C:\Users\Admin\Documents\SongSong-lang\` trên máy chủ dự án: `song-song-{sanh,chan,dien,tho,lang,nha,ho}-iso.blend`, `song-song-cong-phat.blend`, `song-song-cong-cg.blend`. Nên chép về `E:\5.2\TheGioiSongSong\canh\` cho cùng chỗ với bộ nhân vật.

## Luật đồ hoạ chung

1. **Một kiểu sa bàn:** khối gọn, góc bo nhẹ, màu phẳng hoặc vân nhiễu hai màu. Không ảnh vân chụp thật, không viền, không tô bóng kiểu hoạt hình.
2. **Bảng màu theo file chân núi:** cỏ `co` và lá `la0/la1/la2` xanh dịu, gạch `gach` đỏ đất, ngói `ngoi`, tường `tuongTrang` kem, sơn `son` đỏ thẫm, đồng `dongL`. Đồ mới dùng lại các vật liệu này trước khi tạo màu mới.
3. **Một nguồn sáng:** nắng ấm như đèn "nang" trong file chân núi, đổi theo giờ thật Việt Nam (sáng, hoàng hôn, đêm). Người và cảnh chung đèn.
4. **Tỉ lệ:** cảnh theo mét thật (cửa 2,6 m). Người vẽ to hơn thật 1,6 lần cho dễ nhìn trên sa bàn, như hình nhân vật hiện tại.
5. **Nhân vật hợp cảnh:** bộ 10 nhân vật riêng được làm phẳng màu và bỏ độ bóng khi đặt vào cảnh. Nếu chủ dự án thấy vẫn lệch, làm lại bộ người theo kiểu sa bàn bằng Meshy (cần duyệt chi phí).
6. **Kim loại:** độ kim loại tối đa 0,35, để đồ đồng không bị đen trên web.

## Camera

- Mặc định là kiểu sa bàn (nhìn chéo, không méo phối cảnh), giống ảnh cũ. Có thêm chế độ phối cảnh để nhìn gần.
- Xoay 360°, nghiêng từ gần thẳng đứng tới gần ngang, phóng to 0,5–8 lần, điểm nhìn không ra khỏi khuôn viên.
- Điện thoại: một ngón xoay, hai ngón phóng to và kéo.
- Nút "Về góc mặc định" cho người lớn tuổi lỡ xoay lạc.

## Ngân sách cho điện thoại

| Mục | Giới hạn |
|---|---|
| Tam giác cùng lúc | 350 nghìn (cây chiếm nhiều nhất; vượt thì giảm lưới cây) |
| Lượt vẽ | 80 |
| Tải lần đầu mỗi cảnh | 3 MB cảnh + phần người |
| Tốc độ | 30 khung hình/giây trên điện thoại tầm trung |

## Kế hoạch

1. Chủ dự án chốt hướng này.
2. Coder viết lại phần thế giới (`js/04-01-the-gioi-nui.js`): three.js (tải về `js/thu-vien/`) thay ảnh nền và hình 2D; lưới đi được 2D đổi sang mặt sàn 3D; NPC và người chơi dùng nhân vật 3D; nút bấm trên bản đồ gắn vào vị trí 3D.
3. Đội 3D xuất lần lượt 7 cảnh: chân núi, chính điện, sảnh, làng, nhà thờ, gian thờ, nhà họ. Mỗi cảnh một PR, kèm số đo ngân sách.
4. Giữ bản ảnh 2D chạy song song đến khi bản 3D mượt trên điện thoại thật, rồi xoá `img/lang/*-iso.webp`, `img/nv/`, dữ liệu lưới 2D.
5. Cập nhật `docs/do-hoa.md`: giữ kiểu sa bàn làm chuẩn, bỏ dòng "Three.js đã bỏ", ghi rõ lần này là xuất chính cảnh Blender chứ không dựng mới.
