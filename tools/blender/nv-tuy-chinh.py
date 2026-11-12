"""Nhân vật tuỳ chỉnh đất nặn: thân nam/nữ, mặt, tóc, áo, quần, giày rời, cùng bộ xương 24 khớp và động tác của ThanhNien.
blender -b --factory-startup --python nv-tuy-chinh.py -- <ThanhNien.glb> <TuyChinh.glb> [xem.png]
ThanhNien.glb: chuyển từ img/3d/nv/ThanhNien.json (bỏ base64 ra phần nhị phân). Trọng số xương chép từ thân ThanhNien (mặt gần nhất).
Mỗi bộ phận một vật thể, tên = mã trên web (js/26 bật/tắt theo lựa chọn):
  than_nam, than_nu            thân + đầu trọc (vật liệu da)
  mat_1..mat_4                 mắt, mày, miệng (mat, trang, moi, hong)
  toc_ngan, toc_cua, toc_mai, toc_dai, toc_bui, toc_duoi, toc_bob   (toc)
  ao_thun, ao_somi, ao_baba, ao_dai, ao_khoac   (ao, ao2 = viền, cúc)
  quan_dai, quan_ngan, quan_rong, vay           (quan)
  giay                          luôn hiện (giay)
Vật liệu ao/quan/toc/da trắng hoặc màu mặc định: web nhuộm theo lựa chọn. Tư thế T như ThanhNien, mặt quay về -Y."""
import bpy, bmesh, sys, math
from mathutils import Vector, Matrix
from mathutils.bvhtree import BVHTree
A = sys.argv[sys.argv.index('--') + 1:]; NGUON, RA = A[0], A[1]; XEM = A[2] if len(A) > 2 else None
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=NGUON)
ARM = next(o for o in sc.objects if o.type == 'ARMATURE')

# ---- nguồn trọng số: thân + tay ThanhNien (toạ độ thế giới, mét)
SV, SW, ST = [], [], []
for o in [o for o in sc.objects if o.type == 'MESH' and o.parent == ARM]:
    G = {g.index: g.name for g in o.vertex_groups}; b = len(SV)
    for v in o.data.vertices:
        SV.append(o.matrix_world @ v.co); SW.append({G[g.group]: g.weight for g in v.groups if g.weight > .01})
    for p in o.data.polygons: ST.append([b + i for i in p.vertices])
BVH = BVHTree.FromPolygons(SV, ST)
def trong_so(p):
    loc, nor, fi, d = BVH.find_nearest(p); w = {}
    for i in ST[fi]:
        k = 1 / max(1e-4, (SV[i] - loc).length)
        for g, x in SW[i].items(): w[g] = w.get(g, 0) + x * k
    w = sorted(w.items(), key=lambda t: -t[1])[:4]; s = sum(x for _, x in w) or 1
    return [(g, x / s) for g, x in w]
for o in [o for o in sc.objects if o != ARM]: bpy.data.objects.remove(o)

MAU = {'da': (.93, .74, .6), 'toc': (.1, .07, .05), 'mat': (.06, .045, .04), 'trang': (1, 1, 1), 'moi': (.78, .36, .34), 'hong': (.96, .6, .6),
       'ao': (.9, .9, .9), 'ao2': (.97, .95, .9), 'quan': (.3, .3, .34), 'giay': (.2, .14, .1)}
MAT = {}
def mat(t):
    if t not in MAT:
        m = bpy.data.materials.new(t); m.diffuse_color = (*MAU[t], 1); m.use_nodes = True
        b = m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value = (*MAU[t], 1); b.inputs['Roughness'].default_value = .8
        MAT[t] = m
    return MAT[t]

# ---- hình khối: mỗi khối là tập quả cầu dẹt (ellipsoid); ống = chuỗi cầu nối hai điểm. Nặn lại bằng remesh voxel cho liền như đất
class Khoi:
    def __init__(s): s.bm = bmesh.new()
    def cau(s, c, r, seg=14):
        r = (r, r, r) if isinstance(r, (int, float)) else r
        bmesh.ops.create_uvsphere(s.bm, u_segments=seg, v_segments=seg // 2 + 2, radius=1, matrix=Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*r, 1)))
        return s
    def ong(s, a, b, r1, r2):
        a, b = Vector(a), Vector(b); n = max(2, int((b - a).length / (min(r1, r2) * .35)) + 1)
        for i in range(n + 1):
            k = i / n; s.cau(a.lerp(b, k), r1 + (r2 - r1) * k, 10)
        return s
    def hop(s, c, d):
        bmesh.ops.create_cube(s.bm, size=1, matrix=Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*d, 1))); return s

