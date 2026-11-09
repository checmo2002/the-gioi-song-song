# Sửa cảnh sảnh chọn lối (chạy nền trên BẢN SAO .blend, không đụng file gốc):
#   blender -b sanh-goc-ban-sao.blend --python sua-sanh-v2.py -- <ra.blend> [anh-xem-truoc.png]
# 1. Hai tượng về đúng trục cổng chùa / cổng nhà thờ, quay mặt về lối vào sân (camera xoay tự do nên không quay theo camera ảnh nữa).
# 2. Khép khu sảnh thành công trình: tường hoa có mái ngói, cổng chính ở cuối lối vào, đèn đá dọc lối và mép sân,
#    hàng rào cây phía trong tường, rừng cây dày phía ngoài tường cho đất trống bên ngoài không còn trơ.
import bpy, bmesh, math, random, sys
from mathutils import Vector, Matrix

A = sys.argv[sys.argv.index('--') + 1:]
RA, ANH = A[0], (A[1] if len(A) > 1 else None)
random.seed(7)
sc = max(bpy.data.scenes, key=lambda s: len(s.objects))
for s in [x for x in bpy.data.scenes if x != sc]: bpy.data.scenes.remove(s)
col = sc.collection

def mat(ten):   # nướng dùng bảng màu theo tên vật liệu (BANG trong nuong-canh-3d.py)
    m = bpy.data.materials.get(ten) or bpy.data.materials.new(ten)
    return m

def them(ten, bm, m, loc=(0, 0, 0), rz=0):
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free()
    me.materials.append(mat(m))
    o = bpy.data.objects.new(ten, me); o.location = loc; o.rotation_euler.z = rz; col.objects.link(o); return o

def hop(ten, m, c, s, rz=0):   # khối hộp tâm c, cỡ s
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=Vector(s), verts=bm.verts)
    return them(ten, bm, m, c, rz)

def tru(ten, m, c, r, h, n=12, r2=None):   # trụ / nón, đáy tại c
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=n, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bmesh.ops.translate(bm, vec=Vector((0, 0, h / 2)), verts=bm.verts)
    return them(ten, bm, m, c)

def cau(ten, m, c, r, sub=2):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r)
    return them(ten, bm, m, c)

# ---- 1. hai tượng: dời cả cụm (bệ, hào quang, vòng sen / bụi quanh bệ) về trục cổng, xoay mặt về lối vào
def doi_cum(goc_cu, moi, huong_toi):
    c0 = Vector((goc_cu[0], goc_cu[1], 0)); c1 = Vector((moi[0], moi[1], 0))
    d = Vector((huong_toi[0] - moi[0], huong_toi[1] - moi[1], 0)).normalized()
    th = math.atan2(d.x, -d.y)   # mặt tượng ở rz=0 nhìn về -Y
    cum = [o for o in sc.objects if o.type == 'MESH' and (Vector((o.location.x, o.location.y, 0)) - c0).length < 4.6 and max(o.dimensions) < 9]
    rz0 = next(o.rotation_euler.z for o in cum if o.name.startswith('SS_'))
    R = Matrix.Rotation(th - rz0, 4, 'Z')
    for o in cum:
        v = R @ (Vector((o.location.x, o.location.y, 0)) - c0)
        o.location.x, o.location.y = c1.x + v.x, c1.y + v.y; o.rotation_euler.z += th - rz0
    print('CUM', [o.name for o in cum], round(math.degrees(th)))
doi_cum((-20, 14), (-14, 15), (0, -16))   # tượng Phật trước cổng tam quan chùa
doi_cum((20, 14), (14, 15), (0, -16))     # tượng Chúa trước cổng nhà thờ

# ---- 2. tường hoa mái ngói bao quanh, cổng chính
X, Y0, Y1, H = 48, -38, 52, 1.5
def tuong(a, b):   # đoạn tường từ a tới b (song song trục), cột mỗi ~6 m
    a, b = Vector((*a, 0)), Vector((*b, 0)); L = (b - a).length; d = (b - a).normalized(); rz = math.atan2(d.y, d.x)
    n = max(1, round(L / 6))
    for i in range(n):
        p, q = a + d * (L * i / n), a + d * (L * (i + 1) / n); m = (p + q) / 2; l = (q - p).length
        hop('tuongHoa', 'tuongTrang', (m.x, m.y, H / 2), (l, .45, H), rz)
        hop('maiTuong', 'ngoi', (m.x, m.y, H + .12), (l + .1, .85, .24), rz)
    for i in range(n + 1):
        p = a + d * (L * i / n)
        hop('cotTuong', 'cotTrang', (p.x, p.y, (H + .5) / 2), (.75, .75, H + .5), rz)
        hop('maiCot', 'ngoi', (p.x, p.y, H + .62), (1.0, 1.0, .25), rz)
tuong((-X, Y0), (-X, Y1)); tuong((X, Y0), (X, Y1))
tuong((-X, Y0), (-5.2, Y0)); tuong((5.2, Y0), (X, Y0))
# cổng chính: hai trụ lớn, mái hai tầng, biển vàng
for s in (-1, 1):
    hop('cotCong', 'cotTrang', (s * 4.2, Y0, 3.2), (1.4, 1.4, 6.4))
    hop('dinhCot', 'ngoi', (s * 4.2, Y0, 6.55), (1.8, 1.8, .3))
