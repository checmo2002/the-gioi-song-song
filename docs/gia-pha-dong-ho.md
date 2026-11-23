# Gia phả dòng họ trên máy chủ

Chủ dự án chốt ngày 23/11/2026:
- Máy chủ chạy trên **Cloudflare**, cùng tài khoản đang chạy `songsong.bandolietsi.vn`, dùng gói miễn phí. Phần chạy là Pages Functions, dữ liệu nằm trong D1.
- Khi sửa gia phả, **trưởng họ duyệt**.

## Ai làm được gì

| Vai | Xem cây | Sửa cây | Duyệt đề xuất | Tạo mã mời | Đổi vai người khác |
|---|---|---|---|---|---|
| `truong` (trưởng họ) | có | sửa thẳng | có | có | có |
| `duyet` (người được trưởng họ giao) | có | sửa thẳng | có | có | không |
| `thanh-vien` | có | gửi **đề xuất**, chờ duyệt | không | không | không |

- Người lập dòng họ là trưởng họ đầu tiên. Trưởng họ có thể giao vai `truong` cho người khác nhưng không tự bỏ vai của mình.
- Vào dòng họ bằng **mã mời**: 10 ký tự, có hạn 14 ngày, dùng được nhiều lần. Trưởng họ hoặc người `duyet` tạo mã.
- Người không thuộc dòng họ không đọc được gì của dòng họ đó.

## Dữ liệu

- Mỗi dòng họ lưu **một cây** dạng JSON, có cùng các trường với gia phả trên máy (`docs/tinh-nang.md`, phần `07-12`), kèm `phien_ban` tăng dần.
- Trường riêng của từng tài khoản như `self`, nhà 3D, quà không đưa lên. Người trong cây gắn với tài khoản qua trường `tk`.
- Một đề xuất là **cả cây đề xuất**, kèm phiên bản cây lúc bắt đầu sửa và một dòng ghi chú. Khi duyệt:
  - phiên bản không đổi thì cây đề xuất thay cây hiện tại;
  - phiên bản đã đổi (có người sửa trước) thì từ chối kèm lý do "cây đã đổi, cần gửi lại".
- Đề xuất đã duyệt hoặc từ chối được giữ lại để làm lịch sử.

Bảng D1 (`migrations/0001_gia_pha.sql`):
- `nguoi_dung`: tài khoản. Mật khẩu băm PBKDF2-SHA256 100.000 vòng, mỗi tài khoản một muối riêng.
- `phien`: phiên đăng nhập. Chỉ lưu SHA-256 của mã phiên, hết hạn sau 30 ngày.
- `dang_nhap_sai`: đếm số lần sai để khoá tạm.
- `dong_ho`, `thanh_vien`, `loi_moi` (chỉ lưu SHA-256 của mã mời), `de_xuat`.

## API (`functions/api/[[duong]].js`)

Mọi yêu cầu và trả lời đều là JSON. Lỗi trả `{loi: "câu tiếng Việt"}` kèm mã HTTP.

| Lệnh | Việc |
|---|---|
| `POST /api/dang-ky` | `{ten, lien_he, mat_khau}`: tạo tài khoản và đăng nhập luôn |
| `POST /api/dang-nhap` | `{lien_he, mat_khau}` |
| `POST /api/dang-xuat` | |
| `GET /api/toi` | Tài khoản và danh sách dòng họ đang tham gia |
| `POST /api/dong-ho` | `{ten, cay}`: lập dòng họ từ cây trên máy |
| `GET /api/dong-ho/:id` | Cây, phiên bản, vai của mình |
| `PUT /api/dong-ho/:id/cay` | `{cay, phien_ban}`: chỉ `truong` và `duyet` |
| `POST /api/dong-ho/:id/de-xuat` | `{cay, phien_ban, ghi_chu}` |
| `GET /api/dong-ho/:id/de-xuat` | Đề xuất đang chờ. Người duyệt thấy tất cả, thành viên thấy của mình |
| `POST /api/dong-ho/:id/de-xuat/:dx/duyet` | Duyệt đề xuất |
| `POST /api/dong-ho/:id/de-xuat/:dx/tu-choi` | `{ly_do}`: từ chối đề xuất |
| `POST /api/dong-ho/:id/loi-moi` | Trả về mã mời |
| `POST /api/tham-gia` | `{ma}`: vào dòng họ bằng mã mời |
| `GET /api/dong-ho/:id/thanh-vien` | Danh sách thành viên |
| `POST /api/dong-ho/:id/vai` | `{nguoi_id, vai}`: chỉ `truong` |

## Bảo mật

- **Phiên đăng nhập:** cookie `ss_phien` có `HttpOnly; Secure; SameSite=Lax; Path=/api`.
- **Chống giả mạo yêu cầu:** mọi lệnh ghi bắt buộc `Content-Type: application/json`, và `Origin` phải trùng tên miền của trang.
- **Đăng nhập sai:** sai 8 lần trong 15 phút thì khoá 15 phút, tính theo từng `lien_he`.
- **Kiểm cây ở máy chủ trước khi lưu:**
  - tối đa 2.000 người và 1 MB;
  - chỉ nhận các trường đã biết, đúng kiểu, chữ có giới hạn độ dài;
  - id quan hệ phải trỏ tới người có trong cây.
- **Hiển thị:** chữ người dùng vẫn đi qua `esc()` khi đưa lên trang.
- **Kiểm thử:** `tests/may-chu.py` chạy máy chủ thật ở máy (wrangler + D1 cục bộ), thử quyền, khoá đăng nhập sai và cây xấu.

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
npx wrangler d1 migrations apply gia-pha-thu --local
npx wrangler pages dev --port 8788 &
cd <repo> && python3 tests/may-chu.py
```

## Đưa lên Cloudflare (làm một lần)

1. Tạo cơ sở dữ liệu D1 tên `songsong-gia-pha` trong tài khoản Cloudflare đang chạy trang.
2. Chạy `migrations/0001_gia_pha.sql` trên D1 đó.
3. Trong dự án Pages, vào Settings → Bindings, gắn D1 đó với tên biến `DB`, cho cả Production lẫn Preview.

Chưa gắn D1 thì `/api/*` trả lỗi 503 "Máy chủ gia phả chưa được cấu hình", phần còn lại của trang vẫn chạy bình thường.

## Chưa làm

- Quên mật khẩu (cần dịch vụ gửi email hoặc SMS).
- Ảnh và ký ức trên máy chủ.
- Thấy người khác đang trực tuyến.
- Chính sách quyền riêng tư và điều khoản: **cần chủ dự án duyệt trước khi mở cho người thật**.
