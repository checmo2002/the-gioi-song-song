# Gia phả dòng họ trên máy chủ

Chủ dự án chốt ngày 23/11/2026:
- Máy chủ chạy trên **Cloudflare**, cùng tài khoản đang chạy `songsong.bandolietsi.vn`, dùng gói miễn phí. Phần xử lý là Pages Functions, dữ liệu nằm trong D1.
- Khi người trong họ sửa gia phả, **trưởng họ duyệt**.
- **Đăng nhập bằng Firebase Authentication của Google**, theo `docs/bao-mat.md`: không tự viết phần mật khẩu. Người dùng đăng nhập bằng email + mật khẩu (miễn phí). Firebase lo cả việc xác nhận email và quên mật khẩu.

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
- **Phải xác nhận email trước** khi lập dòng họ, vào dòng họ hay sửa gia phả. Việc này ngăn người khác dùng email không phải của mình.
- Người không thuộc dòng họ không đọc được gì của dòng họ đó. Máy chủ trả 404, nên họ cũng không biết dòng họ đó có tồn tại hay không.

## Dữ liệu

- Mỗi dòng họ lưu **một cây** dạng JSON, có cùng các trường với gia phả trên máy (xem `docs/tinh-nang.md`, phần `07-12`), và một `phien_ban` tăng dần sau mỗi lần sửa.
  - Những trường riêng của từng máy (`self`, nhà 3D) không được đưa lên.
  - Người trong cây gắn với tài khoản qua trường `tk` (mã tài khoản Firebase).
- Một đề xuất là **cả cây đề xuất**, kèm một dòng ghi chú. Đề xuất chỉ nhận khi được làm trên đúng phiên bản hiện tại.
- Khi duyệt:
  - Nếu cây chưa đổi từ lúc đề xuất được gửi, cây đề xuất thay cây hiện tại.
  - Nếu cây đã đổi, đề xuất tự bị từ chối, kèm lý do "cần gửi lại trên bản mới".
- Duyệt hoặc từ chối xong thì xoá cây đề xuất, chỉ giữ người gửi, ghi chú, trạng thái, để cơ sở dữ liệu không đầy dần.
- Mỗi người gửi tối đa 30 đề xuất một ngày và có tối đa 20 đề xuất đang chờ.

Các bảng D1 (`migrations/0001_gia_pha.sql`):
- `nguoi_dung`: mã tài khoản Firebase và tên hiển thị. Không lưu email hay mật khẩu.
- `dong_ho`: dòng họ, gồm cây và phiên bản.
- `thanh_vien`: ai thuộc dòng họ nào, với vai gì.
- `loi_moi`: mã mời. Chỉ lưu SHA-256 của mã, không lưu mã gốc.
- `de_xuat`: các đề xuất và trạng thái của chúng.

## API (`functions/api/[[duong]].js`)

Mọi yêu cầu cần đăng nhập đều gửi kèm `Authorization: Bearer <mã đăng nhập Firebase>`. Thân yêu cầu và trả lời đều là JSON. Khi lỗi, máy chủ trả `{loi: "câu tiếng Việt"}`.

| Lệnh | Việc |
|---|---|
| `GET /api/cau-hinh` | Trả `{apiKey, projectId}` để trang gọi Firebase. Khoá web Firebase là khoá công khai; để ở biến môi trường cho repo không chứa khoá |
| `GET /api/toi` | Tài khoản, cờ email đã xác nhận, các dòng họ đang tham gia |
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

## Bảo mật

- **Xác minh mã đăng nhập.** Máy chủ tự xác minh mã đăng nhập Firebase (JWT, thuật toán RS256):
  - chữ ký đúng với khoá công khai Google công bố (khoá được lưu tạm, khi Google đổi khoá thì tải lại);
  - `aud` và `iss` đúng dự án Firebase của mình;
  - mã chưa hết hạn.
- **Chống trang khác gửi yêu cầu thay người dùng.** Mã đăng nhập không tự gửi kèm như cookie, nên trang khác không mượn được. Ngoài ra, mọi lệnh ghi còn bắt buộc có `Origin` trùng tên miền của trang và `Content-Type: application/json`.
- **Đăng nhập sai nhiều lần, quên mật khẩu, xác nhận email:** Firebase lo.
- **Kiểm cây ở máy chủ trước khi lưu:**
  - tối đa 2.000 người và 1 MB;
  - chỉ giữ các trường đã biết, đúng kiểu, độ dài có giới hạn;
  - bỏ ký tự điều khiển và ký tự đảo chiều chữ;
  - quan hệ phải trỏ tới người có trong cây, không trỏ vào chính mình, không có vòng cha – con;
  - không nhận id `__proto__`, `constructor`, `prototype`.
- **Hiển thị:** chữ người dùng nhập vẫn đi qua `esc()` khi đưa lên trang.
- **Kiểm thử:** `tests/may-chu.py` dựng một "Firebase giả" (tự sinh khoá RSA, tự ký mã) và thử trên máy chủ thật chạy ở máy. Gồm mã giả, mã hết hạn, mã của dự án khác, `alg: none`, quyền của từng vai, cây xấu, giả mạo yêu cầu, thu hồi mã mời.

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
printf 'FIREBASE_PROJECT_ID=song-song-thu\nFIREBASE_API_KEY=khoa-thu\nFIREBASE_JWKS=http://localhost:8790/jwks\n' > .dev.vars
npx wrangler d1 migrations apply gia-pha-thu --local
npx wrangler pages dev --port 8788 &
cd <repo> && python3 tests/may-chu.py           # cần python: pyjwt, cryptography
```

## Đưa lên mạng (làm một lần, cần chủ dự án)

1. **Firebase**, việc chủ dự án làm (miễn phí):
   - Tạo dự án Firebase.
   - Bật đăng nhập Email/Password.
   - Thêm `songsong.bandolietsi.vn` vào Authorized domains.
   - Trong Google Cloud Console, giới hạn khoá web chỉ dùng được từ tên miền đó.
2. **Hai cơ sở dữ liệu D1 riêng:**
   - `songsong-gia-pha` cho Production.
   - `songsong-gia-pha-thu` cho Preview, **chỉ chứa dữ liệu hư cấu**. Mọi nhánh, mọi PR đều có bản xem trước, nên không bao giờ gắn D1 thật cho Preview.
   - Chạy `migrations/0001_gia_pha.sql` trên cả hai.
3. **Gắn vào dự án Pages**, ở Settings → Bindings / Variables:
   - biến `DB` trỏ tới D1 tương ứng với từng môi trường;
   - `FIREBASE_PROJECT_ID` và `FIREBASE_API_KEY`.

Khi chưa gắn, `/api/*` trả lỗi 503 và khung "Gia phả của cả dòng họ" tự ẩn; phần còn lại của trang chạy như cũ.

## Chưa làm

- Đăng nhập bằng tài khoản Google (đăng nhập qua cửa sổ của Google).
- Đăng nhập bằng số điện thoại (mã OTP qua SMS, mỗi tin bị tính phí).
- Ảnh và ký ức lưu trên máy chủ.
- Thấy người khác đang trực tuyến.
- Chính sách quyền riêng tư và điều khoản sử dụng: **cần chủ dự án duyệt trước khi mở cho người thật**.
