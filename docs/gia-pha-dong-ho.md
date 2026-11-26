# Gia phả dòng họ trên máy chủ

Chủ dự án chốt ngày 23/11/2026:
- Máy chủ chạy trên **Cloudflare**, trong tài khoản Cloudflare riêng của Song Song (dự án Pages `thegioisongsong`), dùng gói miễn phí. Phần xử lý là Pages Functions, dữ liệu nằm trong D1.
- Khi người trong họ sửa gia phả, **trưởng họ duyệt**.
- **Đăng nhập bằng Google** (chủ dự án chốt cùng ngày: bỏ Firebase vì đòi thẻ thanh toán; Zalo làm xong nhưng chưa muốn dùng, mã để sẵn, chỉ bật khi gắn khoá Zalo). Theo `docs/bao-mat.md`: không tự viết phần mật khẩu, Google/Zalo giữ mật khẩu và lo việc quên mật khẩu, đăng nhập sai nhiều lần. Máy chủ chỉ xin phạm vi `openid profile`: mã tài khoản và tên hiển thị, không xin email, số điện thoại.

## Ai làm được gì

| Vai | Xem cây | Sửa cây | Duyệt đề xuất | Tạo / thu hồi mã mời | Giao vai, mời người ra |
|---|---|---|---|---|---|
| `truong` (trưởng họ) | có | sửa thẳng | có | có | có |
| `duyet` (người được trưởng họ giao) | có | sửa thẳng | có | có | không |
| `thanh-vien` | có | gửi **đề xuất**, chờ duyệt | không | không | không |

- Người lập dòng họ là trưởng họ đầu tiên. Không ai đổi được vai của người lập, và không ai tự đổi vai của chính mình.
- **Mã mời:**
  - Gồm 10 ký tự, có hạn 14 ngày, dùng được nhiều lần.
  - Trưởng họ có thể thu hồi tất cả mã của dòng họ.
  - Khi một người bị hạ vai hoặc bị mời ra, các mã người đó đã tạo hết hiệu lực.
- **Người bị mời ra** không vào lại được, kể cả bằng mã mời mới (bảng `chan`). Đề xuất đang chờ của người đó bị bỏ.
- **Lịch sử:** trước mỗi lần thay cây (sửa thẳng, duyệt, khôi phục), máy chủ lưu bản cũ, giữ 30 bản gần nhất (bảng `lich_su`). Trưởng họ xem và khôi phục được, phòng khi cây bị xoá nhầm hoặc bị phá.
- Trường `tk` (người trong cây là tài khoản nào): mỗi người chỉ gắn được với chính tài khoản mình; `tk` của người khác máy chủ giữ nguyên như bản đang lưu.
- Người không thuộc dòng họ không đọc được gì của dòng họ đó. Máy chủ trả 404, nên họ cũng không biết dòng họ đó có tồn tại hay không.

## Dữ liệu

- Mỗi dòng họ lưu **một cây** dạng JSON, có cùng các trường với gia phả trên máy (xem `docs/tinh-nang.md`, phần `07-12`), và một `phien_ban` tăng dần sau mỗi lần sửa.
  - Những trường riêng của từng máy (`self`, nhà 3D) không được đưa lên.
  - Người trong cây gắn với tài khoản qua trường `tk` (mã tài khoản trên máy chủ: `g` hoặc `z` + HMAC của mã Google/Zalo, xem phần Bảo mật).
- Một đề xuất là **cả cây đề xuất**, kèm một dòng ghi chú. Đề xuất chỉ nhận khi được làm trên đúng phiên bản hiện tại.
- Khi duyệt:
  - Nếu cây chưa đổi từ lúc đề xuất được gửi, cây đề xuất thay cây hiện tại.
  - Nếu cây đã đổi, đề xuất tự bị từ chối, kèm lý do "cần gửi lại trên bản mới".
