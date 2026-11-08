# Làm lại làng tưởng niệm (làng chung). Chạy nền trên BẢN SAO .blend, không đụng file gốc:
#   blender -b lang-goc-ban-sao.blend --python sua-lang-v2.py -- <ra.blend> <ra-du-lieu.json> [tuong-bac.blend] [anh-xem-truoc.png]
# Chủ dự án chốt 11/2026: làng chung chỉ còn 4 khu quanh Sảnh Song Song, giữ cổng làng, ao sen, lối rẽ "Làng nhà tôi".
#   Liệt sĩ: Đồi Tri Ân + đài tưởng niệm (giữ nguyên).
#   Bác Hồ và các tướng: quảng trường tượng đài ở hướng đông bắc (thay Xóm Dòng Họ), bia các tướng quanh sân.
#   Gia phả các đời vua: đình cũ thành đền thờ các vua, hai hàng bia triều đại trên lưng rùa đá trước sân.
#   Thiên thần nhỏ: vườn hoa (thay nhà Xóm Bình Yên, giữ lối, rào trắng, hoa đào), nhà vòm trắng mái hồng ở giữa.
#   Bỏ Xóm Đồng Đội, Xóm Bình Yên, Xóm Dòng Họ, ruộng ô vuông quanh làng.
# Quanh làng: đồi cỏ, rừng thông và cây tán tròn, dãy núi phía sau (đông bắc) có thác lớn đổ xuống hồ, suối chảy vòng phía đông.
# Ra: file .blend để nướng (tools/blender/nuong-canh-3d.py) + JSON lưới đi 144x96, nút, cổng cho js/04-00 và toạ độ nước cho js/26.
import bpy, bmesh, math, random, sys, json, os
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view as w2c

A = sys.argv[sys.argv.index('--') + 1:]
RA, RA_JSON = A[0], A[1]
TUONG = A[2] if len(A) > 2 and A[2] != '-' else None
ANH = A[3] if len(A) > 3 else None
random.seed(7)
sc = max(bpy.data.scenes, key=lambda s: len(s.objects))
for s in [x for x in bpy.data.scenes if x != sc]: bpy.data.scenes.remove(s)
bpy.context.window.scene = sc
col = sc.collection
bpy.context.view_layer.update()