hop('maiCong', 'ngoi', (0, Y0, 7.0), (11.6, 2.6, .55)); hop('maiCong2', 'ngoi', (0, Y0, 7.6), (8.4, 1.6, .5))
hop('xaCong', 'sonDo', (0, Y0, 6.1), (7.2, .6, .7)); hop('bienCong', 'vang', (0, Y0 - .45, 5.15), (3.4, .12, 1.0))
hop('duongCong', 'latSanh', (0, (Y0 - 1.5 + -31.8) / 2, .03), (6, (-31.8) - (Y0 - 1.5), .06))   # nối lối vào ra tới cổng

# ---- đèn đá dọc lối vào và mép sân
def den(x, y):
    hop('deDen', 'da', (x, y, .15), (1.0, 1.0, .3)); hop('thanDen', 'da', (x, y, .9), (.36, .36, 1.2))
    hop('bauDen', 'den', (x, y, 1.82), (.72, .72, .64)); tru('maiDen', 'ngoi', (x, y, 2.14), .7, .5, 4, .05).rotation_euler.z = math.pi / 4
for y in (-36, -30, -24, -18): den(-4.4, y); den(4.4, y)
for y in (-13, -3, 7, 17): den(-27.6, y); den(27.6, y)

# ---- hàng rào cây phía trong tường, bồn hoa ở góc
def rao(a, b):
    a, b = Vector((*a, 0)), Vector((*b, 0)); L = (b - a).length; d = (b - a).normalized(); n = max(1, round(L / 5))
    for i in range(n):
        m = a + d * (L * (i + .5) / n)
        hop('hangRao', 'hangRao', (m.x, m.y, .5), (L / n - .8, 1.1, 1.0), math.atan2(d.y, d.x))
rao((-X + 1.6, -35), (-X + 1.6, 46)); rao((X - 1.6, -35), (X - 1.6, 46))
rao((-X + 2, Y0 + 1.6), (-8, Y0 + 1.6)); rao((8, Y0 + 1.6), (X - 2, Y0 + 1.6))
for x, y in ((-40, -31), (40, -31), (-12, -31), (12, -31)):
    tru('bonHoa', 'da', (x, y, 0), 2.2, .45, 16)
    for k in range(9):
        a = k / 9 * 6.283; r = 1.3 if k else 0
        cau('hoaBon', 'hong' if k % 2 else 'hongP', (x + r * math.cos(a), y + r * math.sin(a), .75), .5, 1)

# ---- rừng cây dày phía ngoài tường (đất trống bên ngoài)
def cay(x, y, s=1.0):
    tru('thanB', 'than', (x, y, 0), .32 * s, 2.6 * s, 8)
    for k in range(3):
        a = random.random() * 6.283; r = random.uniform(.4, 1.1) * s
        cau('tanS', random.choice(('la0', 'la1', 'la2')), (x + r * math.cos(a), y + r * math.sin(a), (3.4 + random.uniform(-.3, .6)) * s), random.uniform(1.5, 2.2) * s)
dat = []
def ok(x, y): return all((x - a) ** 2 + (y - b) ** 2 > 16 for a, b in dat)
for _ in range(4000):
    if len(dat) >= 90: break
    x, y = random.uniform(-78, 78), random.uniform(-62, 72)
    ngoai = abs(x) > X + 4 or y < Y0 - 4
    if not ngoai or abs(x) < 9 and y < Y0: continue   # chừa lối nhìn thẳng ra cổng
    if ok(x, y): dat.append((x, y)); cay(x, y, random.uniform(.9, 1.35))
print('CAY', len(dat))

bpy.ops.wm.save_as_mainfile(filepath=RA, copy=True)
print('LUU', RA)

if ANH:   # ảnh xem trước nhanh (Workbench, màu theo bảng nướng)
    import importlib.util
    BANG = {'tuongTrang': 'F4E4BA', 'ngoi': 'C87458', 'cotTrang': 'F2EBDD', 'da': 'CFC5B2', 'den': 'F5C87B', 'hangRao': '7FA650', 'hong': 'F29BB0', 'hongP': 'E2574C',
            'than': '9A6B45', 'la0': '7FA650', 'la1': '8CB35A', 'la2': '6F9847', 'sonDo': 'B9483A', 'vang': 'E3B150', 'latSanh': 'EEEAE2', 'co': '9DB96B', 'gach': 'F0D8B0'}
    for m in bpy.data.materials:
        h = BANG.get(m.name.split('.')[0])
        if h: m.diffuse_color = (*[int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], 1)
    cd = bpy.data.cameras.new('xem'); cd.lens = 28; c = bpy.data.objects.new('xem', cd); col.objects.link(c)
    c.location = (-62, -78, 48); c.rotation_euler = (math.radians(62), 0, math.radians(-38)); sc.camera = c
    sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'
    sc.display.shading.show_shadows = True; sc.render.resolution_x, sc.render.resolution_y = 1600, 1000; sc.render.filepath = ANH
    bpy.ops.render.render(write_still=True); print('ANH', ANH)