- Duyệt hoặc từ chối xong thì xoá cây đề xuất, chỉ giữ người gửi, ghi chú, trạng thái, để cơ sở dữ liệu không đầy dần.
- Mỗi người gửi tối đa 30 đề xuất một ngày và có tối đa 20 đề xuất đang chờ.

Các bảng D1 (`migrations/0001_gia_pha.sql`):
- `nguoi_dung`: `g` (Google) hoặc `z` (Zalo) + HMAC-SHA256 của mã người dùng với khoá `TK_KHOA`, và tên hiển thị. Không lưu email, số điện thoại hay mật khẩu.
- `phien`: phiên đăng nhập. Chỉ lưu SHA-256 của mã phiên, hạn 30 ngày.
- `dn_cho`: lượt đăng nhập đang dở (SHA-256 của `state`, bên đăng nhập, `code_verifier` của PKCE), hạn 10 phút, dùng một lần.
- `dong_ho`: dòng họ, gồm cây và phiên bản.
- `thanh_vien`: ai thuộc dòng họ nào, với vai gì.
- `loi_moi`: mã mời. Chỉ lưu SHA-256 của mã, không lưu mã gốc.
- `de_xuat`: các đề xuất và trạng thái của chúng.
- `chan`: người đã bị mời ra.
- `lich_su`: 30 bản cây cũ gần nhất.

## API (`functions/api/[[duong]].js`)

Đăng nhập xong, trình duyệt giữ cookie `__Host-ss_phien` (HttpOnly, Secure, SameSite=Lax), trang không đọc được mã này. Thân yêu cầu và trả lời đều là JSON. Khi lỗi, máy chủ trả `{loi: "câu tiếng Việt"}`.

| Lệnh | Việc |
|---|---|
| `GET /api/google/bat-dau` | Bắt đầu đăng nhập: tạo `state` và PKCE, chuyển sang trang đăng nhập của Google. Zalo: `/api/zalo/bat-dau`, chỉ chạy khi có khoá Zalo |
| `GET /api/google/ve` | Google chuyển về đây kèm `code`. Máy chủ đổi `code` lấy mã truy cập, hỏi Google mã và tên người dùng, tạo phiên rồi chuyển về `/?dang-nhap=ok#ca-nhan` (trang vào luôn tài khoản trên máy, `js/07-07`). |
| `POST /api/dang-xuat` | Xoá phiên |
| `GET /api/toi` | Tài khoản (`null` nếu chưa đăng nhập), các dòng họ đang tham gia, `cach`: các bên đăng nhập đang bật (trang chỉ hiện nút của các bên này) |
| `POST /api/dong-ho/:id/gan` | "Đây là tôi": `{nguoi}` gắn tài khoản mình với một người **còn sống, chưa ai nhận** (không cần duyệt, mỗi tài khoản một người, gắn người khác thì tự bỏ người cũ); `{nguoi: null}` bỏ gắn; `{bo}` trưởng họ bỏ gắn người nhận nhầm. Lưu bản cũ vào lịch sử như mọi lần sửa cây |
| `PUT /api/toi` | Đổi tên hiển thị: `{ten}` |
| `POST /api/dong-ho` | Lập dòng họ từ cây trên máy: `{ten, cay}` |
| `GET /api/dong-ho/:id` | Cây, phiên bản, vai của mình |
| `PUT /api/dong-ho/:id/cay` | Sửa thẳng: `{cay, phien_ban}`. Chỉ `truong` và `duyet` |
| `POST /api/dong-ho/:id/de-xuat` | Gửi đề xuất: `{cay, phien_ban, ghi_chu}` |
| `GET /api/dong-ho/:id/de-xuat` | Đề xuất đang chờ. Người duyệt thấy tất cả, thành viên chỉ thấy của mình |
| `POST /api/dong-ho/:id/de-xuat/:dx/duyet` | Duyệt một đề xuất |
| `POST /api/dong-ho/:id/de-xuat/:dx/tu-choi` | Từ chối một đề xuất: `{ly_do}` |
| `POST /api/dong-ho/:id/loi-moi` | Tạo mã mời |
| `DELETE /api/dong-ho/:id/loi-moi` | Thu hồi mọi mã mời của dòng họ |
| `POST /api/tham-gia` | Vào dòng họ bằng mã mời: `{ma}` |
| `GET /api/dong-ho/:id/thanh-vien` | Danh sách thành viên (không có email) |
| `POST /api/dong-ho/:id/vai` | Giao vai: `{nguoi_id, vai}`. Chỉ `truong` |
| `POST /api/dong-ho/:id/xoa-thanh-vien` | Mời một người ra khỏi dòng họ: `{nguoi_id}`. Chỉ `truong` |
| `GET /api/dong-ho/:id/lich-su` | 30 bản cũ gần nhất (phiên bản, lúc, ai sửa, số người). Chỉ `truong` |
| `POST /api/dong-ho/:id/khoi-phuc` | Khôi phục bản cũ: `{ve, phien_ban}`. Chỉ `truong` |

