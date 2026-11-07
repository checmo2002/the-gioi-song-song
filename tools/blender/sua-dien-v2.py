# Làm lại cảnh chùa trên đỉnh núi (chính điện). Chạy nền trên BẢN SAO .blend, không đụng file gốc:
#   blender -b dien-goc-ban-sao.blend --python sua-dien-v2.py -- <ra.blend> <ra-du-lieu.json> [anh-xem-truoc.png]
# 1. Nâng cả chùa lên đỉnh núi (P mét), dựng sườn núi, cầu thang đá đi xuống phía nam (bản cũ bậc chìm dưới đất).
# 2. Chính điện có mái hai tầng (tên SS_Mai*: xuất riêng, web làm mờ khi "Bạn" bước vào điện), xà, cột hiên.
# 3. Chia khu: sân trước thắp nhang (lư hương đỉnh đồng), lễ Phật (chiếu trước tượng), góc tụng kinh gõ mõ,
#    lầu chuông (thỉnh chuông), lầu trống, cội bồ đề ngồi tĩnh tâm.
# 4. Cảnh tịnh tâm: hồ sen dưới thác, suối chảy qua cầu đá đổ xuống sườn núi, tháp, rừng tre, thông, mây quanh núi.
# 5. Tính lưới đi 144x96 theo ảnh iso và vị trí các nút, ghi ra JSON cho js/04-00.
import bpy, bmesh, math, random, sys, json
from mathutils import Vector, Matrix
from bpy_extras.object_utils import world_to_camera_view as w2c

A = sys.argv[sys.argv.index('--') + 1:]
RA, RA_JSON, ANH = A[0], A[1], (A[2] if len(A) > 2 else None)
random.seed(11)
sc = max(bpy.data.scenes, key=lambda s: len(s.objects))
for s in [x for x in bpy.data.scenes if x != sc]: bpy.data.scenes.remove(s)
col = sc.collection
bpy.context.view_layer.update()
P = 6.0   # độ cao đỉnh núi (mặt sân chùa)

def mat(ten, hexc='CCCCCC'):
    m = bpy.data.materials.get(ten)
    if m: return m
    m = bpy.data.materials.new(ten); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*[(int(hexc[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1); return m
def them(ten, bm, m, loc=(0, 0, 0), rz=0):
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m if not isinstance(m, str) else mat(m))
    o = bpy.data.objects.new(ten, me); o.location = loc; o.rotation_euler.z = rz; col.objects.link(o); return o
def hop(ten, m, c, s, rz=0, rx=0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=Vector(s), verts=bm.verts)
    o = them(ten, bm, m, c, rz); o.rotation_euler.x = rx; return o
def tru(ten, m, c, r, h, n=12, r2=None):
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=n, radius1=r, radius2=r if r2 is None else r2, depth=h)
    bmesh.ops.translate(bm, vec=Vector((0, 0, h / 2)), verts=bm.verts); o = them(ten, bm, m, c)
    for p in o.data.polygons: p.use_smooth = True
    return o
def cau(ten, m, c, r, sub=2, sz=1):
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=r); bmesh.ops.scale(bm, vec=(1, 1, sz), verts=bm.verts)
    o = them(ten, bm, m, c)
    for p in o.data.polygons: p.use_smooth = True
    return o
def mai(ten, m, c, w, d, h, over, ridge=.55, rz=0, cong=.3):   # mái chồng diêm: bốn góc cong vút lên
    bm = bmesh.new(); W, D, R = w / 2 + over, d / 2 + over, w / 2 * ridge
    v = [bm.verts.new(p) for p in [(-W, -D, cong), (W, -D, cong), (W, D, cong), (-W, D, cong), (-R, 0, h), (R, 0, h)]]
    for f in [(0, 1, 5, 4), (2, 3, 4, 5), (1, 2, 5), (3, 0, 4)]: bm.faces.new([v[i] for i in f])
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=.22)
    return them(ten, bm, m, c, rz)

