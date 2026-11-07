# Bản đồ tính năng

Tách từ bản artifact "Thế Giới Song Song" ngày 04/11/2026. Hành vi giữ y như bản gốc.

## Luồng chính

1. **Màn chờ** → **sảnh chọn lối** (`#gate`): nhân vật đi tới cổng Phật giáo hoặc Công giáo.
2. **Phi thăng** (hiệu ứng chuyển cảnh) → **Đại sảnh** (`#hall`) với bản đồ làng isometric.
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
| `01-man-cho.js` | Màn chờ có thanh phần trăm; máy có 3D thì chờ cảnh chân núi nạp xong (tối đa 60 giây) |
| `02-am-lich.js` | Lịch âm Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7), biến toàn cục `LV` |
| `03-nhac-nen.js` | Nhạc nền tự soạn bằng Web Audio theo lối (đàn tranh / organ) |
| `04-00-du-lieu-canh.js` | Dữ liệu 7 cảnh isometric (`window.SS_CANH`): lưới đi được, tỉ lệ, điểm bấm. Sửa cảnh là sửa file này |
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
| `11-lang-tuong-niem.js` | Làng tưởng niệm: chọn xóm → chọn người → vào gian thờ |
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
| `22-nhan-ban-do.js` | Xếp nhãn trên bản đồ, tránh chồng chéo |
| `23-dai-tuong-niem-liet-si.js` | Đài tưởng niệm liệt sĩ: nhang tri ân, lời tri ân |
| `24-bay-to.js` | Một nút "Bày tỏ", bấm mới mở 4 cách bày tỏ (chắp tay, thương nhớ, dâng hoa, cầu an) |
| `25-npc.js` | NPC người viếng: 1–3 người mỗi cảnh đi lại, chắp tay, vái lạy, ngồi. Chỉ chạy trên máy người xem, không tên, không tính vào số người trực tuyến, đứng yên khi bật giảm chuyển động |
| `26-chan-3d.js` | Chân núi 3D thời gian thực (three.js, `css/29-chan-3d.css`): vẽ lại cảnh, nhân vật đất nặn của mình, người khác và NPC từ vị trí của `04-01`; bấm để đi, kéo để xoay. Nạp ngay khi mở trang, màn tải (`01`) chờ 3D xong mới mở; vào chân núi lúc chưa xong thì có màn chờ riêng. Máy không có GPU thật thì giữ ảnh 2D |

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
