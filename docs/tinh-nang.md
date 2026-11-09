# Bản đồ tính năng

Tách từ bản artifact "Thế Giới Song Song" ngày 04/11/2026. Hành vi giữ y như bản gốc.

## Luồng chính

1. **Màn chờ** → **sảnh chọn lối** (`#gate`): nhân vật đi tới cổng Phật giáo hoặc Công giáo.
2. **Phi thăng** (hiệu ứng chuyển cảnh) → **Đại sảnh** (`#hall`) với thế giới 3D (bản 2D đã bỏ).
3. Từ đại sảnh: **thế giới núi** (`#world`, chân núi → lên núi → chính điện / nhà thờ), làng tưởng niệm, làng riêng của gia đình, đài liệt sĩ.
4. Các **trang mục** mở riêng, xếp theo 3 nơi: Chùa · Người thân · Gia đình.

## Các trang mục (`js/06-trang-muc.js`)

| Mục | Phần tử | Nội dung |
|---|---|---|
| Thắp nhang tưởng niệm | `#thap-nhang` | Mở nghi thức trong chính điện / nhà thờ |
| Người thân | `#nguoi-than` | Danh sách người đã khuất, chỉ hỏi đăng nhập khi cần lưu |
| Tiểu sử | `#ho-so` | Hồ sơ kiểu "Living Memories" |
| Ký ức | `#ky-uc` | Vòng ký ức ảnh/video, lời nhắn, câu chuyện, gia phả |
| Mộ phần | `#ban-do` | Bản đồ Việt Nam, vị trí mộ và quê quán |
| Nơi an nghỉ | `#ngoi-nha`, `#cong-vien` | Ngôi nhà tưởng niệm, làng |
| Gửi thiệp | `#thiep` | Thiệp tưởng nhớ |
| Thêm người thân | `#hanh-trinh` | 5 bước mở không gian tưởng niệm |
| Gia đình | `#ca-nhan` | Trang cá nhân, cây gia phả, làng dòng họ, ví nén |
| Hỏi đáp | `#hoi-dap` | Câu hỏi thường gặp |
| Cửa hàng & dịch vụ | `#cua-hang` | Vật phẩm số (tính bằng "nén"), đặt làm theo yêu cầu |
| Giới thiệu | `#dau-trang` | Trang giới thiệu, sáu không gian, ba bước |

## File JS → tính năng

