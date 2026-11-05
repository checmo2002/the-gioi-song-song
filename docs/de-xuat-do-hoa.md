# Đề xuất hướng đồ hoạ chung (chờ chủ dự án chốt)

Đội 3D, 05/11/2026. Yêu cầu của chủ dự án: nhân vật, cảnh, thế giới phải ăn khớp với nhau, đẹp hơn, và **camera xoay tự do** (không khoá ở góc nghiêng).

Cảnh mẫu để xem tận mắt: artifact "Sân chùa thử đồ hoạ" (sân chùa 3D thật, bấm chuyển hướng A/B, ánh sáng theo giờ Việt Nam, 9 người viếng).

## 1. Vì sao hiện tại không ăn khớp

| | Cảnh (ảnh `img/lang/*-iso.webp`) | Nhân vật (`img/nv/npc/*.webp`) |
|---|---|---|
| Kiểu | Sa bàn: khối gọn, màu phẳng, không vân | Bán tả thực: vân vải, da như ảnh chụp |
| Màu | Cỏ xanh chuối rất tươi | Màu thật, trầm |
| Ánh sáng | Nắng gắt từ trên, bóng mềm | Render riêng với đèn khác, dán đè lên cảnh |
| Tỉ lệ | Đồ vật như đồ chơi, người chỉ cao bằng vài viên gạch | Người tỉ lệ thật |
| Góc nhìn | Một góc nghiêng cố định | 8 hướng cố định |

Nguyên nhân gốc: cảnh và người được làm ở hai nơi, hai cách chiếu sáng, hai mức chi tiết, rồi ghép lại. Có chỉnh màu từng thứ cũng không khớp được, phải cho mọi thứ đi qua **cùng một khung cảnh 3D với cùng một nguồn sáng**.

## 2. Quyết định lớn: chuyển sang 3D chạy thật trong trình duyệt

Camera xoay tự do thì cảnh không thể là ảnh vẽ sẵn nữa. Phải dựng cảnh 3D thật và vẽ ngay trên máy người xem (three.js), giống cảnh mẫu.

`docs/do-hoa.md` ghi dự án từng thử Three.js rồi bỏ, vì khi đó: nặng, khó đẹp bằng ảnh render, máy yếu giật. Lần này khác ở ba điểm:

1. **Nướng ánh sáng trong Blender.** Cảnh dựng trong Blender, tính ánh sáng gián tiếp và bóng đổ bằng Cycles, "nướng" vào vân của từng bề mặt (lightmap) rồi mới đưa lên web. Trình duyệt chỉ hiển thị, không phải tính, nên đẹp gần bằng ảnh render mà vẫn nhẹ. Người và đồ di chuyển dùng chung bầu trời và mặt trời với lúc nướng, nên đứng vào cảnh không bị lệch sáng.
2. **Có ngân sách rõ ràng cho điện thoại** (mục 5), đo được, kiểm tra tự động.
3. **Người đã có sẵn dạng 3D**: bộ 10 nhân vật riêng, đã giảm lưới còn khoảng 10 nghìn tam giác mỗi người, 4,4 MB cho cả 10, đủ 5 động tác.

Số đo cảnh mẫu (chưa nướng ánh sáng, chưa tối ưu): khoảng 105 nghìn tam giác, 37 khung hình/giây trên trình duyệt giả lập không có card đồ hoạ. Máy thật sẽ cao hơn.

## 3. Hai hướng đồ hoạ

| | A · Sa bàn ấm | B · Điện ảnh ấm (đề xuất) |
|---|---|---|
| Cảnh | Khối gọn, màu phẳng, ít chi tiết | Vật liệu thật: đá, gạch, gỗ, ngói có vân; sương xa |
| Người | Làm phẳng màu áo, da cho hợp cảnh | Giữ nguyên vân áo, da |
| Hợp với | Ảnh chuẩn làng tưởng niệm hiện tại | Hướng "bán tả thực, ánh sáng điện ảnh" đã chốt cho nhân vật |
| Nặng | Nhẹ nhất | Nặng hơn khoảng 20–30% (ảnh vân) |
| Công dựng | Ít | Nhiều hơn: phải làm vật liệu, nướng ánh sáng |

**Đề xuất B.** Bộ nhân vật mới là bán tả thực, chủ dự án đã nhiều lần muốn đồ hoạ "xịn" và không muốn kiểu hoạt hình. Hướng A buộc phải làm xấu nhân vật đi cho khớp cảnh.