## Bảo mật

- **Đăng nhập Google (OAuth 2.0 + PKCE S256), Zalo (OAuth v4 + PKCE) dùng chung luồng:**
  - `state` ngẫu nhiên vừa nằm trong cookie `__Host-ss_dn` của chính trình duyệt đó, vừa lưu (dạng SHA-256, kèm tên bên đăng nhập) ở `dn_cho`. Lúc Google/Zalo chuyển về, hai bên phải khớp, và phải về đúng đường của bên đã bắt đầu, nên kẻ khác không gài được lượt đăng nhập của họ vào máy người dùng.
  - Mỗi lượt dùng một lần, hạn 10 phút. `code_verifier` không rời máy chủ.
  - Khoá bí mật (`GOOGLE_CLIENT_SECRET`, `ZALO_APP_SECRET`) chỉ nằm ở biến bí mật của Cloudflare, không ở repo, không ở trang.
  - Mã truy cập chỉ dùng một lần để hỏi mã và tên người dùng, không lưu.
  - Mã người dùng phải đúng dạng (Google: chữ/số tới 60 ký tự, Zalo: số) mới tạo tài khoản.
  - **Không lưu, không trả ra mã Google/Zalo gốc.** Mã Google (`sub`) là mã tài khoản Google dùng chung mọi dịch vụ; ai trong dòng họ cũng thấy mã tài khoản (danh sách thành viên, trường `tk`), nên máy chủ dùng HMAC(`TK_KHOA`, `bên:mã`). **Không đổi `TK_KHOA` sau khi có người dùng**, vì mọi mã tài khoản sẽ đổi theo.
  - Trường `tk` đã gắn với một người thì người khác không đè được, kể cả qua đề xuất được duyệt.
- **Phiên:** mã phiên 32 byte ngẫu nhiên, cookie HttpOnly (trang và mã độc chèn vào trang không đọc được).
- **Tiền tố `__Host-`** cho cả hai cookie: `pages.dev` là hậu tố công cộng nên mọi bản xem trước `<nhánh>.thegioisongsong.pages.dev` là tên miền con của trang chính. Không có tiền tố này, mã trên một bản xem trước ném được cookie phiên/state của kẻ xấu vào trang chính (gài đăng nhập, cố định phiên). Cookie trùng tên lọt tới thì máy chủ bỏ cả hai. Cơ sở dữ liệu chỉ giữ SHA-256 của mã. Đăng xuất là xoá phiên ở máy chủ.
- **Chống trang khác gửi yêu cầu thay người dùng:** cookie là SameSite=Lax, và mọi lệnh ghi còn bắt buộc có `Origin` trùng tên miền của trang và `Content-Type: application/json`.
- **Đăng nhập sai nhiều lần, quên mật khẩu:** Google/Zalo lo.
- **Kiểm cây ở máy chủ trước khi lưu:**
  - tối đa 2.000 người và 1 MB;
  - chỉ giữ các trường đã biết, đúng kiểu, độ dài có giới hạn;
  - bỏ ký tự điều khiển và ký tự đảo chiều chữ;
  - quan hệ phải trỏ tới người có trong cây, không trỏ vào chính mình, không có vòng cha – con;
  - không nhận id `__proto__`, `constructor`, `prototype`.
