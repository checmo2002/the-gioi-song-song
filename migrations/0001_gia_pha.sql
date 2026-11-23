-- Gia phả dòng họ trên máy chủ (docs/gia-pha-dong-ho.md)
CREATE TABLE nguoi_dung (
  id TEXT PRIMARY KEY,
  ten TEXT NOT NULL,
  lien_he TEXT NOT NULL UNIQUE,      -- số điện thoại hoặc email, đã chuẩn hoá chữ thường
  mk_bam TEXT NOT NULL,              -- PBKDF2-SHA256, base64
  mk_muoi TEXT NOT NULL,
  tao INTEGER NOT NULL
);
CREATE TABLE phien (
  ma_bam TEXT PRIMARY KEY,           -- SHA-256 của mã phiên trong cookie
  nguoi_id TEXT NOT NULL REFERENCES nguoi_dung(id),
  het INTEGER NOT NULL
);
CREATE TABLE dang_nhap_sai (
  lien_he TEXT PRIMARY KEY,
  lan INTEGER NOT NULL,
  tu INTEGER NOT NULL                -- mốc bắt đầu đếm
);
CREATE TABLE dong_ho (
  id TEXT PRIMARY KEY,
  ten TEXT NOT NULL,
  tao_boi TEXT NOT NULL REFERENCES nguoi_dung(id),
  tao INTEGER NOT NULL,
  cay TEXT NOT NULL,
  phien_ban INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE thanh_vien (
  dong_ho_id TEXT NOT NULL REFERENCES dong_ho(id),
  nguoi_id TEXT NOT NULL REFERENCES nguoi_dung(id),
  vai TEXT NOT NULL CHECK (vai IN ('truong', 'duyet', 'thanh-vien')),
  vao INTEGER NOT NULL,
  PRIMARY KEY (dong_ho_id, nguoi_id)
);
CREATE INDEX thanh_vien_nguoi ON thanh_vien(nguoi_id);
CREATE TABLE loi_moi (
  ma_bam TEXT PRIMARY KEY,           -- SHA-256 của mã mời
  dong_ho_id TEXT NOT NULL REFERENCES dong_ho(id),
  tao_boi TEXT NOT NULL,
  het INTEGER NOT NULL
);
CREATE TABLE de_xuat (
  id TEXT PRIMARY KEY,
  dong_ho_id TEXT NOT NULL REFERENCES dong_ho(id),
  nguoi_id TEXT NOT NULL REFERENCES nguoi_dung(id),
  cay TEXT NOT NULL,
  phien_ban_goc INTEGER NOT NULL,
  ghi_chu TEXT,
  trang_thai TEXT NOT NULL DEFAULT 'cho' CHECK (trang_thai IN ('cho', 'duyet', 'tu-choi')),
  ly_do TEXT,
  tao INTEGER NOT NULL,
  xu_ly_boi TEXT,
  xu_ly_luc INTEGER
);
CREATE INDEX de_xuat_dong_ho ON de_xuat(dong_ho_id, trang_thai);