def tao(ten, khoi, t, voxel=.007, mat_=1600, mem=4, xuong=None):   # mat_: số mặt sau khi giảm (tải web nhẹ)
    me = bpy.data.meshes.new(ten); khoi.bm.to_mesh(me); khoi.bm.free(); o = bpy.data.objects.new(ten, me); sc.collection.objects.link(o)
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new('r', 'REMESH'); m.mode = 'VOXEL'; m.voxel_size = voxel
    m = o.modifiers.new('s', 'SMOOTH'); m.factor = .6; m.iterations = mem
    for k in ('r', 's'): bpy.ops.object.modifier_apply(modifier=k)
    m = o.modifiers.new('g', 'DECIMATE'); m.ratio = min(1, mat_ / max(1, len(o.data.polygons))); bpy.ops.object.modifier_apply(modifier='g')
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(mat(t)); return buoc(o, xuong)

def gop(ten, phan):   # ghép nhiều mảnh (mỗi mảnh một vật liệu) thành một vật thể
    for p in phan: p.select_set(True)
    bpy.context.view_layer.objects.active = phan[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = ten; o.data.name = ten
    for p in [p for p in sc.objects if p.select_get()]: p.select_set(False)
    return o

def buoc(o, xuong=None):   # gắn vào bộ xương: trọng số chép từ ThanhNien, hoặc cả mảnh theo một xương
    for v in o.data.vertices:
        for g, x in ([(xuong, 1.0)] if xuong else trong_so(o.matrix_world @ v.co)):
            vg = o.vertex_groups.get(g) or o.vertex_groups.new(name=g); vg.add([v.index], x, 'REPLACE')
    return o

# ---- mốc cơ thể (mét, tư thế T)
def doi(x, p): return (x * p[0], p[1], p[2])   # đối xứng trái phải
VAI, KHUYU, CO_TAY, TAY = (.10, 0, .905), (.28, 0, .886), (.445, 0, .889), (.495, -.005, .889)
HONG, GOI, CO_CHAN = (.066, 0, .68), (.085, -.02, .31), (.092, -.03, .105)
DAU, RD = Vector((0, -.005, 1.145)), Vector((.16, .15, .175))
def mat_dau(x, z, noi=0.0):   # điểm trên mặt trước của đầu
    nx, nz = x / RD.x, (z - DAU.z) / RD.z; ny = -math.sqrt(max(0, 1 - nx * nx - nz * nz))
    return Vector((x, DAU.y + ny * (RD.y + noi), z))

# ---- dáng nữ: nắn lại từ dáng nam (eo thon, hông nở, vai hẹp, ngực, tay thon). Áo quần có thêm khoá hình 'nu' nắn y như thân để vừa người
def g(z, c, w): return math.exp(-((z - c) / w) ** 2)
def nan_nu(p):
    x, y, z = p; ax = abs(x); s = 1 if x >= 0 else -1
    if ax >= .15 and z > .75:   # tay: theo vai hẹp, thon lại quanh trục tay
        return Vector((x - s * .026, y * .8, .89 + (z - .89) * .8))
    kx = 1 - .26 * g(z, .76, .05) + .22 * g(z, .63, .055) - .18 * g(z, .92, .04); ky = 1 - .14 * g(z, .76, .05) + .08 * g(z, .63, .05)
    x, y = x * kx, y * ky
    if y < 0: y -= .05 * g(z, .845, .035) * math.exp(-((ax - .055) / .04) ** 2)
    return Vector((x, y, z))
def than_nu(nam):
    o = nam.copy(); o.data = nam.data.copy(); o.name = o.data.name = 'than_nu'; sc.collection.objects.link(o)
    for v in o.data.vertices: v.co = nan_nu(v.co)   # thân chưa gắn xương, toạ độ = thế giới
    return o
def khoa_nu(o):
    o.shape_key_add(name='Basis'); k = o.shape_key_add(name='nu', from_mix=False)
    for i, v in enumerate(o.data.vertices): k.data[i].co = nan_nu(o.matrix_world @ v.co)
def mi_nu():   # lông mi cong ở đuôi mắt và má hồng, chỉ hiện với dáng nữ
    k = Khoi(); h = Khoi()
    for s in (-1, 1):
        chuoi(k, [mat_dau(s * x, 1.148 + .014 * ((x - .04) / .045) ** 2, .006) for x in (.04, .055, .07, .082, .092)], .004)
        h.cau(mat_dau(s * .098, 1.078, -.002), (.026, .006, .017))
    return gop('mi_nu', [tao('mi', k, 'mat', voxel=.0022, mat_=260, mem=1, xuong='Head'), tao('ma', h, 'hong', voxel=.0025, mat_=200, mem=2, xuong='Head')])
def than(nu):
    k = Khoi()
    if nu: k.cau((0, 0, .84), (.11, .08, .1)).cau((0, 0, .7), (.13, .088, .1)).cau((0, -.02, .85), (.1, .07, .06))
    else: k.cau((0, 0, .84), (.13, .088, .11)).cau((0, 0, .7), (.12, .085, .1))
    k.ong((0, 0, .9), (0, 0, 1.0), .042, .04)
    for s in (-1, 1):
        r = .9 if nu else 1
        k.ong(doi(s, VAI), doi(s, KHUYU), .045 * r, .038 * r).ong(doi(s, KHUYU), doi(s, CO_TAY), .038 * r, .031 * r).cau(doi(s, TAY), (.05, .035, .04))
        k.ong(doi(s, HONG), doi(s, GOI), .062 * r, .046 * r).ong(doi(s, GOI), doi(s, CO_CHAN), .046 * r, .037 * r)
        k.cau(doi(s, (.11, -.06, .04)), (.04, .08, .035)); k.cau(DAU + Vector((s * .158, .01, -.01)), (.02, .03, .04))   # bàn chân, tai
    k.cau(DAU, RD, 24).cau(mat_dau(0, 1.1, -.01), .018)   # đầu, mũi
    return tao('than_nu' if nu else 'than_nam', k, 'da', mat_=3000)

# ---- mặt: mắt, mày, miệng (gắn cả vào xương Head)
def chuoi(k, pts, r):
    for a, b in zip(pts, pts[1:]): k.ong(a, b, r, r)
def cung(cx, z, w, h, n=7, noi=.004):   # cung tròn trên mặt: h > 0 cong lên (∩), h < 0 cong xuống (cười)
    return [mat_dau(cx + w * (i / (n - 1) - .5), z + h * (1 - (2 * i / (n - 1) - 1) ** 2), noi) for i in range(n)]
def mat_kieu(n):
    phan = []
    def m(t, k): phan.append(tao('m', k, t, voxel=.0025, mat_=260, mem=2, xuong='Head'))
    E = Khoi(); W = Khoi(); M = Khoi(); H = Khoi() if n == 4 else None
    for s in (-1, 1):
        x = s * .058
        if n == 3: chuoi(E, cung(x, 1.125, .045, .012), .005)   # mắt cười híp
        else:
            r = {1: (.019, .01, .022), 2: (.015, .01, .027), 4: (.023, .01, .025)}[n]
            E.cau(mat_dau(x, 1.13, .002), r); W.cau(mat_dau(x + .007, 1.14, .009), .006)
        cao = {1: .012, 2: .0, 3: .01, 4: .006}[n]; day = {1: .005, 2: .005, 3: .004, 4: .008}[n]
        chuoi(E, cung(x, 1.18 + (.005 if n == 3 else 0), .05, cao), day)   # lông mày
        if H: H.cau(mat_dau(s * .095, 1.075, -.002), (.025, .006, .016))
    if n == 2: M.cau(mat_dau(0, 1.055, .001), (.016, .008, .009))
    else: chuoi(M, cung(0, 1.06, {1: .05, 3: .065, 4: .035}[n], {1: -.012, 3: -.018, 4: -.007}[n]), .005)
    m('mat', E); m('moi', M)
    if n != 3: m('trang', W)
    if H: m('hong', H)
    return gop('mat_%d' % n, phan)

# ---- tóc: vỏ ôm đầu, chừa mặt; thêm mái, búi, đuôi, tóc dài
def vo(ten, tran=.45, ben=0.0, sau=-.4, day=.025, phong=1.06):
    k = Khoi(); bm = k.bm; R = RD * phong
    bmesh.ops.create_uvsphere(bm, u_segments=32, v_segments=20, radius=1, matrix=Matrix.Translation(DAU + Vector((0, .008, .012))) @ Matrix.Diagonal((*R, 1)))
    xoa = []
    for v in bm.verts:
        n = (v.co - DAU) / 1; nx, ny, nz = n.x / R.x, n.y / R.y, n.z / R.z
        cat = ben + (tran - ben) * max(0, -ny) + (sau - ben) * max(0, ny)
        if nz < cat: xoa.append(v)
    bmesh.ops.delete(bm, geom=xoa, context='VERTS')
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=day)
    return k