- **Hiển thị:** chữ người dùng nhập vẫn đi qua `esc()` khi đưa lên trang.
- **Kiểm thử:** `tests/may-chu.py` dựng "Google giả" và "Zalo giả" (kiểm khoá bí mật, mã ứng dụng, `redirect_uri` và PKCE như thật) và thử trên máy chủ thật chạy ở máy. Gồm: mã tài khoản không chứa `sub` của Google, không đè được `tk` của người khác, dùng `state` của bên này cho bên kia, bên đăng nhập lạ, gài `state` của trình duyệt khác, cookie không có tiền tố `__Host-` hoặc trùng tên, sai `code_verifier`, dùng lại `state`, phiên giả, đăng xuất, quyền của từng vai, cây xấu, giả mạo yêu cầu, thu hồi mã mời, người bị mời ra vào lại.

## Chạy thử ở máy

Cần Node. Không cài wrangler vào repo; dựng một thư mục thử bên ngoài, ví dụ `/tmp/ss-may-chu`:

```
python3 tools/cloudflare.py                     # dựng dist/cloudflare
mkdir -p /tmp/ss-may-chu && cd /tmp/ss-may-chu && npm init -y && npm i wrangler@4.20.0
ln -s <repo>/functions functions && ln -s <repo>/dist/cloudflare site && ln -s <repo>/migrations migrations
cat > wrangler.toml <<'EOF'
name = "songsong-thu"
pages_build_output_dir = "site"
compatibility_date = "2025-06-01"
[[d1_databases]]
binding = "DB"
database_name = "gia-pha-thu"
database_id = "00000000-0000-0000-0000-000000000000"
migrations_dir = "migrations"
EOF
printf 'TK_KHOA=khoa-thu\nGOOGLE_CLIENT_ID=gg-thu\nGOOGLE_CLIENT_SECRET=gg-bi-mat\nGOOGLE_THU=http://localhost:8790\nZALO_APP_ID=app-thu\nZALO_APP_SECRET=bi-mat-thu\nZALO_OAUTH=http://localhost:8790\nZALO_GRAPH=http://localhost:8790\n' > .dev.vars
npx wrangler d1 migrations apply gia-pha-thu --local
npx wrangler pages dev --port 8788 &
cd <repo> && python3 tests/may-chu.py           # chỉ cần thư viện chuẩn của python
```

## Đưa lên mạng (làm một lần, cần chủ dự án)

1. **Ứng dụng Google**, việc chủ dự án làm (miễn phí, không cần bật thanh toán) ở console.cloud.google.com:
   - Tạo dự án (ví dụ "Song Song").
   - Vào **Google Auth Platform** (OAuth consent screen): loại người dùng **External**, tên ứng dụng "Thế Giới Song Song", email hỗ trợ, tên miền `thegioisongsong.pages.dev`. Chỉ dùng phạm vi `openid` và `profile`. Đây là phạm vi không nhạy cảm, nên không phải chờ Google duyệt.
   - Còn ở chế độ "Testing" thì chỉ người có tên trong danh sách thử đăng nhập được. Mở cho mọi người: bấm **Publish app**.
   - Tạo **OAuth client ID** loại **Web application**. Authorized redirect URI: `https://thegioisongsong.pages.dev/api/google/ve` (thêm tên miền riêng khi có). Lấy **Client ID** và **Client secret**.
   - Bản xem trước của PR có tên miền khác nên không đăng nhập được; thử đăng nhập trên `thegioisongsong.pages.dev`.
   - Zalo (để sau): ứng dụng ở developers.zalo.me, địa chỉ gọi lại `https://thegioisongsong.pages.dev/api/zalo/ve`, rồi gắn `ZALO_APP_ID`, `ZALO_APP_SECRET` như dưới. Không gắn thì không có nút Zalo.