## 4. Luật đồ hoạ chung (áp dụng cho mọi thứ, dù chọn A hay B)

1. **Một nguồn sáng.** Mọi cảnh, người, đồ vật dùng chung mặt trời, bầu trời, sương theo giờ thật Việt Nam (sáng, hoàng hôn, đêm). Không render riêng rồi dán.
2. **Tỉ lệ thật, 1 đơn vị = 1 mét.** Người 1,4–1,7 m, cửa 2,2 m, bậc thềm 18 cm, cột chùa 4–5 m. Ai dựng đồ mới phải đặt cạnh một nhân vật để so.
3. **Bảng màu đất ấm**, lấy từ bộ màu của trang: sơn đỏ `#9A3B2B`, đồng `#B8862F`, gỗ nâu, ngói đỏ nâu, đá kem. Cỏ và cây xanh dịu, ngả vàng, không xanh chuối.
4. **Mật độ vân đều:** khoảng 512 điểm ảnh mỗi mét cho đồ ở gần, đồ ở xa ít hơn. Không để đồ này sắc nét, đồ kia nhoè.
5. **Không viền, không tô bóng kiểu hoạt hình** (đã thử và bỏ).
6. **Nguồn asset:** người và đồ vật nhỏ làm bằng Meshy rồi chỉnh trong Blender; kiến trúc (tường, cột, mái, bậc) dựng tay trong Blender bằng bộ khối lặp lại, vì Meshy làm đường thẳng kém. Mọi file gốc ở `E:\5.2\TheGioiSongSong`, không lấy từ dự án Bản Đồ Liệt Sĩ.

## 5. Ngân sách cho điện thoại

| Mục | Giới hạn |
|---|---|
| Tam giác hiển thị cùng lúc | 150 nghìn |
| Mỗi người | 10 nghìn tam giác, ảnh vân 512 px |
| Người cùng lúc trong cảnh | 12 |
| Tải lần đầu mỗi cảnh | 8 MB (nén Draco, ảnh WebP/KTX2) |
| Bóng đổ động | 1 nguồn (mặt trời), cảnh tĩnh dùng bóng đã nướng |
| Tốc độ | 30 khung hình/giây trên điện thoại tầm trung |

Tester thêm bài đo tam giác, dung lượng, khung hình vào kiểm tra tự động.

## 6. Camera

- Xoay tự do 360°, nghiêng có giới hạn để không chui xuống đất, phóng to từ 6 đến 70 m, điểm nhìn không ra khỏi khuôn viên.
- Điện thoại: một ngón xoay, hai ngón phóng to và kéo.
- Có nút "Về góc mặc định" cho người lớn tuổi lỡ xoay lạc.
- Ở trong nhà (chính điện, gian thờ): camera không đi xuyên tường.

## 7. Kế hoạch chuyển đổi

1. Chủ dự án chốt hướng A hoặc B.
2. Đội 3D dựng lại cảnh trong Blender theo luật trên, nướng ánh sáng, xuất glb. Thứ tự: chính điện, chân núi, sảnh, làng tưởng niệm, nhà thờ, gian thờ, nhà họ. Mỗi cảnh một PR, kèm số đo ngân sách.
3. Coder viết lại phần thế giới (`js/04-01-the-gioi-nui.js`): three.js thay ảnh nền và hình 2D; lưới đi được 2D đổi sang lưới trên mặt sàn 3D; NPC dùng nhân vật 3D. three.js tải về `js/thu-vien/` theo luật bảo mật.
4. Giữ bản hiện tại chạy song song đến khi bản 3D đạt ngân sách trên điện thoại thật, rồi mới thay.
5. Khi đã thay: xoá ảnh `img/lang/*-iso.webp`, hình 2D `img/nv/`, dữ liệu lưới 2D. Theo ý chủ dự án, cảnh nào không còn file gốc thì bỏ và dựng lại, không cố giữ.
6. Cập nhật `docs/do-hoa.md` thành luật mới, bỏ dòng "Three.js đã bỏ".

## 8. Cần chủ dự án quyết

- Hướng A hay B.
- Đồng ý chuyển sang 3D chạy thật và kế hoạch ở mục 7.
- Chi phí Meshy cho đồ vật (tượng Phật, lư hương, chuông, đèn, tượng Chúa…): ước khoảng 30 credit mỗi món, chỉ làm khi được duyệt.
