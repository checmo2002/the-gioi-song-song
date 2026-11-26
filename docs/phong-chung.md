# Phòng chung: thấy người chơi khác

Chủ dự án chốt ngày 23/11/2026: **chỉ người đã đăng nhập** (tài khoản thật trên máy chủ, hiện là đăng nhập Google) mới vào phòng chung và thấy nhau.
Người chưa đăng nhập, hoặc chỉ có tài khoản số điện thoại / mật khẩu lưu trên máy (bản demo), vẫn đi một mình như trước.
Người lạ chỉ thấy **tên gọi** (chữ cuối của tên, ví dụ "An"). Tên có chữ tục hoặc giả ban quản trị ("Quản trị", "Admin", "Song Song"…) hiện thành "Khách viếng" (chủ dự án chốt 24/11/2026).

## Cách chạy

```
trang (js/02-09-phong-chung.js)
  ── WebSocket /api/phong (cookie phiên) ──▶ functions/api/[[duong]].js
       kiểm phiên đăng nhập, kiểm Origin
       ── binding PHONG ──▶ Worker songsong-phong (phong/index.js), Durable Object "Phong", một phòng tên "chung"
```

- **Trang:** `js/02-09-phong-chung.js` tạo `window.ssPhong()`, có cùng cách gọi với phòng chung của claude.ai (`peers()`, `presence()`, `onPeers()`).
  - `js/03` (đại sảnh) và `js/04-01` (thế giới 3D) dùng phòng của claude.ai khi chạy trên bản thử. Trên trang thật thì dùng `ssPhong`. Phần vẽ người khác dùng chung.
  - Chỉ mở kết nối khi `/api/toi` báo đã đăng nhập (`nguoi`) và máy chủ có phòng (`phong: true`).
  - Gửi tối đa 5 tin mỗi giây, chỉ gửi trạng thái mới nhất.
  - Mất kết nối thì tự nối lại, chờ lâu dần, tối đa 30 giây. Ba lần liền không vào được thì thôi.
  - Bấm "Thoát" là đóng kết nối.
- **Máy chủ trang:** `GET /api/phong` cần phiên đăng nhập, `Upgrade: websocket` và `Origin` trùng tên miền.
  - Thiếu phiên: 401. Origin lạ: 403. Chưa gắn `PHONG`: 503.
  - Gắn kèm mã tài khoản và **tên gọi** đã lọc (`tenGoi`, `X-Id`, `X-Ten`) rồi chuyển sang Durable Object.
  - Đăng xuất hoặc đổi tên: báo phòng đóng mọi kết nối của tài khoản đó (`/dong`). Phòng gửi `{t:'het'}` rồi đóng (mã 4002). Trang đang mở sẽ tự nối lại với tên mới, hoặc không vào được nữa nếu đã đăng xuất.
- **Phòng** (`phong/index.js`):
  - Mỗi kết nối có một mã ngẫu nhiên riêng (`peer`). Mã tài khoản không bao giờ gửi cho người khác.
  - Vừa vào thì nhận `{t:'chao', toi, ds}`, gồm những người đang có mặt.
  - Có người đổi chỗ: `{t:'p', peer, p}`. Có người rời đi: `{t:'di', peer}`.
  - **Lọc trạng thái** (theo nghĩa, không chỉ theo kiểu):
    - `x y tx ty`: số, kẹp trong khoảng -1..2;
    - `w h k`: 0 hoặc 1. `c` (màu áo): 0..7. `li` (giờ thắp nhang): chỉ nhận nhang còn cháy (trong 15 phút gần nhất);
    - `f s a`: chữ `a-z0-9_-`, tối đa 20. **`s` không nhận `ho:<mã>`**: mã làng riêng băm từ tên và số điện thoại, dò ngược được ra số điện thoại. Trang gửi `s:'ho'` và không vẽ người khác trong làng riêng của mình;
    - `e` (biểu cảm): chỉ `pray`, `heart`, `flower`, `light`. Phía trang cũng kiểm bằng `hasOwnProperty`;
    - `tc`: chữ `a-z0-9.`, tối đa 120;
    - tên `n` luôn do máy chủ gắn, trang không giả được;
    - mỗi tin tối đa 1.500 ký tự.
  - **Chống phá:**
    - trang gửi tối đa 25 tin trong 5 giây. Quá 30 tin thì đuổi (mã 1008) và **cấm nối lại 60 giây**;
    - một tài khoản mở tối đa 2 kết nối. Cả phòng tối đa 300 người;
    - mỗi 30 giây (alarm, chỉ chạy khi còn người): đóng kết nối chưa gửi vị trí sau 30 giây (trang thật gửi ngay khi vào) và kết nối quá 1 giờ (buộc kiểm lại phiên, trang tự nối lại).
  - Dùng API ngủ (hibernation): lúc mọi người đứng yên, phòng không tính thời gian chạy.
  - Worker không có đường vào công khai (`workers_dev = false`, `preview_urls = false`). Chỉ dự án Pages gọi được, qua binding.