# ---- vật liệu (tên theo bảng màu nướng BANG trong nuong-canh-3d.py)
DA, DAT, NGOI, SON, VANG, GO = mat('da'), mat('daTrang', 'ECE6DA'), mat('ngoi', 'C87458'), mat('sonDo', 'B9483A'), mat('vangKim', 'E3B150'), mat('goDien', '8E3F2E')
TT, COT, DEN, GACH, CO2 = mat('tuongTrang', 'F4E4BA'), mat('cotTrang', 'F2EBDD'), mat('den', 'F5C87B'), mat('gach', 'F0D8B0'), mat('co2', '8FAF5F')
NUOC, NUOCT, SEN, HONG, HONGP = mat('nuoc', '80B7B1'), mat('nuocTrang', 'CFE8E6'), mat('sen', 'F2A8B5'), mat('hong', 'F29BB0'), mat('hongP', 'E2574C')
LA = [mat('la0', '7FA650'), mat('la1', '8CB35A'), mat('la2', '6F9847')]; THAN, LATRE, TRE = mat('than', '9A6B45'), mat('laTre', '9BBE62'), mat('tre', 'A7C46C')
MAY, DEM, BACH = mat('trang', 'FAF3E3'), mat('demDo', 'C8463A'), mat('bach', '5F8A42')
MAI = mat('maiNgoi', 'C87458'); MAIV = mat('maiVang', 'E3B150'); MAIT = mat('maiTuong', 'F0CC80')   # mái xuất riêng (SS_): màu phẳng
DAX = bpy.data.materials.get('daX') or DA

# ---- 1. địa hình đỉnh núi: siêu elip phẳng ở giữa, rơi dần ra ngoài; dải bậc thang phía nam cắt theo bậc
X0, YS, YN = 30.0, 21.0, 25.0
TOP, DAY, NB = -18.6, -37.0, 25   # bậc: đỉnh y, chân y, số bậc
def zbac(y): return max(0.0, P * (y - DAY) / (TOP - DAY)) if y < TOP else P
def r_elip(x, y): return ((abs(x) / X0) ** 4 + (abs(y) / (YS if y < 0 else YN)) ** 4) ** .25
def Hn(x, y):
    r = r_elip(x, y); h = P if r <= 1 else P * max(0, 1 - (r - 1) / .85) ** 1.5
    h += (.35 * math.sin(x * .31) * math.cos(y * .27)) * (0 if r < 1 else min(1, (r - 1) * 4))
    if y < TOP + 1:   # dải bậc thang: mặt đất theo bậc, mép hai bên vuốt dần
        k = min(1, max(0, (abs(x) - 3.6) / 5)); h = zbac(y) * (1 - k) + h * k - (.05 if abs(x) < 3.6 else 0)
    return max(0, h)
def doi_z(o):   # nâng vật theo địa hình mới
    x, y = o.matrix_world.translation.x, o.matrix_world.translation.y
    o.location.z += P if r_elip(x, y) <= 1 else Hn(x, y)

# dọn: bậc chìm cũ, lan can cũ, sân đá cũ; cây/đá cũ nằm trên mặt bằng đỉnh núi (thay bằng cảnh mới)
XOA = {'bac', 'lc', 'sanDa'}
for o in list(sc.objects):
    if o.type != 'MESH' or o.parent: continue
    b = o.name.split('.')[0]; x, y = o.location.x, o.location.y
    trong_dien = abs(x) < 13.2 and -6.6 < y < 14.2
    if b in XOA or (b in ('cay', 'daN') and r_elip(x, y) < 1.12 and not trong_dien) or (b in ('cot', 'chanCot') and abs(abs(x) - 4) < .1):
        bpy.data.objects.remove(o)   # hàng cột giữa (x = ±4) bỏ: lối giữa điện thoáng, thấy rõ khu lễ Phật
for o in sc.objects:
    if o.parent is None and o.type in ('MESH', 'EMPTY') and o.name.split('.')[0] != 'dat': doi_z(o)
for o in sc.objects:
    if o.type == 'LIGHT' and o.data.type != 'SUN': o.location.z += P

bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=110, y_segments=110, size=55)
for v in bm.verts: v.co.y += 2; v.co.z = Hn(v.co.x, v.co.y)
nui = them('nui', bm, CO2)
for p in nui.data.polygons: p.use_smooth = True
# vách đá lộ quanh sườn
for i in range(34):
    a = random.uniform(0, 6.283); rr = random.uniform(1.12, 1.5); x, y = math.cos(a) * X0 * rr, math.sin(a) * (YS if math.sin(a) < 0 else YN) * rr
    if abs(x) < 7 and y < 0: continue
    cau('daNui', DAX, (x, y, Hn(x, y) - .35), random.uniform(.9, 1.7), 1, .55)