| File | Tính năng |
|---|---|
| `00-vong-ve.js` | Hàm dùng chung: vòng vẽ chỉ chạy khi nhìn thấy (`ssVong`), theo dõi thanh công cụ (`ssKhiDoi`), AudioContext chung (`ssAm`) |
| `01-man-cho.js` | Màn chờ có thanh phần trăm; máy có 3D thì chờ cảnh 3D sắp vào nạp xong (tối đa 60 giây), cảnh khác nạp ngầm |
| `02-am-lich.js` | Lịch âm Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7), biến toàn cục `LV` |
| `03-nhac-nen.js` | Nhạc nền tự soạn bằng Web Audio theo lối (đàn tranh / organ) |
| `04-00-du-lieu-canh.js` | Dữ liệu 7 cảnh (`window.SS_CANH`): lưới đi được, tỉ lệ, điểm bấm theo toạ độ ảnh camera iso (ảnh 2D đã bỏ, chỉ còn 3D). Sửa cảnh là sửa file này |
| `04-01-the-gioi-nui.js` | Thế giới núi: chân núi → lên núi → chính điện, nhân vật, di chuyển |
| `05-dai-sanh.js` | Mở đại sảnh sau cổng, khi vào lại trang, khi bấm logo |
| `06-trang-muc.js` | Mỗi mục là một trang riêng, điều hướng |
| `07-01-dung-chung.js` | Hàm dùng chung (`$`, `$$`, `fmt`, `toast`), chuyển giữa trang giới thiệu và bên trong |
| `07-02-du-lieu-mau.js` | Lấy dữ liệu từ `SS_DATA`, các khu (`ZONES`), trạng thái người đang xem |
| `07-03-ho-so-tim-kiem.js` | Tìm kiếm, hồ sơ, thắp hương, ký ức (lời nhắn), hành trình |
| `07-04-cua-hang-ngoi-nha.js` | Cửa hàng, ví nén, quà đã nhận, điều khiển ngôi nhà |
| `07-05-hieu-ung-ban-do.js` | Hiệu ứng hồ sơ, bản đồ mộ phần thật |
| `07-06-gioi-thieu.js` | Dải gradient, minh họa isometric trang giới thiệu |
| `07-07-dang-ky.js` | Đăng ký / đăng nhập (bản trình diễn) |
| `07-08-thien-gioi.js` | Nền thiên giới: biển mây, hạc bay, cánh hoa |
| `07-09-vong-ky-uc.js` | Vòng ký ức ảnh/video quay quanh tâm |
| `07-10-den-troi-menu.js` | Đèn trời sau lời mời, menu điện thoại |
| `07-11-am-thanh.js` | Âm thanh thanh tịnh (Web Audio) |
| `07-12-trang-ca-nhan.js` | Ảnh chân dung, trang cá nhân: gia phả, làng dòng họ, ví nén |
| `07-13-khoi-tao.js` | Khởi tạo, chuyển động toàn trang |
| `08-icon-bien-hinh.js` | Icon biến hình (morphicons, tải từ jsdelivr) |
| `09-trang-nguoi-than.js` | Trang Người thân |
| `10-thap-nhang.js` | Thắp nhang chỉ ở một nơi: chính điện / nhà thờ |
| `11-lang-tuong-niem.js` | Làng tưởng niệm: chọn khu (Liệt sĩ, Thiên thần nhỏ) → chọn người → vào gian thờ |
| `12-chon-loi.js` | Sảnh chọn lối, đi tới cổng để chọn |
| `13-hud.js` | HUD bằng biểu tượng |
| `14-phi-thang.js` | Hiệu ứng phi thăng chuyển cảnh |
| `15-go-mo.js` | Gõ mõ tích công đức, 108 tiếng, 9 phẩm sen |
| `16-goc-nhin.js` | Phóng to / thu nhỏ góc nhìn, nhớ theo máy |
| `17-nghi-thuc.js` | Nghi thức Phật giáo 5 bước, Công giáo 5 bước |
| `18-thoi-gian-thuc.js` | Đồng hồ, lịch âm, ánh sáng theo giờ, thời tiết (Open-Meteo) |
| `19-mot-cho-thap-nhang.js` | Mọi nút thắp đều dẫn về nghi thức trong chính điện |
| `20-lang-rieng.js` | Làng riêng dựng từ gia phả |
| `21-ban-do-lang.js` | Bản đồ các khu quanh Sảnh Song Song |
| `26` · làng chung | Chủ dự án chốt 08/11/2026: các khu quanh Sảnh Song Song: **Liệt sĩ** (Đồi Tri Ân, đài tưởng niệm), **Bác Hồ** (quảng trường tượng đài đông bắc: tượng đồng vàng vẫy chào tạo bằng Meshy từ ảnh Bác, bệ đá đen khắc "CHỦ TỊCH HỒ CHÍ MINH (1890 - 1969)", xuất riêng trong `tuong.json`), **Các tướng** (tách khỏi khu Bác theo chủ dự án: quảng trường riêng tây bắc, 14 bia, ngôi sao đồng), **Gia phả các đời vua** (đình cũ thành đền, bia triều đại trên rùa đá), **Thiên thần nhỏ** (vườn hoa, nhà vòm trắng mái hồng). Bỏ Xóm Đồng Đội, Xóm Dòng Họ, Xóm Bình Yên, Đình làng (người thân, dòng họ ở Làng nhà tôi). Quanh làng: đồi, rừng, vách đá có thác lớn đổ xuống hồ sau tượng Bác, suối chảy về đông nam. Dựng bằng `tools/blender/sua-lang-v2.py` (ra lưới đi, cổng khu, vị trí nút, toạ độ nước) |
| `28-khu-lich-su.js` | Ba bảng: gia phả các đời vua (từng triều, ai là con ai), Chủ tịch Hồ Chí Minh, các tướng và lãnh đạo tiêu biểu. Dữ liệu `data/lich-su.js` (`window.SS_LICHSU`) tra từ nguồn công khai, **chờ chủ dự án duyệt**; mục có `chuY` là chỗ các nguồn lệch nhau |
| `22-nhan-ban-do.js` | Xếp nhãn trên bản đồ (cả nhãn 3D), tránh chồng chéo; nhãn nằm dưới thanh trên, nút, hoặc cắt mép màn hình thì ẩn. Nút có `p3` (toạ độ 3D) đặt cố định, như nhãn trên đầu tượng Bác |
| `23-dai-tuong-niem-liet-si.js` | Đài tưởng niệm liệt sĩ: nhang tri ân, lời tri ân |
| `24-bay-to.js` | Một nút "Bày tỏ", bấm mới mở 4 cách bày tỏ (chắp tay, thương nhớ, dâng hoa, cầu an) |
| `25-npc.js` | NPC người viếng: 1–3 người mỗi cảnh đi lại, chắp tay, vái lạy, ngồi. Chỉ chạy trên máy người xem, không tên, không tính vào số người trực tuyến, đứng yên khi bật giảm chuyển động |
| `26-the-gioi-3d.js` | Thế giới 3D thời gian thực, hiện có sảnh, chân núi, nhà thờ, làng tưởng niệm, làng dòng họ, ngôi nhà, chính điện; chuyển cảnh là đoạn phim "Bạn" đi bộ tới nơi (`ss3dPhim`, gọi từ `js/04-01`) (three.js, `css/29-the-gioi-3d.css`): vẽ lại cảnh, nhân vật đất nặn của mình, người khác và NPC từ vị trí của `04-01`; bấm để đi, kéo để xoay; thả tay 4 giây thì camera tự lướt về góc mặc định (thu nhỏ quá mặc định cũng trả về). Nạp ngay khi mở trang, màn tải (`01`) chờ 3D xong mới mở; vào cảnh 3D lúc chưa xong thì có màn chờ riêng. Máy không có GPU thật thì giữ ảnh 2D |
| `26` · chùa đỉnh núi | Cảnh `dien` dựng bằng `tools/blender/sua-dien-v2.py` (chạy trên bản sao .blend, ra cả lưới đi và vị trí nút cho `04-00`). Năm khu: thắp nhang (lư hương giữa sân), lễ Phật (chiếu trước tượng), gõ mõ (gian trái), thỉnh chuông (lầu chuông), tĩnh tâm (đá thiền dưới cội bồ đề). Mái chính điện (`SS_Mai*` trong `tuong.json`) mờ khi "Bạn" vào điện. Cảnh động trong `trangTriDien` theo `CHUA`: cò bay, bướm, khói hương, nước hồ, suối, thác, mây, lá rơi. |
| `img/am/suoi.mp3` | Tiếng suối ở chùa đỉnh núi: bản ghi "Tiếng suối chảy" của tiengdong.com do chủ dự án gửi (08/11/2026), cắt 42 giây lặp liền mạch. Thay âm thanh thì giữ ghi nguồn ở đây |
| `27-cai-dat.js` | Nút bánh răng góc phải trên thế giới mở bảng **Cài đặt** (`css/30-cai-dat.css`): bật/tắt và âm lượng nhạc nền (`03`, `ss-music`, `ss-music-vol`), âm thanh không gian (`07-11`, `ss-sound`, `ss-vol`), hiệu ứng (`ss-sfx`, mọi tiếng chuông, mõ, nến, bay lên đi qua `ssRa()` của `03`); nút nghe thử tiếng bay lên |