def mat(ten, hexc='CCCCCC'):
    m = bpy.data.materials.get(ten)
    if m: return m
    m = bpy.data.materials.new(ten); m.use_nodes = True
    b = next(n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value = (*[(int(hexc[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1); return m
def them(ten, bm, m, loc=(0, 0, 0), rz=0):
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); me.materials.append(m if not isinstance(m, str) else mat(m))
    o = bpy.data.objects.new(ten, me); o.location = loc; o.rotation_euler.z = rz; col.objects.link(o); return o
def hop(ten, m, c, s, rz=0):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1); bmesh.ops.scale(bm, vec=Vector(s), verts=bm.verts)
    return them(ten, bm, m, c, rz)
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
def tam(o):
    return sum((o.matrix_world @ Vector(b) for b in o.bound_box), Vector()) / 8
def ten0(o): return o.name.split('.')[0]

# ---- vật liệu (tên theo bảng màu nướng BANG trong nuong-canh-3d.py)
DA, DAT, CO2, NUOC, NUOCT = mat('da'), mat('daTrang', 'ECE6DA'), mat('co2', '8FAF5F'), mat('nuoc', '80B7B1'), mat('nuocTrang', 'CFE8E6')
TT, COT, GACH, VANG, HONG, HONGP, SEN = mat('tuongTrang', 'F4E4BA'), mat('cotTrang', 'F2EBDD'), mat('gach', 'F0D8B0'), mat('vangKim', 'E3B150'), mat('hong', 'F29BB0'), mat('hongP', 'E2574C'), mat('sen', 'F2A8B5')
LA = [mat('la0', '7FA650'), mat('la1', '8CB35A'), mat('la2', '6F9847')]; THAN, BACH = mat('than', '9A6B45'), mat('bach', '5F8A42')
DAX = bpy.data.materials.get('daX') or mat('daX', 'A8A090'); MAIH = mat('maiHong', 'EFC3CC'); DEN = mat('den', 'F5C87B')

# ---- 1. dọn: nhà ba xóm, cổng Xóm Đồng Đội, ruộng ô vuông, cây ngoài vòng làng
GIU_TT = {'raoTrang', 'nepRao', 'bui', 'hoaV', 'hoaDao', 'gocDao'}   # vườn Thiên thần giữ lối, rào trắng, hoa
xoa = set()
nha = sorted([o for o in sc.objects if o.type == 'EMPTY' and ten0(o) == 'nha'], key=lambda o: o.name)
for e in nha:
    vi = e.matrix_world.translation; vtt = vi.x > 14 and vi.y < -2   # nhà Xóm Bình Yên (đông nam)
    for c in e.children_recursive:
        if not (vtt and ten0(c) in GIU_TT): xoa.add(c)
    xoa.add(e)
for o in sc.objects:
    if o in xoa or o.type != 'MESH': continue
    b, c = ten0(o), tam(o); r = math.hypot(c.x, c.y)
    if b in ('ruong', 'bo1', 'bo2'): xoa.add(o)
    elif b in ('cay', 'tre', 'cau') and r > 50: xoa.add(o)
    elif c.x < -7 and c.y > 5 and math.hypot(c.x, c.y - 34) > 14 and b not in ('cay', 'tre', 'cau'): xoa.add(o)   # Xóm Đồng Đội: lối, cổng, sân cuối
    elif b in ('cuoiXom',) and c.x > 25 and c.y > 25: xoa.add(o)   # sân cuối Xóm Dòng Họ: thành quảng trường tượng đài
    elif b in ('cay', 'tre', 'cau') and (math.hypot(c.x - 29, c.y - 29) < 11.5 or math.hypot(c.x - 28, c.y + 13) < 5): xoa.add(o)
kept = [o for o in sc.objects if o not in xoa and o.parent in xoa]
for o in kept:
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
for o in xoa: bpy.data.objects.remove(o, do_unlink=True)
bpy.context.view_layer.update()
print('XOA', len(xoa))

# ---- 2. Bác Hồ và các tướng: quảng trường tròn, tượng Bác trên bệ quay về Sảnh Song Song, bia các tướng hai bên
BX, BY = 29.0, 29.0; HUONG = math.atan2(-BY, -BX)   # hướng nhìn về sảnh (tây nam)
tru('sanBac', GACH, (BX, BY, 0), 9.5, .06, 48)
tru('vienBac', DA, (BX, BY, 0), 9.9, .04, 48)
tru('nenBac', DA, (BX, BY, .06), 4.6, .3, 32); tru('nenBac', DAT, (BX, BY, .36), 3.4, .3, 32)
hop('beBac', DAT, (BX, BY, .66 + 1.2), (2.3, 2.3, 2.4), HUONG + math.pi / 4); hop('beBac', DA, (BX, BY, .66 + 2.45), (2.6, 2.6, .12), HUONG + math.pi / 4)
# tường phù điêu vòng cung phía sau (đông bắc)
for k in range(15):
    a = HUONG + math.pi + (k - 7) * .105; x, y = BX + math.cos(a) * 8.2, BY + math.sin(a) * 8.2
    hop('tuongBac', TT, (x, y, 1.5), (.9, .45, 3.0), a + math.pi / 2); hop('tuongBac', DA, (x, y, 3.08), (.95, .55, .16), a + math.pi / 2)
# bia các tướng: hai vòng cung hai bên lối vào, mặt bia nhìn vào tượng
BIA = []
for s in (-1, 1):
    for k in range(6):
        a = HUONG + s * (.62 + k * .26); x, y = BX + math.cos(a) * 6.6, BY + math.sin(a) * 6.6; rz = a + math.pi / 2
        hop('chanBia', DA, (x, y, .2), (1.1, .55, .4), rz); hop('biaTuong', DAT, (x, y, .4 + .75), (.85, .18, 1.5), rz); BIA.append((x, y))
# bồn hoa đỏ vàng hai bên lối vào
for s in (-1, 1):
    a = HUONG + s * .3; x, y = BX + math.cos(a) * 8.6, BY + math.sin(a) * 8.6
    tru('bonHoa', DA, (x, y, 0), 1.3, .35, 16)
    for k in range(7): b = k / 7 * 6.283; cau('hoaBon', HONGP if k % 2 else VANG, (x + math.cos(b) * .75, y + math.sin(b) * .75, .55), .3, 1)
def thong(x, y, z=0.0, s=1.0):
    tru('cay', THAN, (x, y, z), .25 * s, 2.0 * s, 8, .18 * s)
    for k in range(3): tru('cay', LA[2], (x, y, z + (1.4 + k * 1.15) * s), (1.7 - k * .45) * s, 1.8 * s, 10, .05)
for k in range(9):   # hàng thông sau tường
    a = HUONG + math.pi + (k - 4) * .2; thong(BX + math.cos(a) * 11, BY + math.sin(a) * 11, 0, 1.25)

# ---- 3. Thiên thần nhỏ: nhà vòm trắng mái hồng giữa vườn hoa, đèn hoa sen quanh
TX_, TY_ = 28.0, -13.0
tru('sanTT', DAT, (TX_, TY_, 0), 4.2, .08, 32); tru('nenTT', COT, (TX_, TY_, .08), 3.0, .3, 32)
for k in range(6):
    a = k / 6 * 6.283; tru('cotTT', COT, (TX_ + math.cos(a) * 2.4, TY_ + math.sin(a) * 2.4, .38), .16, 2.6, 12)
tru('maiTT', COT, (TX_, TY_, 2.98), 2.9, .2, 32); tru('maiTT', MAIH, (TX_, TY_, 3.18), 2.8, 1.6, 32, .25); cau('maiTT', VANG, (TX_, TY_, 4.95), .28, 2)
for k in range(8):
    a = k / 8 * 6.283 + .2; x, y = TX_ + math.cos(a) * 5.4, TY_ + math.sin(a) * 5.4
    tru('denTT', COT, (x, y, 0), .12, 1.0, 8); cau('denTT', SEN, (x, y, 1.15), .26, 1, .8)
for k in range(10):
    a = k / 10 * 6.283; x, y = TX_ + math.cos(a) * 4.5, TY_ + math.sin(a) * 4.5; cau('hoaBon', HONG if k % 2 else SEN, (x, y, .25), .32, 1)

# ---- 4. Gia phả các đời vua: đình cũ là đền thờ; hai hàng bia triều đại trên lưng rùa đá trước sân
cots = [tam(o) for o in sc.objects if ten0(o) == 'dCot']
F = sum(cots, Vector()) / len(cots); dv = (cots[-1] - cots[0]); dv.z = 0; dv.normalize()
NV = Vector((dv.y, -dv.x, 0))
if (Vector((-31, -11.3, 0)) - F).dot(NV) < 0: NV = -NV   # hướng ra sân (sanDinh)
VUA_CUA = F + NV * 3.0
for s in (-1, 1):
    for k in range(6):
        p = F + NV * (3.4 + k * 2.1) + dv * s * 3.6; rz = math.atan2(dv.y, dv.x) + (0 if s < 0 else math.pi)
        cau('ruaDa', DA, (p.x, p.y, .25), .55, 2, .45); hop('biaVua', DAT, (p.x, p.y, .45 + .8), (.75, .16, 1.5), rz + math.pi / 2)
        hop('biaVua', DA, (p.x, p.y, 2.1), (.85, .22, .14), rz + math.pi / 2)

# ---- 5. địa hình quanh làng: đồi cỏ, dãy núi đông bắc, thác lớn, hồ, suối
GOC_NUI = math.radians(52)
HO = (36.0, 45.5, 7.5, 5.0)   # hồ dưới chân thác: tâm, bán trục
SUOI = [(41.5, 43.5), (48, 37), (56, 30), (63, 20), (70, 8), (80, -5)]
def d_suoi(x, y):
    best = 1e9
    for (ax, ay), (bx, by) in zip(SUOI, SUOI[1:]):
        vx, vy = bx - ax, by - ay; t = max(0, min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy)))
        best = min(best, math.hypot(x - ax - vx * t, y - ay - vy * t))
    return best
def ss(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
def H(x, y):
    r = math.hypot(x, y); a = math.atan2(y, x)
    da = math.atan2(math.sin(a - GOC_NUI), math.cos(a - GOC_NUI))
    doi = ss(53, 66, r) * (2.2 + 1.6 * math.sin(x * .13) * math.cos(y * .11) + 1.2 * math.sin(x * .05 + y * .07))
    nui = math.exp(-(da / .55) ** 2) * ss(58, 72, r) * 26 + math.exp(-((da + 1.25) / .4) ** 2) * ss(62, 84, r) * 14 + math.exp(-((da - 1.35) / .35) ** 2) * ss(64, 86, r) * 12
    truoc = ss(.9, 1.6, abs(math.atan2(math.sin(a + 2.3), math.cos(a + 2.3))))   # phía trước (tây nam, gần camera) giữ thấp
    z = doi + nui * truoc
    z -= 2.2 * math.exp(-(d_suoi(x, y) / 2.2) ** 2) * ss(54, 58, r)   # lòng suối
    e = ((x - HO[0]) / (HO[2] + 2)) ** 2 + ((y - HO[1]) / (HO[3] + 2)) ** 2
    if e < 1.6: z = min(z, -.3 + 2.0 * max(0, e - 1))   # lòng hồ
    return z
# lưới tròn: mép trong là đường tròn trơn hơi chìm dưới nền làng (lưới ô vuông cắt ra răng cưa, hở lỗ đen)
NS = 360; RS = [52.5 + .8 * k for k in range(12)] + [62 + 1.6 * k for k in range(42)]
bm = bmesh.new(); vong = []
for r in RS:
    vong.append([bm.verts.new((math.cos(i / NS * 6.283185) * r, math.sin(i / NS * 6.283185) * r, 0)) for i in range(NS)])
for v in bm.verts:   # trong vòng 53 m chìm dưới nền làng; ngoài luôn cao hơn nền (thấp hơn thì hai lớp chồng nhau lộ mép răng cưa), trừ lòng hồ và suối có nước phủ
    r = math.hypot(v.co.x, v.co.y); z = H(v.co.x, v.co.y)
    v.co.z = -.12 if r < 53 else (z if z < -.05 and (d_suoi(v.co.x, v.co.y) < 3 or ((v.co.x - HO[0]) / (HO[2] + 2)) ** 2 + ((v.co.y - HO[1]) / (HO[3] + 2)) ** 2 < 1.6) else max(z, .06))
for a_, b_ in zip(vong, vong[1:]):
    for i in range(NS): bm.faces.new((a_[i], a_[(i + 1) % NS], b_[(i + 1) % NS], b_[i]))
nui = them('nuiLang', bm, mat('coDoi', 'A2BD6F'))   # cùng màu cỏ nền làng (tên khác 'co': script nướng xoá mặt 'co' rộng hơn 100 m)
for p in nui.data.polygons: p.use_smooth = True
# hồ dưới thác (mặt nước + bờ đá)
bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=48, radius=1); bmesh.ops.scale(bm, vec=(HO[2], HO[3], 1), verts=bm.verts)
them('aoThac', bm, NUOC, (HO[0], HO[1], .05))
for k in range(26):
    a = k / 26 * 6.283; cau('daBo', DA, (HO[0] + math.cos(a) * (HO[2] + .5), HO[1] + math.sin(a) * (HO[3] + .5), .1), random.uniform(.45, .8), 1, .55)
# thác: vách đá dựng đứng, màn nước trắng đổ thẳng xuống hồ, bọt dưới chân
TH = 63.0
def doc(r):
    return Vector((math.cos(GOC_NUI) * r, math.sin(GOC_NUI) * r, 0))
ngang = Vector((-math.sin(GOC_NUI), math.cos(GOC_NUI), 0)); W = 2.4
ZTOP = max(H(*(doc(TH + 4) + ngang * s).xy) for s in (-3, 0, 3)) + 1.5
for k in range(11):   # vách: các khối đá xám xếp so le, cao dần vào giữa
    t = (k - 5) * 1.5; p = doc(TH + 1.4 + random.uniform(-.3, .3)) + ngang * t; h = ZTOP * (1 - .25 * abs(t) / 7.5) + random.uniform(-.6, .6)
    hop('vachDa', DAX, (p.x, p.y, h / 2 - .6), (random.uniform(1.8, 2.4), random.uniform(2.2, 3.0), h + 1.2), GOC_NUI + random.uniform(-.25, .25))
for k in range(7):
    t = (k - 3) * 2.4; p = doc(TH + 3.2) + ngang * t; cau('daVach', DAX, (p.x, p.y, ZTOP * .9), random.uniform(1.6, 2.4), 1, .8)
bm = bmesh.new(); hang = []
for k in range(13):
    z = .3 + (ZTOP - .3) * k / 12; c = doc(TH - .1 - .5 * (1 - k / 12)); hang.append([bm.verts.new((*(c + ngang * s * W).xy, z)) for s in (-1, 0, 1)])
for a_, b_ in zip(hang, hang[1:]):
    for i in range(2): bm.faces.new((b_[i], b_[i + 1], a_[i + 1], a_[i]))   # mặt quay về làng (quay vào vách thì nướng ra đen)
thac = them('thacNuoc', bm, NUOCT)
for k in range(9): cau('bot', mat('trang', 'FAF3E3'), (*(doc(TH - 1.0) + ngang * (k - 4) * .65).xy, .3), random.uniform(.5, .85), 1, .5)
TH0, TH1 = TH - .6, TH

# suối: dải nước từ hồ chảy về đông nam
bm = bmesh.new(); hang = []
pts = []
for (ax, ay), (bx, by) in zip(SUOI, SUOI[1:]):
    for k in range(8): t = k / 8; pts.append((ax + (bx - ax) * t, ay + (by - ay) * t))
pts.append(SUOI[-1])
for i, (x, y) in enumerate(pts):
    j = min(i + 1, len(pts) - 1); i0 = max(0, j - 1); tx, ty = pts[j][0] - pts[i0][0], pts[j][1] - pts[i0][1]; L = math.hypot(tx, ty) or 1
    nx, ny = -ty / L * 1.3, tx / L * 1.3
    hang.append([bm.verts.new((x + nx * s, y + ny * s, H(x + nx * s, y + ny * s) * 0 + H(x, y) + .12)) for s in (-1, 1)])
for a, b in zip(hang, hang[1:]): bm.faces.new((a[0], a[1], b[1], b[0]))
them('suoiLang', bm, NUOC)

# rừng trên đồi: thông và cây tán tròn, tránh hồ, suối, thác, lối cổng phía nam
def cay_tron(x, y, z, s=1.0):
    tru('cay', THAN, (x, y, z), .2 * s, 1.6 * s, 8, .14 * s)
    cau('cay', LA[random.randrange(2)], (x, y, z + 2.3 * s), 1.3 * s, 2); cau('cay', LA[random.randrange(3)], (x + .5 * s, y - .3 * s, z + 2.9 * s), .9 * s, 2)
n = 0; tries = 0
while n < 230 and tries < 5000:
    tries += 1; r = random.uniform(55, 98); a = random.uniform(0, 6.283); x, y = math.cos(a) * r, math.sin(a) * r
    if abs(x) > 100 or abs(y) > 100: continue
    if d_suoi(x, y) < 3.5 or ((x - HO[0]) / (HO[2] + 3)) ** 2 + ((y - HO[1]) / (HO[3] + 3)) ** 2 < 1: continue
    if abs(math.atan2(math.sin(a - GOC_NUI), math.cos(a - GOC_NUI))) < .1 and r < 74: continue
    if abs(x) < 6 and y < -40: continue
    z = H(x, y)
    if z > 20: continue
    (thong if random.random() < .45 else cay_tron)(x, y, z - .1, random.uniform(.9, 1.5)); n += 1
print('RUNG', n)

# ---- 6a. bệ đá đen như tượng đài Bác trước UBND TP.HCM: mặt trước khắc "CHỦ TỊCH HỒ CHÍ MINH" và "(1890 - 1969)", phiến đồng dưới chân tượng.
# Xuất riêng (SS_) cho chữ sắc nét (nướng vào ảnh đồ nhỏ thì chữ nhoè); vỏ bệ trùm kín bệ trắng cũ nên không phải nướng lại.
DEN_B, CHU_V, DONG_B = mat('daDenBong', '1A1A1C'), mat('chuKhac', 'E9DDB4'), mat('dongBe', 'A8743A')
for m_, r_ in ((DEN_B, .32), (CHU_V, .5), (DONG_B, .4)):
    b_ = next(n for n in m_.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'); b_.inputs['Roughness'].default_value = r_
    if m_ is DONG_B: b_.inputs['Metallic'].default_value = .6
BW, BH = 3.8, 3.3; ZBE = .66 + BH
hop('SS_BeBac', DEN_B, (BX, BY, .66 + BH / 2), (BW, BW, BH), HUONG)
hop('SS_BeBac', DEN_B, (BX, BY, .66 + .12), (BW + .3, BW + .3, .24), HUONG)
hop('SS_BeBac', DONG_B, (BX, BY, ZBE + .08), (2.6, 2.6, .16), HUONG)
FONT = None
for f_ in (r'C:\Windows\Fonts\timesbd.ttf', r'C:\Windows\Fonts\times.ttf'):
    if os.path.exists(f_): FONT = bpy.data.fonts.load(f_); break
def khac(chu, z, cao_chu):
    cu = bpy.data.curves.new('chu', 'FONT'); cu.body = chu; cu.align_x = 'CENTER'; cu.align_y = 'CENTER'; cu.extrude = .015; cu.size = cao_chu
    if FONT: cu.font = FONT
    t = bpy.data.objects.new('chu', cu); col.objects.link(t); bpy.context.view_layer.update()
    me = bpy.data.meshes.new_from_object(t.evaluated_get(bpy.context.evaluated_depsgraph_get())); bpy.data.objects.remove(t); bpy.data.curves.remove(cu)
    rong = max(v.co.x for v in me.vertices) - min(v.co.x for v in me.vertices)
    if rong > BW * .86:
        for v in me.vertices: v.co *= BW * .86 / rong
    me.materials.append(CHU_V); o_ = bpy.data.objects.new('SS_ChuBac', me); col.objects.link(o_)
    d_ = Vector((math.cos(HUONG), math.sin(HUONG), 0)); p_ = Vector((BX, BY, z)) + d_ * (BW / 2 + .012)
    o_.location = p_; o_.rotation_euler = (math.pi / 2, 0, HUONG + math.pi / 2); return o_
khac('CHỦ TỊCH HỒ CHÍ MINH', .66 + BH * .66, .38)
khac('(1890 - 1969)', .66 + BH * .46, .3)

# ---- 6. tượng Bác (Meshy, phong cách tượng đồng) đặt lên bệ, quay về sảnh
if TUONG and os.path.exists(TUONG):
    with bpy.data.libraries.load(TUONG, link=False) as (src, dst): dst.objects = [x for x in src.objects if x.startswith('SS_TuongBac')]
    for o in dst.objects:
        if o is None: continue
        col.objects.link(o); o.parent = None; o.rotation_euler.z = HUONG + math.pi / 2   # mẫu Meshy nhìn về -Y: xoay cho nhìn về sảnh
        bpy.context.view_layer.update(); bb = [o.matrix_world @ Vector(b) for b in o.bound_box]
        h = max(p.z for p in bb) - min(p.z for p in bb); k = 4.2 / h; o.scale = (o.scale.x * k, o.scale.y * k, o.scale.z * k)
        bpy.context.view_layer.update(); bb = [o.matrix_world @ Vector(b) for b in o.bound_box]
        cx, cy, z0 = sum(p.x for p in bb) / 8, sum(p.y for p in bb) / 8, min(p.z for p in bb)
        o.location += Vector((BX - cx, BY - cy, ZBE + .16 - z0)); o.name = 'SS_TuongBac'
        print('TUONG', o.name, round(h, 2))

# ---- 7. lưới đi 144x96 theo ảnh iso (camera giữ nguyên ảnh cũ) + vị trí nút
cam = next(o for o in sc.objects if o.type == 'CAMERA'); sc.camera = cam
bpy.context.view_layer.update()
fw = (cam.rotation_euler.to_matrix() @ Vector((0, 0, -1))).normalized(); OW = cam.data.ortho_scale; OH = OW * sc.render.resolution_y / sc.render.resolution_x
DI = {'quangTruong', 'vienQT', 'duong', 'dn', 'cuoiXom', 'loi', 'sanDinh', 'benAo', 'doi', 'daiNen', 'sanBac', 'vienBac', 'nenBac', 'sanTT', 'nenTT', 'sanhNen', 'san'}
BO_QUA = {'cay', 'tre', 'cau', 'sanhMai', 'sanhMai2', 'maiTT', 'co', 'coXom'}
dg = bpy.context.evaluated_depsgraph_get()
RI = fw.cross(Vector((0, 0, 1))).normalized(); UP = RI.cross(fw).normalized(); C0 = cam.location
GW, GH = 144, 96; rows = []
for j in range(GH):
    r_ = ''
    for i in range(GW):
        o0 = C0 + RI * (((i + .5) / GW - .5) * OW) + UP * ((.5 - (j + .5) / GH) * OH); ok = '0'
        for _ in range(8):
            hit, loc, nor, fi, ob, mx = sc.ray_cast(dg, o0, fw)
            if not hit: break
            b = ten0(ob)
            if b in BO_QUA: o0 = loc + fw * 1e-3; continue
            if b in DI and nor.z > .7: ok = '1'
            break
        r_ += ok
    rows.append(r_)
def anh(p):
    v = w2c(sc, cam, Vector(p)); return [round(v.x, 4), round(1 - v.y, 4)]
cua_bac = (BX + math.cos(HUONG) * 7.2, BY + math.sin(HUONG) * 7.2, 0)
D = {'grid': {'w': GW, 'h': GH, 'rows': rows},
     'gates': {'bac': anh(cua_bac), 'tt': anh((TX_ - 4.6, TY_ + 1.2, 0)), 'vua': anh((VUA_CUA.x + NV.x * 9, VUA_CUA.y + NV.y * 9, 0))},
     'hot': {'bac': anh((BX, BY, 6.8)), 'vua': anh((F.x - NV.x * 2, F.y - NV.y * 2, 8.5)), 'tt': anh((TX_, TY_, 5.6)), 'thac': anh((*doc(65).xy, H(*doc(65).xy) + 3))},
     'bia': [anh((x, y, 1.6)) for x, y in BIA],
     'nuoc': {'ho': [HO[0], HO[1], HO[2], HO[3], .07], 'thac': [list((doc(TH - .4)).xy) + [ZTOP, .3, 2 * W, round(GOC_NUI + math.pi / 2, 3)]],
              'suoi': [[x, y, H(x, y) + .15] for x, y in SUOI]},
     'thacDuoi': list(doc(TH0).xy)}
json.dump(D, open(RA_JSON, 'w', encoding='utf-8'), ensure_ascii=False)
print('LUOI di', sum(r.count('1') for r in rows))
bpy.ops.wm.save_as_mainfile(filepath=RA, copy=True); print('LUU', RA)

if ANH:   # ảnh xem trước nhanh: Workbench, màu phẳng
    BANG = {'da': 'CFC5B2', 'daTrang': 'ECE6DA', 'ngoi': 'C87458', 'son': 'B9483A', 'vangKim': 'E3B150', 'vang': 'E3B150', 'tuongTrang': 'F4E4BA', 'cotTrang': 'F2EBDD',
            'gach': 'F0D8B0', 'gach2': 'DDB284', 'co2': '8FAF5F', 'co': '9DB96B', 'nuoc': '80B7B1', 'nuocTrang': 'CFE8E6', 'sen': 'F2A8B5', 'hong': 'F29BB0', 'hongP': 'E2574C',
            'la0': '7FA650', 'la1': '8CB35A', 'la2': '6F9847', 'than': '9A6B45', 'trang': 'FAF3E3', 'daX': 'A8A090', 'maiHong': 'EFC3CC', 'tuong': 'F0CC80', 'tre': 'A7C46C', 'thanCau': 'C9AE86'}
    for m in bpy.data.materials:
        h = BANG.get(m.name.split('.')[0])
        if h: m.diffuse_color = (*[(int(h[i:i + 2], 16) / 255) ** 2.2 for i in (0, 2, 4)], 1)
    sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'; sc.display.shading.show_shadows = True
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1200; sc.render.filepath = ANH; bpy.ops.render.render(write_still=True); print('ANH', ANH)