def toc(ten, them=None, **kw):
    k = vo(ten, **kw)
    if them: them(k)
    return tao('toc_' + ten, k, 'toc', voxel=.006, mat_=1200, mem=3, xuong='Head')

# ---- áo, quần, giày (dày hơn thân một chút để không lòi da)
THAN_AO = [(.96, .07, .06), (.93, .12, .085), (.88, .135, .09), (.8, .13, .088), (.72, .127, .088), (.64, .133, .092), (.55, .14, .1)]   # (z, rộng, sâu) thân áo
def ao_than(k, d=.02, duoi=.62):   # chuỗi lát mỏng nội suy theo THAN_AO cho thân áo trơn, không gợn ngấn
    z = .96
    while z >= duoi:
        i = next(i for i in range(len(THAN_AO) - 1) if THAN_AO[i + 1][0] <= z); a, b = THAN_AO[i], THAN_AO[i + 1]; t = (a[0] - z) / (a[0] - b[0])
        k.cau((0, 0, z), (a[1] + (b[1] - a[1]) * t + d, a[2] + (b[2] - a[2]) * t + d, .03)); z -= .012
def tay_ao(k, s, dai, r=.058):
    if dai: k.ong(doi(s, VAI), doi(s, KHUYU), r, r * .9).ong(doi(s, KHUYU), doi(s, (.43, 0, .889)), r * .9, r * .8)
    else: k.ong(doi(s, VAI), doi(s, (.2, 0, .896)), r, r * .95)
