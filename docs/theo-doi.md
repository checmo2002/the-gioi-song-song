# Theo dõi lỗi và tốc độ tải trang

Song Song tự ghi lỗi và tốc độ tải của trang vào cơ sở dữ liệu D1 của chính mình. Không dùng dịch vụ ngoài (Sentry, Google Analytics…).

- Trình duyệt: `js/00-theo-doi.js`, nạp đầu tiên (trước màn chờ) để bắt được cả lỗi lúc mở trang. Chỉ gửi khi trang chạy trên **https**; máy thử `http://localhost` không gửi gì.
- Máy chủ: `functions/api/bao-loi.js` nhận `POST /api/bao-loi`, lọc rồi lưu vào bảng `theo_doi` (`migrations/0002_theo_doi.sql`).
- Giữ **30 ngày**. Máy chủ thỉnh thoảng (khoảng 1% số lần gọi) tự xoá bản ghi cũ hơn.

## Gửi những gì

**Lỗi** (`loai = 'loi'`), mỗi lần mở trang tối đa 5 lỗi, lỗi trùng chỉ gửi một lần:

| Trường | Nội dung |
|---|---|
| `m` | Lời báo lỗi của trình duyệt (tối đa 300 ký tự) |
| `f`, `d`, `c` | Tệp JS, dòng, cột nơi xảy ra lỗi |
| `s` | Vết gọi hàm (stack), tối đa 600 ký tự |
| `trang` | Đường dẫn và màn đang mở, ví dụ `/#ca-nhan` |
| `may` | `dt` (màn hình hẹp dưới 700px, thường là điện thoại) hoặc `mt` (máy tính) |

**Tốc độ** (`loai = 'toc-do'`), một lần mỗi lần mở trang, gửi khi chân núi 3D nạp xong hoặc sau tối đa 2 phút. Đơn vị mili giây, tính từ lúc bắt đầu mở trang:

| Trường | Nội dung |
|---|---|
| `ttfb` | Máy chủ trả byte đầu tiên |
| `dom` | Khung trang (HTML) đọc xong |
| `tai` | Trang tải xong (sự kiện `load`) |
| `lcp` | Phần lớn nhất trên màn hình hiện ra. `0` là trình duyệt không đo được (Safari, Firefox) |
| `d3` | Chân núi 3D nạp xong. `-1` là máy không có WebGL2 hoặc quá 2 phút chưa xong |
| `mang` | Loại mạng trình duyệt ước lượng: `4g`, `3g`… (chỉ Chrome trên Android có) |
| `may` | `dt` hoặc `mt` |

**Không gửi:** tên, tài khoản, mã đăng nhập, cookie, nội dung người dùng nhập (tên người thân, lời nhắn, gia phả…), phần sau `?` của đường dẫn.
Chữ nằm trong ngoặc kép trong lời báo lỗi bị thay bằng `"…"`, vì có lỗi (ví dụ `JSON.parse`) trích lại một đoạn dữ liệu đã lưu.
Lỗi đến từ tệp của trang khác hay của tiện ích trình duyệt bị bỏ.

**Không lưu IP.** Để chặn một máy gửi dồn dập, máy chủ tính `may = HMAC(TK_KHOA, 'td:' + ngày + ':' + IP)`, giữ 16 ký tự đầu.
Mã này đổi mỗi ngày và không đảo ngược ra IP được. Mỗi mã tối đa 30 bản ghi mỗi ngày, quá thì máy chủ vẫn trả 204 nhưng không lưu.

Máy chủ chỉ nhận yêu cầu từ chính trang Song Song (Origin cùng tên miền), kiểu `application/json`, thân tối đa 4 KB.
Trường lạ bị bỏ, sai kiểu bị bỏ, chữ dài bị cắt. Chữ được lưu nguyên dạng chữ thuần trong JSON, không bao giờ được đưa vào trang.
Chưa gắn D1 hoặc `TK_KHOA` (ví dụ bản xem trước của PR) thì máy chủ trả 204 và không lưu gì.

## Cách xem

Vào Cloudflare → **Storage & Databases → D1** → `songsong-gia-pha` → **Console**, dán một câu dưới đây rồi bấm **Execute**. Giờ hiển thị theo giờ Việt Nam.

**Lỗi hay gặp nhất 7 ngày qua:**