## Ẩn và báo cáo người khác (24/11/2026, mục 8)

- Bấm ô số người trực tuyến (`#hallOnline`) mở danh sách người trong phòng chung. Mỗi người có nút **Ẩn** / **Hiện lại** và **Báo cáo**. Báo cáo phải bấm hai lần.
- Máy chủ gắn cho mỗi tài khoản một **mã ẩn danh cố định** `u` (16 ký tự đầu của SHA-256 của `"u:" + mã tài khoản`). Trang không tự đặt được mã này.
  - Ẩn theo `u` nên vẫn đúng người khi họ vào lại.
  - Danh sách ẩn lưu ở máy (`ss-an`, tối đa 200 người).
  - `u` không phải mã tài khoản.
- **Báo cáo** (`{t:'bao', u}`):
  - Phòng ghi lại người báo, người bị báo, tên và thời điểm (`bl:*` trong bộ nhớ của Durable Object) để chủ dự án xem sau.
  - Mỗi tài khoản báo tối đa 10 lần/ngày, không tự báo mình.
  - Người bị **3 tài khoản khác nhau** báo trong 7 ngày thì bị **ẩn với mọi người 24 giờ**. Họ vẫn vào được nhưng không ai thấy.
  - Người báo cáo cũng tự ẩn người đó trên máy mình.
- Chưa có: trang để chủ dự án xem và xử lý báo cáo. Hiện chỉ xem được bằng cách đọc bộ nhớ của Durable Object.

## Chi phí

Gói miễn phí Workers: 100.000 lượt yêu cầu và 13.000 GB-giây mỗi ngày.
- Mỗi kết nối tính 1 lượt. Tin nhận vào tính 20 tin = 1 lượt. Tin gửi đi không tính. Mỗi lần alarm (30 giây một lần khi còn người) tính 1 lượt, khoảng 2.900 lượt/ngày.
- Người đứng yên: trang gửi 1 tin/15 giây, khoảng 290 lượt/ngày.
- Người đi lại liên tục ở nhịp tối đa (5 tin/giây): 21.600 lượt/ngày. Gói miễn phí đủ cho khoảng 100 giờ đi lại liên tục mỗi ngày, cộng dồn mọi người.
- Một người cố phá (2 kết nối, sát nhịp đuổi): khoảng 43.000 lượt/ngày. Chưa đủ làm cạn gói miễn phí một mình, nhưng nhiều tài khoản phá cùng lúc thì có thể. Khi đó cần bật gói trả phí hoặc chặn tài khoản (chưa làm). Hai tài khoản gửi sát nhịp đuổi suốt cả ngày (khoảng 50.000 lượt/tài khoản) là đủ làm cạn gói miễn phí. Nếu xảy ra: thêm hạn mức tin mỗi ngày cho mỗi tài khoản.
- Tên: bộ lọc từ xấu luôn có cách lách. Tên có chữ ngoài bảng Latin/tiếng Việt hiện thành "Khách viếng". Sau này nên có nút ẩn hoặc báo cáo người khác.
- Vượt hạn mức thì kết nối phòng chung lỗi tới 7 giờ sáng (0 giờ UTC). Trang vẫn chạy, mỗi người đi một mình.

## Đưa lên mạng (làm một lần)

1. **Worker `songsong-phong`:** ở Workers & Pages → Create → Import a repository, chọn repo này.
   - Project name: `songsong-phong`.
   - Root directory: `phong`.
   - Deploy command: `npx wrangler deploy`.
   - Từ đó mỗi lần `main` đổi, Cloudflare tự dựng lại.
2. **Dự án Pages `thegioisongsong`:** Settings → Bindings → Add → Durable Object. Tên biến `PHONG`, chọn namespace `Phong` của `songsong-phong`. **Chỉ gắn ở Production.**
3. Dựng lại bản Production để nhận binding.

## Chạy thử ở máy

Hai cửa sổ dòng lệnh: một cho phòng, một cho trang. `wrangler dev` tự nối binding giữa hai tiến trình.
```
cd phong && npx wrangler dev --port 8792
# wrangler.toml của thư mục thử trang thêm:
#   [[durable_objects.bindings]]
#   name = "PHONG"
#   class_name = "Phong"
#   script_name = "songsong-phong"
npx wrangler pages dev --port 8789          # .dev.vars: TK_KHOA, GOOGLE_* như docs/gia-pha-dong-ho.md
python3 tests/phong.py http://localhost:8789   # cần: pip install websockets. Chạy lại ngay sau 60 giây vẫn được (mỗi lần dùng tài khoản mới)
```
