#!/usr/bin/env python3
# Dùng: python3 tools/lap-den-anh-nuong.py vao.webp ra.webp   (cần Pillow, numpy, scipy)
# Lấp vùng đen chưa nướng trong ảnh nướng sáng bằng màu điểm có màu gần nhất (dilation), để mip không loang đen ra mép.
import sys, numpy as np
from PIL import Image
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB'))
mx = a.max(2)
den = mx < 10
vien = ndimage.binary_dilation(den, iterations=2) & (mx < 30)   # mép răng cưa nửa đen nửa màu
bo = den | vien
_, (iy, ix) = ndimage.distance_transform_edt(bo, return_indices=True)
b = a[iy, ix]
Image.fromarray(b).save(dst, 'WEBP', quality=88, method=6)
c = np.asarray(Image.open(dst).convert('RGB'))
print(src, 'lấp %.1f%%' % (bo.mean()*100), 'còn đen %.3f%%' % ((c.max(2) < 10).mean()*100))
