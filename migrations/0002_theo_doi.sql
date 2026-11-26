-- Theo dõi lỗi và tốc độ tải trang (docs/theo-doi.md). Giữ 30 ngày.
-- Không lưu IP: may = HMAC(TK_KHOA, ngày + IP) cắt 16 ký tự, đổi mỗi ngày, chỉ dùng để giới hạn 30 bản ghi mỗi máy mỗi ngày.
CREATE TABLE theo_doi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  luc INTEGER NOT NULL,                                   -- mili giây (Date.now())
  loai TEXT NOT NULL CHECK (loai IN ('loi', 'toc-do')),
  may TEXT NOT NULL,
  du_lieu TEXT NOT NULL CHECK (json_valid(du_lieu))       -- các trường đã lọc theo danh sách trắng (functions/api/bao-loi.js)
);
CREATE INDEX theo_doi_may ON theo_doi(may, luc);
CREATE INDEX theo_doi_luc ON theo_doi(luc);