# ---- 2. cầu thang đá xuống núi (cùng kiểu chân núi): bậc mũi sáng, tường má mái ngói, trụ búp vàng, đèn đá
ys = [TOP - i * (TOP - DAY) / NB for i in range(NB + 1)]
zp = None
for i, y in enumerate(ys):
    z = zbac(y)
    hop('bac', DA, (0, y, z / 2), (5, (TOP - DAY) / NB + .12, max(.2, z))); hop('matBac', DAT, (0, y - .05, z + .04), (5, (TOP - DAY) / NB + .08, .08))
    zt = z + .6
    for sx in (-1, 1):
        hop('maTuong', TT, (sx * 2.85, y, zt / 2), (.5, (TOP - DAY) / NB + .06, zt))
        if zp is not None:
            dy = (TOP - DAY) / NB; dz = zp - zt; L = math.hypot(dy, dz)
            hop('maMai', NGOI, (sx * 2.85, y + dy / 2, (zt + zp) / 2 + .12), (.72, L + .06, .16), rx=-math.atan2(dz, dy))
        if i % 6 == 0:
            hop('truLan', COT, (sx * 2.85, y, (z + 1.35) / 2), (.72, .72, z + 1.35)); tru('chopTru', NGOI, (sx * 2.85, y, z + 1.35), .5, .28, 4, .08).rotation_euler.z = math.pi / 4
            cau('bupTru', VANG, (sx * 2.85, y, z + 1.75), .16, 1)
    zp = zt
# lan can đá quanh mép sân chùa phía nam (chừa lối xuống thang)
for sx in (-1, 1):
    for k in range(6):
        x = sx * (4.6 + k * 2.6); hop('lanCan', TT, (x, -18.4, P + .45), (2.4, .4, .9)); hop('lanCanMai', NGOI, (x, -18.4, P + .96), (2.6, .62, .14))
        hop('truLan', COT, (x + sx * 1.3, -18.4, P + .6), (.6, .6, 1.2)); cau('bupTru', VANG, (x + sx * 1.3, -18.4, P + 1.32), .14, 1)

# ---- 3. sân trước (khu thắp nhang): sân gạch lớn, lư hương đỉnh đồng dời ra giữa sân, đèn đá
hop('sanTruoc', GACH, (0, -12.1, P + .03), (34, 12.2, .06))
hop('loiLen', DA, (0, -17.9, P + .035), (5.4, 1.4, .07))
LH = ['lhDe', 'lhT', 'lhNap', 'quai', 'quai.001', 'nhangL', 'nhangL.001', 'nhangL.002']
for n in LH:
    o = bpy.data.objects.get(n)
    if o: o.location.y += -12.0 - 2.2; o.location.z += -.36   # đứng trên nền đá nenLh
tru('nenLh', DA, (0, -12, P + .06), 2.4, .12, 32)
for x, y in ((-3.4, -15.6), (3.4, -15.6), (-3.4, -8.4), (3.4, -8.4)):
    tru('deDen', DA, (x, y, P + .06), .45, .3, 8); tru('thanDen', DA, (x, y, P + .36), .18, 1.0, 8); hop('bauDen', DEN, (x, y, P + 1.62), (.66, .66, .55))
    tru('maiDen', NGOI, (x, y, P + 1.9), .62, .45, 4, .05).rotation_euler.z = math.pi / 4

# lầu chuông (đông) và lầu trống (tây): nền đá, 4 cột, mái hai tầng; dời chuông / trống cũ trong điện ra
def lau(cx, cy, ten):
    hop('nenLau', DA, (cx, cy, P + .25), (5.6, 5.6, .5))
    for i in range(3): hop('bacLau', DA, (cx, cy - 3.0 - i * .32, P + .08 + i * .1), (2.4, .4, .16 + i * .2))
    for sx in (-1, 1):
        for sy in (-1, 1): tru('cotLau', SON, (cx + sx * 2.1, cy + sy * 2.1, P + .5), .2, 4.4, 10)
    hop('xaLau', GO, (cx, cy, P + 4.95), (4.8, 4.8, .3))
    mai('maiLau1', NGOI, (cx, cy, P + 5.0), 4.4, 4.4, 1.0, 1.0, ridge=.2); hop('tangLau', TT, (cx, cy, P + 6.3), (2.6, 2.6, 1.2))
    mai('maiLau2', NGOI, (cx, cy, P + 6.85), 2.8, 2.8, 1.5, .8, ridge=.0); cau('ngocLau', VANG, (cx, cy, P + 8.45), .22, 1)
