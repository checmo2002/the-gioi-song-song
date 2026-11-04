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
| `01-man-cho.js` | Màn chờ có thanh phần trăm |
| `02-am-lich.js` | Lịch âm Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7), biến toàn cục `LV` |
| `03-nhac-nen.js` | Nhạc nền tự soạn bằng Web Audio theo lối (đàn tranh / organ) |
| `04-the-gioi-nui.js` | Thế giới núi: chân núi → lên núi → chính điện, nhân vật, di chuyển *(file lớn, cần tách tiếp)* |
| `05-dai-sanh.js` | Mở đại sảnh sau cổng, khi vào lại trang, khi bấm logo |
| `06-trang-muc.js` | Mỗi mục là một trang riêng, điều hướng |
| `07-loi-chinh.js` | Lõi cũ: dữ liệu mẫu, tìm kiếm, hồ sơ, ký ức, cửa hàng, ngôi nhà, bản đồ, đăng ký *(file lớn, cần tách tiếp)* |
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

## Dữ liệu và trạng thái

- Toàn bộ dữ liệu là **mẫu hư cấu**, viết thẳng trong JS (chủ yếu `07-loi-chinh.js`, `20-lang-rieng.js`).
- Trạng thái người dùng lưu trong `localStorage`: `ss-auth`, `ss-me`, `ss-faith`, `ss-nv`, `ss-music`, `ss-sound`, `ss-vol`, `ss-zoom`, `ss-dai`, `ss-dai-ta`…
- **Chưa có:** máy chủ, cơ sở dữ liệu, đăng nhập thật, thanh toán thật.

## Phụ thuộc bên ngoài

- Font Be Vietnam Pro (Google Fonts).
- morphicons (jsdelivr), lỗi thì giữ icon cũ.
- Open-Meteo cho thời tiết, lỗi thì mô phỏng.
- `window.claude` (chỉ có khi chạy trong claude.ai): phòng chung (`room`) để thấy người khác đang online, `downloads`, `user`. Trên tên miền riêng các tính năng này tự tắt; muốn giữ phải làm backend thay thế.
