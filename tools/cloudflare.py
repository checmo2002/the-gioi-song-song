#!/usr/bin/env python3
"""Dựng bản đưa lên Cloudflare Pages (songsong.bandolietsi.vn).
Cloudflare chạy lệnh này mỗi lần main đổi:  Build command: python3 tools/cloudflare.py   Build output directory: dist/cloudflare
Chỉ chép các tệp trang cần (index.html, css, js, data, img); không đưa docs, tools, tests lên mạng. Thêm _headers (cache, bảo mật)."""
import os, re, shutil, sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RA = os.path.join(GOC, 'dist', 'cloudflare')
CAN = ['index.html', 'css', 'js', 'data', 'img']

# Ảnh, mô hình 3D dùng tên cố định (không có mã băm): luôn hỏi lại máy chủ (ETag, chưa đổi thì 304, gần như không tốn).
# Không dùng stale-while-revalidate: nướng lại cảnh mà trình duyệt lấy canh.json cũ ghép với ảnh webp mới là cảnh vỡ nát.
HEADERS = """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN

/img/*
  Cache-Control: public, max-age=0, must-revalidate

/js/vendor/*
  Cache-Control: public, max-age=86400, stale-while-revalidate=2592000

/js/*
  Cache-Control: public, max-age=0, must-revalidate

/css/*
  Cache-Control: public, max-age=0, must-revalidate

/data/*
  Cache-Control: public, max-age=0, must-revalidate
"""

shutil.rmtree(RA, ignore_errors=True)
os.makedirs(RA)
for t in CAN:
    vao, ra = os.path.join(GOC, t), os.path.join(RA, t)
    (shutil.copytree if os.path.isdir(vao) else shutil.copy2)(vao, ra)
open(os.path.join(RA, '_headers'), 'w').write(HEADERS)

# tự kiểm: mọi css/js/data mà index.html nạp đều có trong bản dựng
html = open(os.path.join(RA, 'index.html'), encoding='utf-8').read()
thieu = [p for p in re.findall(r'(?:href|src)="((?:css|js|data|img)/[^"?#]+)"', html) if not os.path.exists(os.path.join(RA, p))]
if thieu:
    sys.exit('Thiếu tệp: ' + ', '.join(thieu))
n = sum(len(f) for _, _, f in os.walk(RA))
lon = max((os.path.getsize(os.path.join(d, f)), f) for d, _, fs in os.walk(RA) for f in fs)
assert n < 20000 and lon[0] < 25 * 1024 * 1024, 'vượt giới hạn Cloudflare Pages (20.000 tệp, 25 MB mỗi tệp)'
print(f'đã dựng {RA}: {n} tệp, lớn nhất {lon[1]} {lon[0] // 1024} KB')