lau(12.5, -12.0, 'chuong'); lau(-12.5, -12.0, 'trong')
for n, (dx, dy) in {'chuong': (2.3, -22.6), 'gia.002': (2.3, -22.6), 'gia.003': (2.3, -22.6), 'giaN.001': (2.3, -22.6),
                    'trong': (-2.3, -22.6), 'gia': (-2.3, -22.6), 'gia.001': (-2.3, -22.6), 'giaN': (-2.3, -22.6)}.items():
    o = bpy.data.objects.get(n)
    if o: o.location.x += dx; o.location.y += dy; o.location.z += .0

# ---- 4. chính điện: cột hiên, xà, mái hai tầng (SS_Mai*), khu lễ Phật, góc tụng kinh gõ mõ
for x, y in ((-12.3, -5.7), (12.3, -5.7), (-12.3, 4.0), (-12.3, 10.0), (-8, -5.7), (8, -5.7)):
    hop('chanCotH', DA, (x, y, P + .69), (.9, .9, .3)); tru('cotHien', SON, (x, y, P + .54), .3, 5.6, 14)
for y in (-5.7, -3, 4, 10, 13.3): hop('xa', GO, (0, y, P + 6.25), (25.6, .34, .42))
for x in (-12.3, -8, 8, 12.3): hop('xaD', GO, (x, 3.8, P + 6.55), (.34, 19.4, .34))
mai('SS_Mai1', MAI, (0, 3.8, P + 6.4), 25.8, 19.8, 2.8, 1.5, ridge=.62, cong=.55)
hop('SS_MaiTuong', MAIT, (0, 4.2, P + 8.6), (15.5, 8.6, 1.6))
for x in (-6, -2, 2, 6): hop('SS_MaiCua', MAI, (x, -.12, P + 8.6), (1.4, .1, 1.0))
mai('SS_Mai2', MAI, (0, 4.2, P + 9.35), 15.5, 8.6, 2.6, 1.2, ridge=.5, cong=.45)
hop('SS_MaiNoc', MAIV, (0, 4.2, P + 12.0), (8.2, .35, .3))
cau('SS_MaiNgoc', MAIV, (0, 4.2, P + 12.55), .42, 2)
for sx in (-1, 1):
    hop('SS_MaiRong', MAIV, (sx * 4.3, 4.2, P + 12.35), (.9, .3, .55)); hop('SS_MaiDuoi', MAIV, (sx * 4.65, 4.2, P + 12.8), (.3, .3, .7))
    for sy in (-1, 1): cau('SS_MaiGoc', MAIV, (sx * 14.4, 3.8 + sy * 11.3, P + 7.25), .28, 1)

# khu lễ Phật: ba chiếu lễ giữa lối trước bàn thờ
for x in (-1.5, 0, 1.5): hop('chieuLe', DEM, (x, 3.9, P + .58), (1.2, .9, .04))
# góc tụng kinh: mõ lớn dời sang gian trái, bồ đoàn quanh, kệ kinh sát tường
MO = ['don', 'donV', 'chanDon', 'chanDon.001', 'chanDon.002', 'chanDon.003', 'dem', 'mo', 'mieng', 'loMieng', 'loMieng.001', 'quai.002', 'duiCan', 'duiDau']
for n in MO:
    o = bpy.data.objects.get(n)
    if o: o.location.x += -6.0; o.location.y += -.15