```sql
SELECT json_extract(du_lieu, '$.m') AS loi, json_extract(du_lieu, '$.f') AS tep, json_extract(du_lieu, '$.d') AS dong,
  COUNT(*) AS so_lan, COUNT(DISTINCT may) AS so_may_ngay,
  SUM(json_extract(du_lieu, '$.may') = 'dt') AS dien_thoai,
  datetime(MAX(luc) / 1000, 'unixepoch', '+7 hours') AS lan_cuoi
FROM theo_doi
WHERE loai = 'loi' AND luc > strftime('%s', 'now', '-7 days') * 1000
GROUP BY 1, 2, 3 ORDER BY so_lan DESC LIMIT 20;
```

`so_may_ngay`: số (máy, ngày) khác nhau gặp lỗi. Cùng một máy gặp lỗi hai ngày được đếm hai lần.

**Tốc độ trung vị và p75, theo máy tính / điện thoại, 7 ngày qua** (p75: 75% số lần mở trang nhanh hơn số này):

```sql
WITH t AS (
  SELECT json_extract(du_lieu, '$.may') AS thiet_bi, j.key AS chi_so, j.value AS v
  FROM theo_doi, json_each(theo_doi.du_lieu) AS j
  WHERE loai = 'toc-do' AND luc > strftime('%s', 'now', '-7 days') * 1000
    AND j.key IN ('ttfb', 'dom', 'tai', 'lcp', 'd3') AND j.value > 0
), x AS (
  SELECT thiet_bi, chi_so, v,
    ROW_NUMBER() OVER (PARTITION BY thiet_bi, chi_so ORDER BY v) AS r,
    COUNT(*) OVER (PARTITION BY thiet_bi, chi_so) AS n
  FROM t
)
SELECT thiet_bi, chi_so, MAX(n) AS so_lan,
  MIN(CASE WHEN r >= 0.5 * n THEN v END) AS trung_vi_ms,
  MIN(CASE WHEN r >= 0.75 * n THEN v END) AS p75_ms
FROM x GROUP BY thiet_bi, chi_so ORDER BY thiet_bi, chi_so;
```

Giá trị `0` và `-1` (không đo được) không tính vào.

**Một lỗi cụ thể, kèm vết gọi hàm:**

```sql
SELECT datetime(luc / 1000, 'unixepoch', '+7 hours') AS luc, du_lieu FROM theo_doi
WHERE loai = 'loi' AND json_extract(du_lieu, '$.m') LIKE '%chữ trong lời báo lỗi%'
ORDER BY luc DESC LIMIT 10;
```

## Áp migration lên D1 thật

**Trưởng nhóm áp, agent không tự áp.** Cần làm trên cả hai cơ sở dữ liệu (xem `docs/gia-pha-dong-ho.md`, mục "Đưa lên mạng"):
`songsong-gia-pha` (Production) và `songsong-gia-pha-thu` (Preview).

Cách 1, trên bảng điều khiển: mở **Console** của từng D1, dán toàn bộ nội dung `migrations/0002_theo_doi.sql`, bấm **Execute**.

Cách 2, bằng wrangler (đã đăng nhập tài khoản Cloudflare của Song Song, `wrangler.toml` có khối `[[d1_databases]]` với `migrations_dir = "migrations"`):

```
npx wrangler d1 migrations apply songsong-gia-pha --remote
npx wrangler d1 migrations apply songsong-gia-pha-thu --remote
```

Nếu đã từng áp `0001` bằng Console (không qua wrangler), wrangler không biết và sẽ chạy lại `0001`, báo lỗi bảng đã có. Khi đó dùng Cách 1.

Trước khi áp, trang vẫn chạy bình thường: máy chủ ghi lỗi `no such table` vào nhật ký của Cloudflare, trả 500 cho `/api/bao-loi`, người dùng không thấy gì.

## Chạy thử ở máy

Dựng máy chủ thử theo `docs/gia-pha-dong-ho.md`, mục "Chạy thử ở máy" (đã có `TK_KHOA` trong `.dev.vars`, đã áp migrations), rồi:

```
python3 tests/theo-doi.py http://localhost:8788 <thư mục wrangler>
```

Bài thử gửi yêu cầu tới `/api/bao-loi` rồi đọc thẳng tệp D1 cục bộ trong `<thư mục wrangler>/.wrangler/state/` để xem đã lưu gì.
