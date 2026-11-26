# Bản đồ tính năng

Tách từ bản artifact "Thế Giới Song Song" ngày 04/11/2026. Hành vi giữ y như bản gốc.

## Luồng chính

1. **Màn chờ** → **sảnh chọn lối** (`#gate`): nhân vật đi tới cổng Phật giáo hoặc Công giáo.
2. **Mở cửa** (hoạt cảnh ~2,4 giây, `js/12` + `css/27-06`): cửa chùa hoặc cửa nhà thờ mở ra, ánh sáng hắt ra, camera tiến vào; cảnh 3D đổi ngay bên dưới từ giây 0,7. Máy bật giảm chuyển động thì chỉ mờ dần → **Đại sảnh** (`#hall`) với thế giới 3D (bản 2D đã bỏ).
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
| `01-man-cho.js` | Màn chờ có thanh phần trăm; máy có 3D thì chờ cảnh 3D sắp vào nạp xong (tối đa 60 giây), cảnh khác nạp ngầm |
| `02-am-lich.js` | Lịch âm Việt Nam (thuật toán Hồ Ngọc Đức, UTC+7), biến toàn cục `LV` |
| `02-09-phong-chung.js` | Phòng chung trên máy chủ Song Song (`window.ssPhong`): chỉ người đã đăng nhập Google; cùng cách gọi với phòng của claude.ai để `03`, `04-01` vẽ người khác. Máy chủ: `phong/` (Durable Object), `docs/phong-chung.md` |
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
| `07-07-dang-ky.js` | Đăng ký / đăng nhập (bản trình diễn). Nút "Đăng nhập bằng Google" ở đầu khung (chỉ hiện khi máy chủ bật Google, `/api/toi` → `cach`): Google xong máy chủ chuyển về `/?dang-nhap=ok#ca-nhan`, trang vào luôn tài khoản trên máy bằng tên Google |
| `07-08-thien-gioi.js` | Nền thiên giới: biển mây, hạc bay, cánh hoa |
| `07-09-vong-ky-uc.js` | Vòng ký ức ảnh/video quay quanh tâm |
| `07-10-den-troi-menu.js` | Đèn trời sau lời mời, menu điện thoại |
| `07-11-am-thanh.js` | Âm thanh thanh tịnh (Web Audio) |
| `07-12-trang-ca-nhan.js` | Ảnh chân dung, trang cá nhân: gia phả, làng dòng họ, ví nén. Gia phả kiểu Việt: bố + mẹ (`parent`, `mother`), nhiều vợ/chồng (`spouse` là người đầu, `sp2` là người thứ), đời tự tính, chi/ngành, con thứ, con nuôi, tên húy/tự/thụy hiệu, ngày sinh/mất (`ns`, `nm`, `nmAl` = âm lịch), ngày giỗ âm lịch tự tính (`ssGio(d,m)` cho lịch vạn niên), nơi an táng; sửa thông tin từng người. Cây lớn: tìm tên không cần dấu, phóng to/thu nhỏ/vừa khung, kéo chuột để di chuyển, thu gọn/mở từng chi (nút dưới mỗi khối, ghi số người đang ẩn). Cây vẽ bằng SVG theo kiểu cây mọc lên: tổ tiên ở gốc dưới cùng (thân, rễ), con cháu toả lên trên các cành cong có lá, tán lá mờ phía sau. Mỗi người là một quả tròn mang chữ đầu tên (ngọc: còn sống, đồng: đã khuất, đỏ: liệt sĩ), kèm nến lay lắt hoặc mầm cây, tên ghi dưới quả. Vợ chồng nối bằng hai vòng như logo; chọn một người thì cả dòng tổ tiên sáng vàng; người mới hiện ra nở dần từ gốc lên (chỉ người chưa vẽ lần trước, `daVe`). Tắt hết chuyển động khi máy bật giảm chuyển động |
| `07-14-gia-pha-dong-ho.js` | Khung "Gia phả của cả dòng họ" trên tab Gia phả: nút "Đăng nhập bằng Google" (Zalo khi máy chủ bật; máy chủ lo, phiên trong cookie HttpOnly); lập dòng họ từ cây trên máy hoặc vào bằng mã mời; trưởng họ/người duyệt sửa là lưu thẳng lên máy chủ, thành viên sửa thành đề xuất chờ duyệt; danh sách đề xuất (tóm tắt thêm/sửa/xoá ai), mã mời, thành viên và vai. Tự ẩn khi không có máy chủ. Máy chủ: `functions/api`, `docs/gia-pha-dong-ho.md` |
| `07-13-khoi-tao.js` | Khởi tạo, chuyển động toàn trang |
| `08-icon-bien-hinh.js` | Icon biến hình (morphicons, tải từ jsdelivr) |
| `09-trang-nguoi-than.js` | Trang Người thân |
| `10-thap-nhang.js` | Thắp nhang chỉ ở một nơi: chính điện / nhà thờ |
| `11-lang-tuong-niem.js` | Làng tưởng niệm: chọn khu (Liệt sĩ, Thiên thần nhỏ) → chọn người → vào gian thờ |
| `12-chon-loi.js` | Sảnh chọn lối, đi tới cổng để chọn; hoạt cảnh mở cửa khi chọn (`.mo-cua`, CSS ở `27-06`) |
| `13-hud.js` | HUD bằng biểu tượng |
| `14-phi-thang.js` | Hiệu ứng phi thăng chuyển cảnh (từ mục 13, chọn lối dùng hoạt cảnh mở cửa thay cho phi thăng) |
| `15-go-mo.js` | Gõ mõ tích công đức, 108 tiếng, 9 phẩm sen |
| `29-cong-duc.js` | Trò nhỏ trên chùa: Thắp nhang, Thỉnh chuông, Vái lạy, Tĩnh tâm; cộng chung công đức Gõ mõ, Bảng công đức (`css/32`) |
| `31-tao-nhan-vat.js` | Tạo nhân vật (`css/34`): dáng nam/nữ, 7 kiểu tóc + màu, 4 khuôn mặt + màu da, 5 kiểu áo + màu, quần/váy + màu; xem trước 3D xoay được (`ss3dNV` trong `js/26`). Mở bắt buộc sau khi đăng ký (lần đầu vào Song Song, `js/02`), mở lại bằng nút **Nhân vật** trên thanh hành động. Lưu `ss-nv-tc`, gửi kèm vị trí để người khác thấy (`js/04-01`) |
| `30-bo-hoa-thieng.js` | Nhà thờ: Bó hoa thiêng (không điểm, không xếp hạng): Thắp nến, Lần chuỗi Mân Côi, Ở lại với Chúa, Chuông Truyền Tin, Nước thánh, Cầu cho các linh hồn; bó hoa trên trang hồ sơ (`css/33`). Giá chuông, bình nước thánh dựng trong `js/26` (`vatNhaTho`) |
| `16-goc-nhin.js` | Phóng to / thu nhỏ góc nhìn, nhớ theo máy |
| `17-nghi-thuc.js` | Nghi thức Phật giáo 5 bước, Công giáo 5 bước |
| `18-thoi-gian-thuc.js` | Đồng hồ, lịch âm, ánh sáng theo giờ, thời tiết (Open-Meteo) |
| `19-mot-cho-thap-nhang.js` | Mọi nút thắp đều dẫn về nghi thức trong chính điện |
| `20-lang-rieng.js` | Làng riêng dựng từ gia phả: ô đất, 12 kiểu nhà Việt Nam, 3 cấp nhà (nhỏ, khang trang, dinh thự chiếm 2 ô liền nhau trong hàng; hàng kín thì không xây được), nền dinh thự nâng mặt đi (`ssHo.nen()`), màu mái/tường, kiểu cửa, đồ vườn và quà bày theo ô (`ssHo.nha()`), quà trong nhà của từng người (`ssHo.qua(id)`: trường kỷ, sập, tủ chè, tủ áo bày trong cảnh gian nhà); nhà và đồ 3D do `js/26` dựng từ `img/3d/ho/nha.json` |
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
- Trạng thái người dùng lưu trong `localStorage`: `ss-auth`, `ss-me`, `ss-faith`, `ss-nv`, `ss-nv-tc`, `ss-music`, `ss-sound`, `ss-vol`, `ss-zoom`, `ss-dai`, `ss-dai-ta`…
- **Chưa có:** máy chủ, cơ sở dữ liệu, đăng nhập thật, thanh toán thật.

## Phụ thuộc bên ngoài

- Font Be Vietnam Pro (Google Fonts).
- morphicons 1.7.1, đã tải về `js/thu-vien/` (không gọi jsdelivr nữa), lỗi thì giữ icon cũ.
- Open-Meteo cho thời tiết, lỗi thì mô phỏng.
- `window.claude` (chỉ có khi chạy trong claude.ai): phòng chung (`room`) để thấy người khác đang online, `downloads`, `user`. Trên tên miền riêng các tính năng này tự tắt; muốn giữ phải làm backend thay thế.