for x, y in ((-10.9, 5.9), (-8.6, 5.9), (-10.9, 9.0), (-8.6, 9.0)): tru('boDoanK', DEM, (x, y, P + .54), .42, .18, 16)
hop('keKinh', GO, (-12.0, 7.6, P + 1.3), (.5, 2.4, 1.5))
for k in range(5): hop('kinh', VANG if k % 2 else DEM, (-11.9, 6.7 + k * .45, P + 1.62), (.36, .3, .5))
hop('tamThamMo', DEM, (-9.6, 7.6, P + .55), (4.6, 5.2, .02))
# gian phải: lọ sen và chậu cảnh
for y in (5.5, 9.5):
    tru('loSen', VANG, (9.8, y, P + .54), .32, .9, 16, .22)
    for k in range(5): cau('sen', SEN, (9.8 + random.uniform(-.25, .25), y + random.uniform(-.25, .25), P + 1.6 + random.uniform(0, .4)), .16, 1)
tru('chauCanh', SON, (10.4, 7.5, P + .54), .5, .5, 16, .4); cau('cayCanh', LA[1], (10.4, 7.5, P + 1.45), .7, 2, .7)

# ---- 5. cảnh tịnh tâm
# hồ sen dưới thác (đông bắc): mặt nước, bờ đá, lá sen, hoa sen
HX, HY = 21.0, 9.0
bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=48, radius=1); bmesh.ops.scale(bm, vec=(5.4, 4.2, 1), verts=bm.verts)
them('ho', bm, NUOC, (HX, HY, P + .06))
for k in range(40):
    a = k / 40 * 6.283; cau('daBo', DAX, (HX + math.cos(a) * 5.8, HY + math.sin(a) * 4.6, P + .1), random.uniform(.45, .8), 1, .55)
for k in range(16):
    a = random.uniform(0, 6.283); r = random.uniform(.2, .8); x, y = HX + math.cos(a) * r * 4.4, HY + math.sin(a) * r * 3.2
    tru('laSen', LA[1], (x, y, P + .1), random.uniform(.45, .75), .03, 12)
    if k % 3 == 0: cau('hoaSen', SEN, (x + .2, y, P + .38), .22, 1, 1.3)
# vách đá và thác nước đổ xuống hồ
for k in range(26):
    x = random.uniform(16, 27); y = random.uniform(13.8, 20); z = P + random.uniform(0, 7) * (1 - abs(x - 21.5) / 7)
    cau('vachDa', DAX, (x, y, z), random.uniform(1.6, 2.8), 1, .8)
hop('thacNuoc', NUOCT, (21.0, 13.4, P + 3.6), (2.4, .25, 7.2)).rotation_euler.x = math.radians(12)
for k in range(9): cau('botNuoc', MAY, (21.0 + random.uniform(-1.3, 1.3), 12.3 + random.uniform(-.5, .5), P + .3), random.uniform(.3, .55), 1, .6)
# suối từ hồ chảy về phía đông nam, qua cầu đá, đổ xuống sườn núi
SUOI = [(24.6, 5.4), (25.0, 1.2), (24.0, -3.2), (25.8, -7.8), (28.2, -12.5), (30.5, -15.5)]
for (x1, y1), (x2, y2) in zip(SUOI, SUOI[1:]):
    L = math.hypot(x2 - x1, y2 - y1); a = math.atan2(y2 - y1, x2 - x1); zz = min(Hn(x1, y1), Hn(x2, y2))
    hop('suoi', NUOC, ((x1 + x2) / 2, (y1 + y2) / 2, zz + .05), (L + .6, 1.8, .06), rz=a)
    for t in (.15, .5, .85):
        for s in (-1, 1):
            px, py = x1 + (x2 - x1) * t - math.sin(a) * s * 1.25, y1 + (y2 - y1) * t + math.cos(a) * s * 1.25
            cau('daSuoi', DAX, (px, py, Hn(px, py) + .08), random.uniform(.3, .55), 1, .6)
hop('thacNuoc2', NUOCT, (31.6, -17.0, P * .55), (1.6, .2, P * 1.05)).rotation_euler.x = math.radians(35)
# cầu đá vòm qua suối, lối đá từ sân trước sang hồ
for k in range(7):
    t = (k - 3) / 3; hop('cauDa', DA, (24.4 + t * 1.8, -3.0, P + .25 + .45 * (1 - t * t)), (.7, 2.0, .18))
for sy in (-1, 1): hop('lanCanCau', TT, (24.4, -3.0 + sy * .95, P + .7), (4.4, .18, .4))
for k in range(8):
    x = 17.5 + k * .9; hop('loiDa', DA, (x, -6.6 + k * .45, P + .05), (.8, .8, .07), rz=.3)