def vien(k, c, r):   # vòng viền nhỏ (cổ áo, cổ tay)
    for i in range(16):
        a = i / 16 * math.tau; k.cau(Vector(c) + Vector((math.cos(a) * r[0], math.sin(a) * r[1], 0)), .01)
def ao(ten, chinh, phu=None):
    k = Khoi(); chinh(k); p = [tao(ten, k, 'ao', mem=8)]
    if phu:
        k2 = Khoi(); phu(k2); p.append(tao('v', k2, 'ao2', voxel=.004, mat_=500, mem=2))
    return gop(ten, p) if len(p) > 1 else p[0]
def cuc(k, z0, z1, n):
    for i in range(n):
        z = z0 + (z1 - z0) * i / max(1, n - 1); k.cau((0, -.11, z), .009)
def quan(ten, chan_toi, r=(.075, .06, .052), them=None):
    k = Khoi(); k.cau((0, 0, .67), (.135, .095, .085))   # thấp hơn gấu áo để áo phủ lên
    for s in (-1, 1):
        g = doi(s, GOI)
        if chan_toi > .33: k.ong(doi(s, HONG), (g[0], g[1], chan_toi), r[0], r[1])
        else: k.ong(doi(s, HONG), g, r[0], r[1]).ong(g, (doi(s, CO_CHAN)[0], -.03, chan_toi), r[1], r[2])
    if them: them(k)
    return tao(ten, k, 'quan', mem=6)

def dung_tat_ca():
    nam = than(False); out = [nam, than_nu(nam), mi_nu()] + [mat_kieu(n) for n in (1, 2, 3, 4)]
    out += [toc('ngan'), toc('cua', tran=.55, day=.012, phong=1.02),
            toc('mai', lambda k: k.cau(DAU + Vector((.045, -.135, .115)), (.11, .045, .05))),
            toc('dai', lambda k: k.cau((0, .11, .98), (.15, .06, .21)), ben=-.25),
            toc('bui', lambda k: k.cau(DAU + Vector((0, .12, .16)), .07)),
            toc('duoi', lambda k: k.cau((0, .155, 1.13), .045).ong((0, .175, 1.1), (0, .2, .9), .045, .028)),
            toc('bob', lambda k: k.cau(DAU + Vector((0, -.13, .1)), (.14, .04, .05)), ben=-.45, sau=-.5)]
    def thun(k): ao_than(k); [tay_ao(k, s, False) for s in (-1, 1)]
    def somi(k): ao_than(k); [tay_ao(k, s, True, .054) for s in (-1, 1)]
    def somi2(k):
        for s in (-1, 1): k.cau((s * .035, -.085, .93), (.04, .02, .025)); k.ong(doi(s, (.41, 0, .889)), doi(s, (.43, 0, .889)), .052, .052)   # cổ áo, măng sét
        cuc(k, .9, .66, 5)
    def baba(k): ao_than(k, .03, .56); [tay_ao(k, s, True, .062) for s in (-1, 1)]
    def ao_dai(k):
        ao_than(k, .014); [tay_ao(k, s, True, .048) for s in (-1, 1)]
        k.ong((0, 0, .92), (0, 0, .975), .05, .048)
        for i in range(24):   # hai tà trước sau, xoè nhẹ xuống dưới
            z = .62 - i * .02; w = .105 + i * .0015
            for y in (-.098, .098): k.cau((0, y, z), (w, .014, .03))
    def khoac(k): ao_than(k, .032, .6); [tay_ao(k, s, True, .066) for s in (-1, 1)]
    def khoac2(k):
        for s in (-1, 1): k.cau((s * .05, -.1, .925), (.055, .025, .035))
        for i in range(12): k.cau((0, -.122, .9 - i * .026), .006)
    out += [ao('ao_thun', thun, lambda k: vien(k, (0, -.01, .935), (.05, .045))), ao('ao_somi', somi, somi2),
            ao('ao_baba', baba, lambda k: cuc(k, .9, .62, 5)), ao('ao_dai', ao_dai), ao('ao_khoac', khoac, khoac2)]
    out += [quan('quan_dai', .1), quan('quan_ngan', .45, (.078, .074, 0)), quan('quan_rong', .08, (.082, .078, .078)),
            quan('vay', .7, (.07, .07, 0), lambda k: [k.cau((0, 0, .7 - i * .02), (.135 + i * .0055, .1 + i * .0045, .05)) for i in range(19)])]
    k = Khoi()
    for s in (-1, 1): k.cau(doi(s, (.11, -.055, .045)), (.052, .1, .048))
    out.append(tao('giay', k, 'giay', mat_=900))
    return out