2. **Hai cơ sở dữ liệu D1 riêng:**
   - `songsong-gia-pha` cho Production.
   - `songsong-gia-pha-thu` cho Preview, **chỉ chứa dữ liệu hư cấu**. Mọi nhánh, mọi PR đều có bản xem trước, nên không bao giờ gắn D1 thật cho Preview.
   - Chạy `migrations/0001_gia_pha.sql` trên cả hai.
3. **Gắn vào dự án Pages**, ở Settings → Bindings / Variables:
   - biến `DB` trỏ tới D1 tương ứng với từng môi trường;
   - `TK_KHOA` (**Encrypt**): một chuỗi ngẫu nhiên dài (ví dụ `openssl rand -hex 32`), đặt một lần, **không bao giờ đổi**.
   - `GOOGLE_CLIENT_ID` (biến thường) và `GOOGLE_CLIENT_SECRET` (chọn **Encrypt**, là biến bí mật). Zalo khi cần: `ZALO_APP_ID`, `ZALO_APP_SECRET` (Encrypt). **Chỉ đặt ở Production.** Mã của mọi nhánh chạy ở Preview, nên đặt khoá ở đó là nhánh nào cũng đọc được khoá. Preview không có khoá thì `/api` trả 503, khung tự ẩn.

Khi chưa gắn, `/api/*` trả lỗi 503 và khung "Gia phả của cả dòng họ" tự ẩn; phần còn lại của trang chạy như cũ.

## Giao diện (`js/07-14-gia-pha-dong-ho.js`)

Khung "Gia phả của cả dòng họ" nằm trên cây, trong tab Gia phả của trang Gia đình. Khung tự ẩn khi `/api/toi` không trả lời được, ví dụ khi mở bằng `python3 -m http.server`.

1. **Chưa đăng nhập:** khung đóng gọn. Mở ra thì có nút "Đăng nhập bằng Google" theo mẫu nút của Google (một đường dẫn tới `/api/google/bat-dau`, không nạp thư viện ngoài). Nút Zalo chỉ hiện khi máy chủ bật Zalo (`cach` từ `/api/toi`). Nếu lượt đăng nhập lỗi hoặc quá 10 phút, khung báo lại.
2. **Chưa nối dòng họ:** danh sách dòng họ đang tham gia, ô lập dòng họ từ cây trên máy, ô vào dòng họ bằng mã mời. Nếu trên máy đã có gia phả, phải bấm hai lần để đồng ý thay bằng cây chung của họ.
3. **Đã nối dòng họ:**
   - Trưởng họ hoặc người duyệt sửa trên cây là lưu thẳng lên máy chủ. Nếu người khác vừa sửa trước, trang tải bản mới và báo lại.
   - Thành viên sửa thì thành bản nháp: hiện khung "Gửi đề xuất" kèm ghi chú, hoặc "Bỏ thay đổi".
   - Nút: đề xuất (tóm tắt thêm / sửa / xoá ai), tạo mã mời, thành viên (trưởng họ đổi vai ngay tại đây), tải lại, ngắt dòng họ khỏi máy này.

Trang không giữ mã đăng nhập nào (phiên nằm trong cookie HttpOnly). Thông tin dòng họ đang nối lưu ở `ss-dong-ho`. Bấm "Thoát" của trang cũng đăng xuất khỏi máy chủ.

## Chưa làm

- Bật đăng nhập Zalo (mã có sẵn, chỉ cần gắn khoá). Đăng nhập bằng số điện thoại.
- Chạy máy chủ trên máy riêng của chủ dự án (wrangler + Cloudflare Tunnel): cần tên miền trước.
- Ảnh và ký ức lưu trên máy chủ.
- Thấy người khác đang trực tuyến.
- Chính sách quyền riêng tư và điều khoản sử dụng: **cần chủ dự án duyệt trước khi mở cho người thật**.