# cội bồ đề + đá ngồi thiền (tây): khu ngồi tĩnh tâm
BX, BY = -19.0, 5.5
tru('bd', THAN, (BX, BY, P), 1.0, 4.0, 14, .7)
for k in range(6):
    a = k * 1.05; tru('bd', THAN, (BX + math.cos(a) * 1.5, BY + math.sin(a) * 1.5, P), .18, 2.6, 8, .06).rotation_euler = (math.sin(a) * .35, -math.cos(a) * .35, 0)
for k in range(26): cau('tanBd', LA[k % 3], (BX + random.uniform(-4.5, 4.5), BY + random.uniform(-4, 4), P + 4.8 + random.uniform(0, 3.0)), random.uniform(1.5, 2.4), 2, .8)
hop('daThien', DA, (BX + .4, BY - 3.6, P + .2), (2.4, 1.7, .4), rz=.12); tru('boDoanT', DEM, (BX + .4, BY - 3.6, P + .4), .45, .16, 16)
hop('gheDa', DA, (BX - 3.2, BY - 2.8, P + .45), (2.2, .6, .14)); hop('gheDaC', DA, (BX - 3.2, BY - 2.8, P + .2), (1.6, .4, .4))
hop('gheDa', DA, (28.0, -2.6, P + .45), (.6, 2.2, .14)); hop('gheDaC', DA, (28.0, -2.6, P + .2), (.4, 1.6, .4))   # ghế đá ngắm biển mây bên kia cầu
for k in range(9):   # lối đá từ sân sang gốc bồ đề
    hop('loiDa', DA, (-17.5 + k * .1, -6.2 + k * .62, P + .05), (.8, .8, .07), rz=-.2)
# tháp đá năm tầng (tây bắc)
TX_, TY_ = -21.5, 15.5
for k in range(5):
    w = 3.0 - k * .45; hop('thap', TT, (TX_, TY_, P + .5 + k * 1.25), (w, w, 1.0)); mai('thapMai', NGOI, (TX_, TY_, P + 1.0 + k * 1.25), w, w, .35, .25, ridge=0)
tru('thapChop', VANG, (TX_, TY_, P + 6.8), .25, 1.4, 8, .02)
# rừng tre (tây bắc) và thông quanh mép đỉnh núi, xuống sườn
def tre(x, y):
    for j in range(7):
        tru('tre', TRE, (x + random.uniform(-.8, .8), y + random.uniform(-.8, .8), Hn(x, y)), .07, random.uniform(5.5, 7.5), 6, .05)
    for j in range(6): cau('tre', LATRE, (x + random.uniform(-1, 1), y + random.uniform(-1, 1), Hn(x, y) + random.uniform(4.2, 6.6)), random.uniform(.8, 1.2), 1, 1.5)
for k in range(10): tre(random.uniform(-28, -15), random.uniform(18.5, 24))
def thong(x, y, s=1.0):
    z = Hn(x, y); tru('cay', THAN, (x, y, z), .25 * s, 2.0 * s, 8, .18 * s)
    for k in range(3): tru('cay', LA[2], (x, y, z + (1.4 + k * 1.15) * s), (1.7 - k * .45) * s, 1.8 * s, 10, .05)
n = 0
while n < 70:
    a = random.uniform(0, 6.283); rr = random.uniform(.9, 1.6); x, y = math.cos(a) * X0 * rr, math.sin(a) * (YS if math.sin(a) < 0 else YN) * rr
    if (abs(x) < 8 and y < 0) or (abs(x) < 21 and y < -13) or (13 < x < 28 and 11 < y < 21) or (x > 22 and -18 < y < 8) or (-30 < x < -13 and 13 < y < 24): continue
    thong(x, y, random.uniform(.9, 1.4)); n += 1
for x, y in ((-27, -2), (27, 12), (-8, 18.5), (8, 18.5), (-26, 10), (14, 20)): thong(x, y, 1.2)
# bồn hoa quanh sân trước
for x, y in ((-8, -16.6), (8, -16.6), (-16.4, -7), (16.4, -7)):
    tru('bonHoa', DA, (x, y, P), 1.5, .4, 16)
    for k in range(8): a = k / 8 * 6.283; cau('hoaBon', HONG if k % 2 else HONGP, (x + math.cos(a) * .85, y + math.sin(a) * .85, P + .62), .34, 1)