PHAN = dung_tat_ca()
for o in PHAN:
    if o.name.startswith(('ao_', 'quan_', 'vay')): khoa_nu(o)
for o in PHAN:
    o.parent = ARM; o.matrix_parent_inverse = ARM.matrix_world.inverted()
    m = o.modifiers.new('xuong', 'ARMATURE'); m.object = ARM
    print('PHAN', o.name, len(o.data.vertices))

if XEM:   # ảnh xem: 6 bộ phối khác nhau đứng thành hàng (tư thế T)
    BO = [('than_nam', 'mat_1', 'toc_ngan', 'ao_somi', 'quan_dai'), ('than_nu', 'mat_2', 'toc_dai', 'ao_dai', 'quan_rong'),
          ('than_nam', 'mat_3', 'toc_cua', 'ao_khoac', 'quan_dai'), ('than_nu', 'mat_4', 'toc_bui', 'ao_baba', 'quan_dai'),
          ('than_nu', 'mat_1', 'toc_bob', 'ao_thun', 'vay'), ('than_nam', 'mat_2', 'toc_mai', 'ao_thun', 'quan_ngan'),
          ('than_nu', 'mat_3', 'toc_duoi', 'ao_somi', 'vay'), ('than_nam', 'mat_4', 'toc_duoi', 'ao_baba', 'quan_rong')]
    XN = []
    for i, bo in enumerate(BO):
        for ten in bo + ('giay',) + (('mi_nu',) if bo[0] == 'than_nu' else ()):
            c = bpy.data.objects[ten].copy(); c.data = c.data.copy(); c.parent = None
            if bo[0] == 'than_nu' and c.data.shape_keys: c.data.shape_keys.key_blocks['nu'].value = 1
            c.modifiers.clear(); c.matrix_world = Matrix.Translation((i * 1.2 - 4.2, 0, 0)); sc.collection.objects.link(c); XN.append(c)
    for o in PHAN + [ARM]: o.hide_render = True
    eng = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in eng else 'BLENDER_EEVEE_NEXT'
    w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (.95, .92, .86, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .6
    l = bpy.data.objects.new('l', bpy.data.lights.new('l', 'SUN')); l.data.energy = 3; l.rotation_euler = (.8, .2, .6); sc.collection.objects.link(l)
    c = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); c.data.type = 'ORTHO'; c.data.ortho_scale = 10; sc.collection.objects.link(c); sc.camera = c
    c.location = (0, -20, 1.0); c.rotation_euler = (math.radians(90), 0, 0)
    sc.render.resolution_x, sc.render.resolution_y = 2000, 560; sc.render.filepath = XEM; bpy.ops.render.render(write_still=True)
    for c in XN: bpy.data.objects.remove(c)
    for o in PHAN + [ARM]: o.hide_render = False

for o in sc.objects: o.select_set(o in PHAN or o == ARM)
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', use_selection=True, export_yup=True, export_skins=True, export_morph=True, export_morph_normal=False, export_animations=True,
                          export_animation_mode='ACTIONS', export_materials='EXPORT', export_extras=False, export_cameras=False, export_lights=False)
print('XONG', RA)
