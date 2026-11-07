# Chuẩn đồ hoạ

## Phong cách đã chốt

- **Góc nhìn chéo từ trên xuống (isometric)**, render từ Blender. Chuẩn là ảnh làng tưởng niệm `img/lang/lang-iso.webp`.
- **Mọi không gian dùng chung một phong cách**: đại sảnh, làng, chính điện, nhà, làng dòng họ. Không gian mới phải đặt cạnh ảnh chuẩn mà không lạc tông.
- **Nhân vật đất nặn (clay) bán chibi**, tay tròn kiểu găng, màu phẳng sạch, không vằn, không rách. Chủ dự án chốt tháng 11/2026, thay cho nhân vật tả thực cũ.
- **Đang chuyển dần sang 3D thời gian thực** (hướng 1: camera phối cảnh; đã bỏ nhoè hậu cảnh vì nhìn không rõ, bỏ bóng thời gian thực vì gây vệt đen trên nền dốc). Xong: chân núi, sảnh, nhà thờ, làng tưởng niệm, làng dòng họ (`js/26-the-gioi-3d.js`, mỗi cảnh một thư mục `img/3d/<cảnh>/`, nhân vật dùng chung `img/3d/nv/`). Còn lại mỗi cảnh một PR: nhà, chính điện. Trong lúc chuyển, cảnh chưa làm vẫn là ảnh isometric.
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
- Cảnh 3D: nướng sáng từ Blender vào texture (`img/3d/vat-*.webp`), hình khối ở `img/3d/canh.json` (glb mã hoá base64 vì bản thử trên claude.ai không phục vụ file .glb). Cây và nhân vật được chiếu sáng thời gian thực (không đổ bóng thật; bóng cây nằm sẵn trong ảnh nướng, người có bóng mềm dưới chân), màu đất nặn theo đỉnh (`img/3d/cay.json`, `img/3d/nv/*.json`).
- Quy trình một cảnh 3D: chép `song-song-<cảnh>-iso.blend` ra bản sao, chạy `tools/blender/nuong-canh-3d.py` trong Blender (dùng chung mọi cảnh, tự đọc camera ảnh iso), rồi `python3 tools/dua-canh-3d-len-web.py <thư mục nướng> <cảnh>` và thêm một mục vào `CANH` trong `js/26-the-gioi-3d.js` (camera ảnh lấy từ `thong-tin.json`).
- Cảnh trong nhà cắt tường (thờ, nhà, điện): `goc` giới hạn góc xoay để không vòng ra sau tường; `cao` dùng lưới độ cao mặt đi nướng sẵn (`thong-tin.json`) để người đứng đúng bậc, nền cao.
- Màn tải chỉ chờ cảnh sắp vào; các cảnh khác nạp ngầm sau, vào lúc chưa xong thì có màn chờ.
- Tranh 2D vẽ thêm lên cảnh (nhà dựng từ gia phả ở làng dòng họ, di ảnh trên bàn thờ) không có bản 3D: cảnh có tranh khoá camera đúng góc ảnh iso (`nghieng`, `goc`) và chiếu tranh từ toạ độ ảnh lên màn hình mỗi khung (`tranh`); di ảnh bắn tia vào tường để lấy điểm 3D (`anh`).
- Mảnh phẳng sát đất (lối đi, sân, thềm) chồng nhau thì script nướng xếp tầng vài mm, không thì chỗ chồng ra sọc đen.
- Tượng kim loại (tượng Phật) giữ chất liệu gốc, phản chiếu một phòng sáng dịu (`RoomEnvironment` của three r160, chép trong `js/vendor`).
- Tượng (mô hình nặng, có ảnh màu) xuất riêng `tuong.json`, giảm mặt, trình duyệt tự chiếu sáng như người. Nướng chung vào ảnh đồ nhỏ thì tượng vụn thành chấm.
- Ảnh nướng sáng phải **lấp vùng đen** giữa các mảnh ghép trước khi đưa lên (`python3 tools/lap-den-anh-nuong.py vao.webp ra.webp`). Không lấp thì khi thu nhỏ, màu đen tràn ra mép thành vệt răng cưa nhấp nháy.
- Không để mặt nền phẳng nằm chồng dưới bãi cỏ hoặc sườn đồi. Hai lớp sát nhau sẽ tranh nhau hiện thành vệt đen nhấp nháy, và phần bị che khi nướng ra màu đen. Xoá phần nền bị che trong Blender trước khi nướng.
- Thư viện 3D: three.js r160 chép sẵn trong `js/vendor/three/` (không tải từ CDN, để chạy được khi không có mạng ngoài).
- Máy không có GPU thật (trình vẽ phần mềm như SwiftShader) tự quay về ảnh isometric 2D. Thêm `?3d` vào địa chỉ để ép bật 3D khi thử.
- Asset miễn phí là chính. Mua asset trả phí phải hỏi chủ dự án.
- File gốc Blender ở máy chủ dự án: `E:\5.2\TheGioiSongSong`, chưa đưa vào repo.

## Lịch sử phong cách (đừng quay lại)

Đã thử rồi bỏ: hoạt hình toon, Party Animals, phim AI, Naraka, Gaussian splat (quá giật trên điện thoại). Three.js 3D thời gian thực từng bị bỏ, nay chủ dự án chọn lại với nhân vật đất nặn (tháng 11/2026).