> Các file `07-NN-*.js` dùng chung tên cấp ngoài cùng (`people`, `current`, `select`, `buy`…) qua phạm vi toàn cục của trang.
> Vì vậy phải giữ đúng thứ tự nạp, và file khác không được khai báo trùng các tên này ở cấp ngoài cùng.

## Dữ liệu và trạng thái

- Toàn bộ dữ liệu là **mẫu hư cấu**. Người đã khuất, vị trí mộ/quê, lời nhắn mẫu, vật phẩm cửa hàng nằm ở `data/du-lieu-mau.js` (`window.SS_DATA`, nội dung là JSON thuần). Làng mẫu họ Phạm vẫn nằm trong `20-lang-rieng.js`.
- Khi có máy chủ: API trả về đúng dạng `SS_DATA` là thay được, giao diện không phải sửa.
- Trạng thái người dùng lưu trong `localStorage`: `ss-auth`, `ss-me`, `ss-faith`, `ss-nv`, `ss-music`, `ss-sound`, `ss-vol`, `ss-zoom`, `ss-dai`, `ss-dai-ta`…
- **Chưa có:** máy chủ, cơ sở dữ liệu, đăng nhập thật, thanh toán thật.

## Phụ thuộc bên ngoài

- Font Be Vietnam Pro (Google Fonts).
- morphicons (jsdelivr), lỗi thì giữ icon cũ.
- Open-Meteo cho thời tiết, lỗi thì mô phỏng.
- `window.claude` (chỉ có khi chạy trong claude.ai): phòng chung (`room`) để thấy người khác đang online, `downloads`, `user`. Trên tên miền riêng các tính năng này tự tắt; muốn giữ phải làm backend thay thế.