# biển mây quanh sườn núi và núi đá vôi xa
for k in range(48):
    a = random.uniform(0, 6.283); rr = random.uniform(1.5, 2.2); x, y = math.cos(a) * X0 * rr, math.sin(a) * (YS if math.sin(a) < 0 else YN) * rr
    if abs(x) < 6 and y < -20: continue
    for j in range(3): cau('may', MAY, (x + random.uniform(-2.5, 2.5), y + random.uniform(-2, 2), random.uniform(.6, 2.6)), random.uniform(2, 3.6), 2, .5)
for x, y, h in ((-46, 30, 20), (44, 34, 24), (-52, -8, 16), (54, 6, 18), (0, 52, 26), (-30, 50, 18), (30, 52, 20)):
    tru('nuiDa', DAX, (x, y, 0), h * .45, h, 18, h * .07)
    for k in range(int(h * .6)):
        a = random.random() * 6.283; t = random.uniform(.1, .75); rr = h * .45 * (1 - t * .9)
        cau('cay', LA[k % 3], (x + math.cos(a) * rr, y + math.sin(a) * rr, h * t), random.uniform(1.2, 2.0), 1)

# ---- 6. camera ảnh iso (web đổi toạ độ ảnh <-> 3D theo camera này) và nắng
cam = next((o for o in sc.objects if o.type == 'CAMERA'), None)
if cam is None:
    cam = bpy.data.objects.new('camIso', bpy.data.cameras.new('camIso')); col.objects.link(cam); cam.data.type = 'ORTHO'
TG, OW = Vector((0, -2.5, P)), 66.0
el, az = math.radians(42), math.radians(-38); fw = Vector((-math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), -math.sin(el)))
cam.location = TG - fw * 160; cam.rotation_euler = (-fw).to_track_quat('Z', 'Y').to_euler(); cam.data.ortho_scale = OW; sc.camera = cam
sc.render.resolution_x, sc.render.resolution_y = 3600, 2400
sc['cao_max'] = P + 3.5   # nuong-canh-3d.py: lưới độ cao mặt đi tính tới độ cao này (đỉnh núi)
bpy.context.view_layer.update()

# ---- 7. lưới đi 144x96 theo ảnh iso + vị trí nút (toạ độ ảnh 0..1)
DI = {'nui', 'sanTruoc', 'loiLen', 'nenLh', 'be', 'san', 'bacBe', 'bac', 'matBac', 'cauDa', 'loiDa', 'chieuLe', 'tamThamMo', 'nenLau', 'bacLau', 'daThien', 'boDoanT'}
BO_QUA = {'xa', 'xaD', 'tanBd', 'tre', 'cay', 'may'}
dg = bpy.context.evaluated_depsgraph_get(); OH = OW * 2 / 3
RI = fw.cross(Vector((0, 0, 1))).normalized(); UP = RI.cross(fw).normalized(); C0 = cam.location
GW, GH = 144, 96; rows = []
for j in range(GH):
    r = ''
    for i in range(GW):
        o0 = C0 + RI * (((i + .5) / GW - .5) * OW) + UP * ((.5 - (j + .5) / GH) * OH); ok = '0'
        for _ in range(6):
            hit, loc, nor, fi, ob, mx = sc.ray_cast(dg, o0, fw)
            if not hit: break
            b = ob.name.split('.')[0]
            if b.startswith('SS_Mai') or b in BO_QUA: o0 = loc + fw * 1e-3; continue   # mái (web làm mờ), xà, tán cây: người đi bên dưới
            if b in DI and nor.z > .7 and (b != 'nui' or r_elip(loc.x, loc.y) < .985): ok = '1'
            break
        r += ok
    rows.append(r)
def anh(p):
    v = w2c(sc, cam, Vector(p)); return [round(v.x, 4), round(1 - v.y, 4)]
