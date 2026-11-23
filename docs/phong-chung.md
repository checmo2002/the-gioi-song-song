# Phòng chung: thấy người chơi khác

Chủ dự án chốt ngày 23/11/2026: **chỉ người đã đăng nhập** (tài khoản thật trên máy chủ, hiện là đăng nhập Google) mới vào phòng chung và thấy nhau.
Người chưa đăng nhập, hoặc chỉ có tài khoản số điện thoại / mật khẩu lưu trên máy (bản demo), vẫn đi một mình như trước.

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
  - Gắn kèm mã tài khoản và tên do máy chủ xác nhận (`X-Id`, `X-Ten`) rồi chuyển sang Durable Object.
- **Phòng** (`phong/index.js`):
  - Mỗi kết nối có một mã ngẫu nhiên riêng (`peer`). Mã tài khoản không bao giờ gửi cho người khác.
  - Vừa vào thì nhận `{t:'chao', toi, ds}`, gồm những người đang có mặt.
  - Có người đổi chỗ: `{t:'p', peer, p}`. Có người rời đi: `{t:'di', peer}`.
  - **Lọc trạng thái:**
    - chỉ giữ các trường `x y tx ty` (số, kẹp trong khoảng -1..2), `c w h k li` (số nguyên), `f s a e` (chữ `A-Za-z0-9:_-`, tối đa 40), `tc` (chữ `a-z0-9.`, tối đa 120);
    - tên `n` luôn do máy chủ gắn, trang không giả được;
    - mỗi tin tối đa 1.500 ký tự.
  - **Chống phá:**
    - quá 25 tin trong 5 giây thì bỏ bớt tin, quá 120 tin thì đuổi (mã 1008);
    - một tài khoản mở tối đa 5 kết nối;
    - cả phòng tối đa 300 người.
  - Dùng API ngủ (hibernation): lúc mọi người đứng yên, phòng không tính thời gian chạy.
  - Worker không có đường vào công khai (`workers_dev = false`, `preview_urls = false`). Chỉ dự án Pages gọi được, qua binding.

## Chi phí

Gói miễn phí Workers: 100.000 lượt yêu cầu và 13.000 GB-giây mỗi ngày.
- Mỗi kết nối tính 1 lượt. Tin nhận vào tính 20 tin = 1 lượt. Tin gửi đi không tính.
- Một người đi lại liên tục 1 giờ gửi khoảng 5 tin/giây, tức 18.000 tin = 900 lượt. Gói miễn phí đủ cho khoảng 100 giờ đi lại liên tục mỗi ngày.
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
python3 tests/phong.py http://localhost:8789   # cần: pip install websockets
```
