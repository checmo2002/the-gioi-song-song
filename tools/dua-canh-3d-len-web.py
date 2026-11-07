#!/usr/bin/env python3
"""Đưa kết quả nướng một cảnh (nuong-<cảnh>.py trong Blender) vào img/3d/<cảnh>/ cho web.
Dùng: python3 tools/dua-canh-3d-len-web.py <thư mục nướng> <cảnh>        (cần Pillow, numpy, scipy)
- canh.glb, cay.glb, tuong.glb (nếu có) -> .json nhúng base64 (bản thử trên claude.ai không phục vụ đuôi .glb)
- nen/vat-*.png -> webp, lấp vùng đen chưa nướng bằng màu điểm gần nhất (không lấp thì thu nhỏ bị lem viền đen nhấp nháy),
  bản 2048 (-2k) cho điện thoại; vat-0, vat-3 giữ thêm bản 4096 cho máy tính."""
import sys, os, json, struct, base64
import numpy as np
from PIL import Image
from scipy import ndimage

vao, canh = sys.argv[1], sys.argv[2]
ra = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'img', '3d', canh)
os.makedirs(ra, exist_ok=True)

def glb2json(src, dst):
    b = open(src, 'rb').read(); assert b[:4] == b'glTF'
    o, j, bin_ = 12, None, b''
    while o < len(b):
        L, T = struct.unpack('<II', b[o:o + 8]); d = b[o + 8:o + 8 + L]; o += 8 + L
        if T == 0x4E4F534A: j = json.loads(d)
        elif T == 0x004E4942: bin_ = d
    j['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(bin_).decode()
    json.dump(j, open(dst, 'w'), separators=(',', ':'))
    print(os.path.basename(dst), os.path.getsize(dst))

def lap_den(a):
    mx = a.max(2); den = mx < 10
    bo = den | (ndimage.binary_dilation(den, iterations=2) & (mx < 30))   # cả mép răng cưa nửa đen nửa màu
    if not bo.any() or bo.all(): return a
    _, (iy, ix) = ndimage.distance_transform_edt(bo, return_indices=True)
    return a[iy, ix]

for t in ('canh', 'cay', 'tuong'):
    p = os.path.join(vao, t + '.glb')
    if os.path.exists(p): glb2json(p, os.path.join(ra, t + '.json'))
for t in ('nen', 'vat-0', 'vat-1', 'vat-3'):
    p = os.path.join(vao, t + '.png')
    if not os.path.exists(p): continue
    im = Image.fromarray(lap_den(np.asarray(Image.open(p).convert('RGB'))))
    (im if im.size[0] <= 2048 else im.resize((2048, 2048), Image.LANCZOS)).save(os.path.join(ra, t + '-2k.webp'), quality=88, method=6)
    if t in ('vat-0', 'vat-3') and im.size[0] > 2048: im.save(os.path.join(ra, t + '.webp'), quality=88, method=6)
    print(t, im.size)