D = {'tgt': [TG.x, TG.y], 'ow': OW, 'P': P, 'grid': {'w': GW, 'h': GH, 'rows': rows},
     'spawn': anh((0, -16.9, P)), 'pray': anh((0, -15.0, P)), 'mo': anh((-9.6, 6.1, P + .54)), 'lePhat': anh((0, 4.6, P + .54)),
     'chuongDoor': anh((10.4, -15.6, P)), 'thienDoor': anh((BX + .4, BY - 4.9, P)), 'vao': anh((0, -31.0, zbac(-31.0))),
     'hot': [{'p': anh((0, -12, P + 2.7)), 'id': 'nhang', 't': 'Thắp nhang', 's': 'Lư hương đỉnh đồng giữa sân', 'main': 1},
             {'p': anh((0, 12.2, P + 6.5)), 'id': 'le-phat', 't': 'Lễ Phật', 's': 'Đảnh lễ trước tượng Đức Phật'},
             {'p': anh((-9.6, 7.6, P + 2.4)), 'id': 'gomo', 't': 'Gõ mõ', 's': 'Góc tụng kinh trong chính điện'},
             {'p': anh((12.5, -12.0, P + 3.6)), 'id': 'chuong', 't': 'Thỉnh chuông', 's': 'Lầu chuông bên phải sân'},
             {'p': anh((BX + .4, BY - 3.6, P + 1.4)), 'id': 'thien', 't': 'Tĩnh tâm', 's': 'Ngồi thiền dưới cội bồ đề'},
             {'p': anh((0, -21.5, zbac(-21.5) + .6)), 'id': 'xuong', 't': 'Xuống núi', 's': 'Bậc đá'}],
     'mai': {'x': [-13.6, 13.6], 'y': [-6.8, 14.2]},
     'ps': round(1.78 / OW, 4),
     'nuoc': {'ho': [HX, HY, 5.4, 4.2, P + .07], 'suoi': [[x, y, Hn(x, y) + .1] for x, y in SUOI], 'thac': [[21.0, 13.4, P + 7.2, P + .2, 2.4], [31.6, -17.0, P * 1.05, .2, 1.6]]},
     'lh': [0, -12, P + 2.1], 'bd': [BX, BY, P + 5.0], 'hoa': [[-8, -16.6], [8, -16.6], [-16.4, -7], [16.4, -7], [HX, HY]]}
json.dump(D, open(RA_JSON, 'w', encoding='utf-8'), ensure_ascii=False)
print('LUOI di', sum(r.count('1') for r in rows))
bpy.ops.wm.save_as_mainfile(filepath=RA, copy=True); print('LUU', RA)

if ANH:   # ảnh xem trước nhanh: Workbench, màu phẳng theo bảng nướng
    BANG = {'da': 'CFC5B2', 'daTrang': 'ECE6DA', 'ngoi': 'C87458', 'maiNgoi': 'C87458', 'sonDo': 'B9483A', 'vangKim': 'E3B150', 'maiVang': 'E3B150', 'goDien': '8E3F2E',
            'tuongTrang': 'F4E4BA', 'cotTrang': 'F2EBDD', 'den': 'F5C87B', 'gach': 'F0D8B0', 'co2': '8FAF5F', 'co': '9DB96B', 'nuoc': '80B7B1', 'nuocTrang': 'CFE8E6',
            'sen': 'F2A8B5', 'hong': 'F29BB0', 'hongP': 'E2574C', 'la0': '7FA650', 'la1': '8CB35A', 'la2': '6F9847', 'than': '9A6B45', 'laTre': '9BBE62', 'tre': 'A7C46C',
            'trang': 'FAF3E3', 'demDo': 'C8463A', 'maiTuong': 'F0CC80', 'daX': 'A8A090', 'gachTho': 'C0705A', 'dongK': 'C08B4E'}
    for m in bpy.data.materials:
        h = BANG.get(m.name.split('.')[0])
        if h: m.diffuse_color = (*[(int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1)
    sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'; sc.display.shading.show_shadows = True
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1200; sc.render.filepath = ANH; bpy.ops.render.render(write_still=True); print('ANH', ANH)
    for o in sc.objects:   # ảnh thứ hai: bỏ mái để xem các khu trong điện
        if o.name.startswith('SS_Mai') or o.name.split('.')[0] in ('xa', 'xaD'): o.hide_render = True
    sc.render.filepath = ANH.replace('.png', '-trong.png'); bpy.ops.render.render(write_still=True)
