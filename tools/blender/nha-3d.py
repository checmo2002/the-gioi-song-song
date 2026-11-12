"""Nhà 3D cho làng riêng (js/20) và đồ trang trí, chủ dự án duyệt 12/11/2026: dựng bằng Blender, tách phần để người dùng đổi.
Chạy:  blender -b --factory-startup --python tools/blender/nha-3d.py -- <ra.glb> [xem-truoc.png]
Mỗi nhà là một vật thể 'nha_<kiểu>' (gốc ở giữa nền, cửa quay về -Y), vật liệu tên:
  mai   mái (web nhuộm theo màu mái người dùng chọn)   tuong  tường (nhuộm theo màu tường)
  còn lại giữ màu: go, da, cot, kinh, toi, vang, do
Mỗi nhà có điểm rỗng 'o_cua_<kiểu>' là chỗ lắp cửa; ba kiểu cửa dùng chung: cua_go, cua_kinh, cua_vom.
  mai2  hàng ngói, nóc mái (web nhuộm màu mái sẫm hơn)
Đồ trang trí: do_dao, do_sen, do_cau, do_rao, do_den, do_xemay, do_xedap, do_oto, do_binhsen (gốc ở chân, mặt quay về -Y).
Đồ trong nhà (bày trong cảnh 'nha'): do_truongky, do_sap, do_tuche, do_tuao (tủ áo mở cửa) và áo treo trong tủ do_aodai, do_quanphuc, do_aolen.
Ô đất trên web rộng 7.8 x 5.8 (trục X x trục Y), nhà nằm trong khoảng đó."""
import bpy, bmesh, sys, math
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
RA = argv[0] if argv else '/tmp/nha.glb'
XEM = argv[1] if len(argv) > 1 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

MAU = {'mai': (1, 1, 1), 'tuong': (1, 1, 1), 'go': (.42, .27, .16), 'da': (.72, .69, .64), 'cot': (.93, .9, .83),
       'kinh': (.22, .32, .4), 'toi': (.18, .15, .13), 'vang': (.85, .66, .28), 'do': (.72, .16, .12),
       'la': (.36, .55, .27), 'hong': (.96, .67, .76), 'nuoc': (.5, .72, .78), 'tre': (.62, .58, .34), 'kim': (.7, .72, .75), 'den': (.98, .85, .55),
       'mai2': (.78, .78, .78), 'gom': (.62, .33, .22), 'go2': (.3, .16, .1), 'su': (.93, .93, .95), 'xanhsu': (.2, .3, .58),
       'lua': (.86, .2, .22), 'xanh': (.36, .42, .26), 'len': (.55, .27, .22), 'chop': (.24, .45, .36), 'co': (.48, .62, .34), 'rao': (.56, .68, .4), 'gach': (.62, .3, .2), 'vang2': (.95, .78, .3)}
MAT = {}
def mat(t):
    if t not in MAT:
        m = bpy.data.materials.new(t); m.diffuse_color = (*MAU[t], 1); m.use_nodes = True
        b = m.node_tree.nodes.get('Principled BSDF'); b.inputs['Base Color'].default_value = (*MAU[t], 1); b.inputs['Roughness'].default_value = .85
        MAT[t] = m
    return MAT[t]

PHAN = []   # các mảnh của vật thể đang dựng
def them(ob, t):
    ob.data.materials.clear(); ob.data.materials.append(mat(t)); PHAN.append(ob); return ob
def hop(sx, sy, sz, x, y, z, t):   # hộp, (x,y) tâm, z đáy
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z + sz / 2)); o = bpy.context.object; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True); return them(o, t)
def tru(r, h, x, y, z, t, n=10, r2=None):
    bpy.ops.mesh.primitive_cone_add(vertices=n, radius1=r, radius2=r if r2 is None else r2, depth=h, location=(x, y, z + h / 2)); return them(bpy.context.object, t)
def cau_(r, x, y, z, t, n=8, sz=(1, 1, 1)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=r, location=(x, y, z)); o = bpy.context.object; o.scale = sz
    bpy.ops.object.transform_apply(scale=True); return them(o, t)
def luoi(ten, V, F, t, day=0):
    me = bpy.data.meshes.new(ten); me.from_pydata(V, [], F); me.update(); o = bpy.data.objects.new(ten, me); sc.collection.objects.link(o)
    if day:
        md = o.modifiers.new('d', 'SOLIDIFY'); md.thickness = day; md.offset = 0
        bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier='d')
    return them(o, t)

def mai_hoi(w, d, z, h, ridge, t='mai', cong=0.0, y0=0.0):
    """mái bốn mặt (ridge = chiều dài nóc theo X; ridge=w là mái hai mái có đầu hồi); cong: đầu đao vểnh"""
    a, b, r = w / 2, d / 2, ridge / 2
    V = [(-a, y0 - b, z + cong), (a, y0 - b, z + cong), (a, y0 + b, z + cong), (-a, y0 + b, z + cong), (-r, y0, z + h), (r, y0, z + h), (0, y0 - b, z), (0, y0 + b, z)]
    F = [(0, 6, 5, 4), (6, 1, 5), (1, 2, 5), (2, 7, 4, 5), (7, 3, 4), (3, 0, 4)] if ridge < w else [(0, 6, 5, 4), (6, 1, 5), (2, 7, 4, 5), (7, 3, 4)]
    o = luoi('mai', V, F, t, day=.14)
    if t == 'mai':   # hàng ngói chạy ngang mặt mái trước, sau và nóc mái
        for s in (-1, 1):
            for i in range(1, 7):
                k = i / 7; hop(2 * (a - (a - r) * k) - .25, .07, .05, 0, y0 + s * b * (1 - k), z + h * k + .04, 'mai2')
        if ridge > .5: hop(ridge + .3, .2, .2, 0, y0, z + h - .06, 'mai2')
    return o
def hoi(w, d, z, h, t='tuong'):   # hai tam giác đầu hồi cho mái hai mái
    a, b = w / 2, d / 2
    return luoi('hoi', [(-a, -b, z), (-a, b, z), (-a, 0, z + h), (a, -b, z), (a, b, z), (a, 0, z + h)], [(0, 1, 2), (3, 5, 4)], t, day=.1)
def cua_so(x, y, z, w, h, mat_kinh='kinh', khung='go', ngang=False):
    hop(w + .14, .08, h + .14, x, y - .02, z - .07, khung); hop(w, .1, h, x, y - .05, z, mat_kinh)
    for i in range(1, 4): hop(.04, .13, h, x - w / 2 + i * w / 4, y - .06, z, khung)   # song cửa
    hop(w + .3, .2, .07, x, y - .1, z - .12, khung)   # bậu cửa
def chau(x, y, z, k=1.0):   # chậu cây cảnh
    tru(.2 * k, .32 * k, x, y, z, 'gom', r2=.26 * k); cau_(.3 * k, x, y, z + .55 * k, 'la', sz=(1, 1, .9))
def bac(x, y, w, z):        # bậc thềm trước cửa, y = mép nền, z = cao nền
    n = max(1, round(z / .16))
    for i in range(n): hop(w, .32, z * (n - i) / (n + 1), x, y - .16 - .32 * i, 0, 'da')
def hoanh_phi(x, y, z, w=1.6):   # bức hoành phi đỏ viền vàng trên cửa
    hop(w + .14, .06, .5, x, y - .03, z, 'vang'); hop(w, .08, .38, x, y - .05, z + .06, 'do')
def nut_rong(ten, x, y, z):
    e = bpy.data.objects.new(ten, None); e.location = (x, y, z); sc.collection.objects.link(e); return e

def gom(ten, X=0):
    """nối các mảnh thành một vật thể nhiều vật liệu, đặt cạnh nhau theo X để xem trước"""
    global PHAN
    bpy.ops.object.select_all(action='DESELECT')
    for o in PHAN: o.select_set(True)
    bpy.context.view_layer.objects.active = PHAN[0]; bpy.ops.object.join(); o = bpy.context.object; o.name = ten; o.data.name = ten
    bpy.ops.object.shade_flat(); PHAN = []
    o.location.x += X; return o

# ---------------- 8 kiểu nhà ----------------
def bagian():   # nhà ba gian Bắc Bộ: nền đá, hiên cột gỗ, mái ngói hai mái có đầu đao
    hop(7.6, 5.4, .45, 0, 0, 0, 'da'); hop(7.4, .6, .15, 0, -2.85, 0, 'da')
    hop(7.0, 3.6, 2.5, 0, .5, .45, 'tuong')
    for x in (-3.2, -1.05, 1.05, 3.2): tru(.13, 2.55, x, -1.85, .45, 'go')
    hop(7.2, .2, .22, 0, -1.85, 2.85, 'go')
    for x in (-2.15, 2.15): cua_so(x, -1.31, 1.25, 1.1, .9)
    mai_hoi(8.6, 6.4, 2.9, 2.0, 8.6, cong=.18); hoi(7.0, 3.6, 2.95, 1.25)
    hop(8.0, .2, .22, 0, 0, 4.85, 'mai'); [tru(.1, .5, x, 0, 4.95, 'mai', r2=.02) for x in (-4.0, 4.0)]
    for x in (-3.2, -1.05, 1.05, 3.2): tru(.22, .14, x, -1.85, .45, 'da', n=8)
    hop(7.0, .06, .3, 0, -1.33, .45, 'da'); hoanh_phi(0, -1.33, 2.48)
    for x in (-1.5, 1.5): chau(x, -2.35, .45)
    return (0, -1.3, .45)
def ruong():    # nhà rường Huế: thân gỗ thấp, mái bốn mặt dốc, hiên rộng, nhiều cột
    hop(7.6, 5.6, .5, 0, 0, 0, 'da')
    hop(6.4, 3.4, 2.3, 0, .5, .5, 'tuong')
    for x in (-3.4, -1.7, 0, 1.7, 3.4):
        for y in (-2.2, 2.3): tru(.12, 2.4, x, y, .5, 'go')
    for x in (-2.4, 2.4): cua_so(x, -1.21, 1.2, 1.0, .9, 'toi')
    mai_hoi(8.4, 6.6, 2.85, 2.4, 3.6, cong=.22); hop(3.8, .22, .26, 0, 0, 5.2, 'mai')
    for x in (-1.9, 1.9): cau_(.16, x, 0, 5.4, 'mai2', sz=(1, .6, 1.4))
    for x in (-3.4, -1.7, 0, 1.7, 3.4): tru(.2, .14, x, -2.2, .5, 'da', n=8)
    hop(7.0, .2, .2, 0, -2.2, 2.75, 'go'); hoanh_phi(0, -1.23, 2.3, 1.4); bac(0, -2.8, 1.8, .5)
    for x in (-.85, .85): chau(x, -2.45, .5, .8)
    return (0, -1.2, .5)
def maithai():  # mái Thái: tường xây, mái bốn mặt rất dốc, sảnh nhỏ có hai cột
    hop(7.4, 5.4, .35, 0, 0, 0, 'da')
    hop(6.6, 4.2, 3.0, 0, .3, .35, 'tuong'); hop(2.4, 1.2, 2.6, 0, -2.1, .35, 'tuong')
    for x in (-.95, .95): tru(.13, 2.6, x, -2.55, .35, 'cot')
    for x in (-2.3, 2.3): cua_so(x, -1.81, 1.35, 1.2, 1.3, 'kinh', 'cot')
    mai_hoi(7.4, 5.0, 3.35, 3.0, 1.2); mai_hoi(3.0, 1.9, 2.95, .9, 3.0, y0=-2.1)
    hop(6.6, .06, .3, 0, -1.83, .35, 'da'); bac(0, -2.7, 1.6, .35)
    for x in (-1.7, 1.7): chau(x, -3.1, 0)
    return (0, -2.71, .35)
def maibang():  # nhà mái bằng hai tầng: khối hộp, ban công tầng hai, mái bằng có lan can
    hop(7.2, 5.2, .3, 0, 0, 0, 'da')
    hop(6.4, 4.4, 5.6, 0, .3, .3, 'tuong'); hop(6.8, 4.8, .22, 0, .3, 5.9, 'mai')
    for x, w in ((-3.3, .2), (3.3, .2)): hop(w, 4.8, .6, x, .3, 6.12, 'mai')
    hop(6.8, .2, .6, 0, 2.6, 6.12, 'mai'); hop(6.8, .2, .6, 0, -2.0, 6.12, 'mai')
    hop(6.6, 1.3, .18, 0, -2.45, 3.0, 'cot')
    for x in (-3.2, -1.6, 0, 1.6, 3.2): hop(.08, .08, .9, x, -3.0, 3.18, 'kim')
    hop(6.4, .08, .08, 0, -3.0, 4.06, 'kim')
    for x in (-2.0, 2.0): cua_so(x, -1.81, 1.3, 1.2, 1.2, 'kinh', 'cot')
    for x in (-1.9, 0, 1.9): cua_so(x, -1.81, 3.6, 1.0, 1.5, 'kinh', 'cot')
    hop(2.0, .9, .1, 0, -2.25, 2.7, 'cot'); hop(6.5, .1, .15, 0, -1.86, 2.85, 'cot'); bac(0, -2.6, 1.6, .3)
    for x in (-2.7, 2.7): chau(x, -2.7, 3.18, .7)
    for x in (-1.3, 1.3): chau(x, -2.4, .3, .8)
    return (0, -1.81, .3)
def nhasan():   # nhà sàn: cột chống, sàn gỗ, mái hai mái lớn dốc, cầu thang trước
    for x in (-3.0, -1.0, 1.0, 3.0):
        for y in (-1.9, 0, 1.9): tru(.12, 1.8, x, y, 0, 'go', n=6)
    hop(7.0, 4.6, .2, 0, 0, 1.7, 'go'); hop(6.4, 3.6, 2.1, 0, .3, 1.9, 'tuong')
    hop(6.8, .9, .1, 0, -2.0, 1.85, 'go')
    for i in range(6): hop(1.1, .3, .08, 0, -2.75 - i * .3, 1.55 - i * .3, 'go')
    for x in (-2.2, 2.2): cua_so(x, -1.51, 2.6, .9, .8, 'toi')
    mai_hoi(8.0, 6.0, 3.7, 2.6, 6.2); hoi(6.4, 3.6, 4.0, 1.9)
    for i in range(17):   # lan can hiên
        x = -3.2 + i * .4
        if abs(x) > .6: tru(.03, .6, x, -2.4, 1.95, 'go', n=4)
    for s in (-1, 1): hop(2.6, .06, .06, s * 1.9, -2.4, 2.5, 'go')
    for x in (-3.1, 3.1): hop(.08, .08, 1.1, x, 0, 6.2, 'go')   # khau cút đầu nóc
    return (0, -1.51, 1.9)
def nhaong():   # nhà ống phố: mặt tiền hẹp ba tầng, ban công, mái tôn dốc trước
    hop(4.6, 5.6, .25, 0, 0, 0, 'da')
    hop(4.2, 5.0, 8.4, 0, .2, .25, 'tuong')
    for z in (3.0, 5.8):
        hop(4.4, .9, .16, 0, -2.75, z, 'cot')
        for x in (-2.0, -1.0, 0, 1.0, 2.0): hop(.07, .07, .85, x, -3.15, z + .16, 'kim')
        hop(4.2, .07, .07, 0, -3.15, z + 1.0, 'kim'); cua_so(0, -2.31, z + .3, 2.2, 2.0, 'kinh', 'cot')
    cua_so(1.3, -2.31, 1.2, .8, 1.0, 'kinh', 'cot')
    hop(3.6, .1, .5, 0, -2.36, 2.35, 'do'); hop(3.3, .11, .3, 0, -2.37, 2.45, 'vang'); hop(4.4, .8, .08, 0, -2.7, 2.15, 'mai2')
    for z in (3.16, 5.96):
        for x in (-1.6, 1.6): chau(x, -2.85, z, .6)
    bac(0, -2.8, 2.0, .25)
    mai_hoi(4.8, 5.8, 8.65, 1.5, 4.8); hoi(4.2, 5.0, 8.65, 1.3)
    return (-.6, -2.31, .25)
def hoian():    # nhà cổ Hội An: một tầng rưỡi, mái ngói hai tầng, mặt gỗ, đèn lồng đỏ
    hop(7.2, 5.2, .3, 0, 0, 0, 'da')
    hop(6.6, 4.2, 4.2, 0, .3, .3, 'tuong')
    hop(6.6, .12, 2.3, 0, -1.82, .3, 'go')
    for x in (-3.3, 3.3): tru(.12, 2.5, x, -2.5, .3, 'go')
    mai_hoi(7.4, 1.6, 2.75, .55, 7.4, cong=.06, y0=-2.35)
    for x in (-2.0, 2.0): cua_so(x, -1.88, 3.3, 1.1, .7, 'go', 'go')
    mai_hoi(7.4, 5.2, 4.45, 1.9, 7.4, cong=.1); hoi(6.6, 4.2, 4.5, 1.5)
    for x in (-2.2, 2.2): cau_(.24, x, -2.4, 2.35, 'do', sz=(1, 1, 1.3)); tru(.1, .08, x, -2.4, 2.66, 'vang')
    for x in (-.32, .32): cau_(.1, x, -1.95, 2.6, 'vang', sz=(1, .4, 1))   # mắt cửa
    for x in (-3.3, 3.3): tru(.2, .14, x, -2.5, .3, 'da', n=8)
    bac(0, -2.6, 1.6, .3)
    for x in (-1.3, 1.3): chau(x, -2.35, .3, .8)
    return (0, -1.92, .3)
def bietthu():  # biệt thự nhỏ: hai tầng, sảnh cột tròn, ban công, mái bốn mặt
    hop(7.6, 5.6, .4, 0, 0, 0, 'da'); hop(3.0, 1.0, .2, 0, -3.0, 0, 'da')
    hop(6.8, 4.4, 5.4, 0, .4, .4, 'tuong'); hop(3.0, 1.2, 5.4, 0, -2.2, .4, 'tuong')
    for x in (-1.3, 1.3): tru(.18, 3.0, x, -2.65, .4, 'cot', n=14)
    hop(3.4, 1.6, .2, 0, -2.3, 3.4, 'cot')
    for x in (-1.6, -.8, 0, .8, 1.6): tru(.05, .7, x, -3.0, 3.6, 'cot', n=6)
    hop(3.3, .08, .08, 0, -3.0, 4.3, 'cot')
    for x in (-2.6, 2.6):
        cua_so(x, -1.81, 1.3, 1.0, 1.4, 'kinh', 'cot'); cua_so(x, -1.81, 3.8, 1.0, 1.2, 'kinh', 'cot')
    cua_so(0, -2.81, 3.8, 1.2, 1.3, 'kinh', 'cot')
    mai_hoi(7.6, 5.4, 5.8, 2.2, 2.4); mai_hoi(3.6, 2.0, 5.65, .9, 3.6, y0=-2.2)
    for x in (-2.35, 2.35): hop(2.1, .15, .18, x, -1.87, 3.3, 'cot')
    for x in (-1.3, 1.3): hop(.5, .5, .2, x, -2.65, .4, 'cot')
    for x in (-2.1, 2.1): chau(x, -3.0, 0)
    return (0, -2.81, .4)

def ede():       # nhà dài Ê Đê (Tây Nguyên): sàn thấp, thân dài vách tre, mái tranh hai mái trùm thấp, cầu thang ngực trước
    for x in (-3.4, -1.7, 0, 1.7, 3.4):
        for y in (-1.5, 1.5): tru(.13, 1.15, x, y, 0, 'go', n=6)
    hop(7.6, 3.6, .18, 0, 0, 1.1, 'go'); hop(7.2, 3.0, 1.6, 0, .1, 1.28, 'tuong')
    for i in range(14): hop(.04, .06, 1.6, -3.4 + i * .52, -1.42, 1.28, 'tre')   # nẹp vách tre
    hop(2.4, 1.0, .12, 0, -2.0, 1.1, 'go')   # sàn khách trước cửa
    for i in range(4): hop(.5, .26, .07, 0, -2.6 - i * .26, .9 - i * .28, 'go')
    for z in (.55, 1.25): cau_(.09, 0, -2.75 - (1.25 - z) * .5, z, 'go', sz=(1, .7, 1))   # bầu ngực trên cầu thang
    mai_hoi(8.6, 5.4, 2.4, 2.6, 8.6); hoi(7.2, 3.0, 2.88, 2.1)
    return (0, -1.42, 1.28)
def trinhtuong():   # nhà trình tường Hà Nhì (Tây Bắc): tường đất nện dày, cửa nhỏ, mái bốn mặt thấp
    hop(7.4, 5.2, .25, 0, 0, 0, 'da'); hop(6.8, 4.4, 2.6, 0, .2, .25, 'tuong'); hop(6.9, 4.5, .12, 0, .2, 1.4, 'tuong')
    for x in (-2.3, 2.3): cua_so(x, -2.01, 1.4, .55, .5, 'toi')
    hop(1.6, .3, .2, 0, -2.15, 2.4, 'go'); mai_hoi(7.8, 5.6, 2.85, 1.9, 3.2)
    for x in (-3.0, 3.0): tru(.28, .5, x, -2.6, 0, 'gom', r2=.22)   # chum nước
    bac(0, -2.6, 1.4, .25); return (0, -2.01, .25)
def maila():    # nhà mái lá Nam Bộ: ba gian thấp, vách ván, mái lá dừa nước dày hai mái, hiên trước, lu nước
    hop(7.6, 5.4, .3, 0, 0, 0, 'da'); hop(7.0, 3.4, 2.2, 0, .5, .3, 'tuong')
    for i in range(13): hop(.05, .06, 2.2, -3.3 + i * .55, -1.23, .3, 'go')   # nẹp ván
    for x in (-3.3, -1.1, 1.1, 3.3): tru(.12, 2.1, x, -2.2, .3, 'go', n=6)
    for x in (-2.3, 2.3): cua_so(x, -1.21, 1.1, 1.0, .8, 'toi')
    mai_hoi(8.8, 6.6, 2.4, 2.3, 8.8); hoi(7.0, 3.4, 2.55, 1.85)
    hop(9.0, .35, .3, 0, -3.25, 2.2, 'mai2'); hop(9.0, .35, .3, 0, 3.25, 2.2, 'mai2')   # mép lá dày
    tru(.32, .7, 2.9, -2.9, 0, 'gom', r2=.24); tru(.3, .05, 2.9, -2.9, .7, 'go')   # lu nước có nắp
    bac(0, -2.7, 1.8, .3); return (0, -1.21, .3)
def phap():     # biệt thự Pháp cổ (Đông Dương): hai tầng tường vàng, cửa chớp xanh, hiên vòm, ban công, mái ngói đỏ bốn mặt, ống khói
    hop(7.6, 5.6, .5, 0, 0, 0, 'da'); hop(6.8, 4.4, 5.4, 0, .4, .5, 'tuong')
    for x in (-2.2, 0, 2.2):   # hiên ba vòm tầng một
        tru(.17, 2.4, x - 1.1, -2.4, .5, 'cot', n=12); tru(.17, 2.4, x + 1.1, -2.4, .5, 'cot', n=12)
    hop(6.8, 1.2, .3, 0, -2.4, 2.9, 'tuong'); hop(6.9, 1.4, .12, 0, -2.4, 3.2, 'cot')
    for i in range(23): tru(.04, .62, -3.3 + i * .3, -3.0, 3.32, 'cot', n=6)   # lan can con tiện
    hop(6.9, .1, .1, 0, -3.0, 3.94, 'cot')
    for x in (-2.2, 0, 2.2):
        for z in (1.0, 3.7):
            cua_so(x, -1.81, z, .8, 1.5, 'kinh', 'cot')
            for s in (-1, 1): hop(.42, .06, 1.5, x + s * .64, -1.86, z, 'chop')   # hai cánh chớp mở
    mai_hoi(7.8, 5.8, 5.9, 2.0, 3.0); tru(.25, 1.6, 2.2, 1.0, 6.4, 'tuong', n=4)
    bac(0, -3.1, 2.4, .5); return (0, -1.81, .5)
NHA = [('bagian', bagian), ('ruong', ruong), ('maithai', maithai), ('maibang', maibang), ('nhasan', nhasan), ('nhaong', nhaong), ('hoian', hoian), ('bietthu', bietthu),
       ('ede', ede), ('trinhtuong', trinhtuong), ('maila', maila), ('phap', phap)]
# ---------------- cấp nhà: 1 nhỏ (bản thu nhỏ), 2 khang trang (bản gốc), 3 dinh thự 2 ô ----------------
# cấp 1 và 3 dùng chung lưới với cấp 2 (glTF chỉ lưu một lần), chỉ khác vị trí, tỉ lệ; dinh thự thêm nền chung 'dinh_nen'.
# Nền dinh thự phủ cả hai ô và hàng rào giữa: rộng 22.8 x 10.8, cao .7, tâm ở giữa hai ô (ô cách nhau 12 m); web nâng mặt đi lên .7 ở đây (js/20 oDat, js/26 caoTai).
K1, K3, CANH3, NEN_Z = (.74, .86, .86), (1.15, 1.05, 1.1), (.62, .85, .85), .7
def dinh_nen():
    hop(22.8, 10.8, NEN_Z - .06, 0, -1.0, 0, 'da'); hop(22.0, 10.0, .06, 0, -1.0, NEN_Z - .06, 'co')
    for x in (-11.2, 11.2): hop(.4, 10.8, .1, x, -1.0, NEN_Z - .06, 'da')
    hop(22.8, .4, .1, 0, 4.2, NEN_Z - .06, 'da')
    for s in (-1, 1): hop(10.0, .4, .1, s * 6.4, -6.2, NEN_Z - .06, 'da')
    for i in range(4): hop(3.0, .3, NEN_Z * (4 - i) / 5, 0, -6.55 - i * .3, 0, 'da')   # bậc lên giữa
    for s in (-1, 1):   # lan can đá hai bên lối lên, cột đèn ở góc
        for i in range(12): tru(.06, .5, s * (1.9 + i * .8), -6.25, NEN_Z, 'cot', n=6)
        hop(9.3, .14, .1, s * 6.3, -6.25, NEN_Z + .5, 'cot')
        tru(.16, 1.3, s * 1.75, -6.3, NEN_Z, 'da', n=8); cau_(.22, s * 1.75, -6.3, NEN_Z + 1.5, 'den', sz=(1, 1, 1.2))
        tru(.16, 1.3, s * 11.0, -6.0, NEN_Z, 'da', n=8); cau_(.22, s * 11.0, -6.0, NEN_Z + 1.5, 'den', sz=(1, 1, 1.2))
    return gom('dinh_nen')
NEN = dinh_nen()
def ban_sao(ten, o, loc, k, cha=None):   # vật thể dùng chung lưới, chỉ khác vị trí và tỉ lệ
    c = bpy.data.objects.new(ten, o.data); sc.collection.objects.link(c); c.parent = cha; c.location = loc; c.scale = k; return c
for i, (k, f) in enumerate(NHA):
    cx, cy, cz = f(); o = gom('nha_' + k, X=i * 10)
    e = nut_rong('o_cua_' + k, cx, cy, cz); e.parent = o; e.location = (cx, cy, cz)
    o1 = ban_sao('nha_%s_1' % k, o, (i * 10, -16, 0), K1)
    e = nut_rong('o_cua_%s_1' % k, 0, 0, 0); e.parent = o1; e.location = (cx, cy, cz)   # trong toạ độ của nhà nên tự co theo
    g3 = bpy.data.objects.new('nha_%s_3' % k, None); sc.collection.objects.link(g3); g3.location = (i * 26, -40, 0)
    ban_sao('nha_%s_3_nen' % k, NEN, (0, 0, 0), (1, 1, 1), g3); ban_sao('nha_%s_3_chinh' % k, o, (0, .2, NEN_Z), K3, g3)
    for s in (-1, 1): ban_sao('nha_%s_3_chai%d' % (k, s + 1), o, (s * 6.9, .5, NEN_Z), CANH3, g3)
    e = nut_rong('o_cua_%s_3' % k, 0, 0, 0); e.parent = g3; e.location = (cx * K3[0], cy * K3[1] + .2, cz * K3[2] + NEN_Z)
NEN.location = (0, -80, 0)

# ---------------- cửa (rộng 1.3, cao 2.2, gốc ở chân giữa) ----------------
def cua_go():
    hop(1.5, .12, 2.35, 0, 0, 0, 'go'); hop(.6, .14, 2.15, -.32, -.02, .05, 'go'); hop(.6, .14, 2.15, .32, -.02, .05, 'go')
    for x in (-.32, .32):
        for z in (.4, 1.3): hop(.42, .16, .6, x, -.04, z, 'toi')
    cau_(.04, -.06, -.12, 1.1, 'vang'); cau_(.04, .06, -.12, 1.1, 'vang')
def cua_kinh():
    hop(1.5, .1, 2.35, 0, 0, 0, 'kim'); hop(1.3, .12, 2.15, 0, -.02, .05, 'kinh')
    hop(.05, .14, 2.15, 0, -.03, .05, 'kim'); hop(1.3, .14, .05, 0, -.03, 1.6, 'kim')
def cua_vom():
    hop(1.5, .12, 1.9, 0, 0, 0, 'cot'); tru(.75, .12, 0, 0, 1.9, 'cot', n=16); bpy.context.object.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.object.location = (0, .06, 1.9); bpy.ops.object.transform_apply(rotation=True, location=True)
    hop(1.2, .14, 1.85, 0, -.02, .05, 'go'); tru(.6, .14, 0, 0, 1.9, 'go', n=16); bpy.context.object.rotation_euler = (math.pi / 2, 0, 0)
    bpy.context.object.location = (0, .05, 1.9); bpy.ops.object.transform_apply(rotation=True, location=True)
    cau_(.05, .4, -.12, 1.0, 'vang')
for i, (k, f) in enumerate([('cua_go', cua_go), ('cua_kinh', cua_kinh), ('cua_vom', cua_vom)]):
    f(); o = gom(k, X=i * 3); o.location.y = -14

# ---------------- đồ trang trí ----------------
def dao():      # cây đào: thân nâu, tán hoa hồng
    tru(.14, 1.6, 0, 0, 0, 'go', n=6, r2=.08)
    for (x, y, z, r) in ((0, 0, 1.9, .75), (.45, .2, 1.6, .5), (-.45, -.1, 1.65, .5), (.1, -.35, 2.2, .45)): cau_(r, x, y, z, 'hong', sz=(1, 1, .8))
def sen():      # ao sen: mặt nước bầu dục, lá và hoa
    tru(1.3, .08, 0, 0, 0, 'da', n=16); tru(1.15, .1, 0, 0, .01, 'nuoc', n=16)
    for (x, y) in ((-.5, .2), (.3, -.4), (.55, .35), (-.2, -.5), (0, .55)): tru(.22, .03, x, y, .11, 'la', n=8)
    for (x, y) in ((-.45, .25), (.5, .3)): cau_(.1, x, y, .22, 'hong', sz=(1, 1, 1.4))
def cau():      # hàng cau: ba cây thân mảnh, tán lá
    for (x, y) in ((0, -1.0), (0, 0), (0, 1.0)):
        tru(.07, 3.2, x, y, 0, 'cot', n=6, r2=.05)
        for a in range(6):
            bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=.15, depth=1.1, location=(x + math.cos(a) * .45, y + math.sin(a) * .45, 3.15))
            o = them(bpy.context.object, 'la'); o.rotation_euler = (math.sin(a) * 1.1, -math.cos(a) * 1.1, 0)
def rao():      # rào tre phía trước, chừa lối vào giữa
    for s in (-1, 1):
        for i in range(9):
            x = s * (1.0 + i * .35); tru(.04, .9, x, 0, 0, 'tre', n=5)
        hop(2.9, .05, .05, s * 2.4, 0, .35, 'tre'); hop(2.9, .05, .05, s * 2.4, 0, .7, 'tre')
def den():      # đèn lồng lối đi: hai cột đèn
    for x in (-.9, .9):
        tru(.05, 1.4, x, 0, 0, 'go', n=6); cau_(.18, x, 0, 1.55, 'do', sz=(1, 1, 1.25)); tru(.08, .06, x, 0, 1.75, 'vang', n=8)
def xemay():    # xe máy tay ga
    for y in (-.55, .55): tru(.25, .1, 0, y, .25, 'toi', n=12); bpy.context.object.rotation_euler = (0, math.pi / 2, 0)
    hop(.32, 1.2, .3, 0, 0, .3, 'do'); hop(.3, .55, .2, 0, .2, .6, 'toi'); hop(.25, .2, .55, 0, -.5, .35, 'do'); hop(.6, .06, .06, 0, -.55, .95, 'kim')
def xedap():    # xe đạp
    for y in (-.5, .5): tru(.3, .04, 0, y, .3, 'toi', n=14); bpy.context.object.rotation_euler = (0, math.pi / 2, 0)
    hop(.05, .95, .05, 0, 0, .55, 'la'); hop(.05, .05, .5, 0, .15, .35, 'la'); hop(.18, .25, .05, 0, .15, .85, 'toi'); hop(.5, .05, .05, 0, -.5, .9, 'kim')
def oto():      # ô tô con
    hop(1.6, 3.4, .55, 0, 0, .3, 'tuong'); hop(1.4, 1.8, .5, 0, .2, .85, 'tuong'); hop(1.42, 1.5, .38, 0, .2, .9, 'kinh')
    for x in (-.75, .75):
        for y in (-1.1, 1.1): tru(.3, .22, x, y, .3, 'toi', n=12); bpy.context.object.rotation_euler = (0, math.pi / 2, 0)
    for x in (-.55, .55): hop(.25, .05, .12, x, -1.71, .6, 'den')
def binhsen():  # bình hoa sen: bình sứ men lam, hoa và lá sen
    tru(.3, .62, 0, 0, 0, 'su', n=14, r2=.2); tru(.2, .1, 0, 0, 0, 'xanhsu', n=14, r2=.3); tru(.31, .07, 0, 0, .32, 'xanhsu', n=14)
    tru(.16, .22, 0, 0, .62, 'su', n=14, r2=.22); tru(.23, .05, 0, 0, .82, 'xanhsu', n=14)
    for (x, y, h) in ((0, 0, .9), (.14, .06, .7), (-.13, -.05, .62), (.05, -.12, .78)):
        tru(.015, h, x * .6, y * .6, .8, 'la', n=4, r2=.012); cau_(.09, x, y, .8 + h + .05, 'hong', sz=(1, 1, 1.35))
    for (x, y) in ((.3, .1), (-.28, .12)): cau_(.22, x, y, 1.2, 'la', sz=(1, 1, .18))
def chan(sx, sy, h, x0, y0, t='go2', w=.07):   # bốn chân bàn ghế
    for x in (x0 - sx / 2 + w / 2, x0 + sx / 2 - w / 2):
        for y in (y0 - sy / 2 + w / 2, y0 + sy / 2 - w / 2): hop(w, w, h, x, y, 0, t)
def am_chen(x, y, z):       # ấm trà và bốn chén
    tru(.1, .13, x, y, z, 'su', n=10, r2=.07); cau_(.03, x, y, z + .15, 'su'); hop(.09, .03, .03, x - .12, y, z + .08, 'su')
    for (dx, dy) in ((.2, .08), (.2, -.08), (-.2, .1), (-.2, -.1)): tru(.04, .05, x + dx, y + dy, z, 'xanhsu', n=8, r2=.05)
def truongky():   # bộ trường kỷ gỗ gụ: ghế dài tựa lưng, bàn nước, hai đôn
    chan(2.2, .6, .42, 0, .5); hop(2.2, .6, .1, 0, .5, .42, 'go2'); hop(2.2, .08, .6, 0, .78, .52, 'go2'); hop(2.3, .12, .08, 0, .78, 1.12, 'go2')
    for x in (-1.08, 1.08): hop(.08, .6, .3, x, .5, .52, 'go2')
    hop(1.6, .02, .3, 0, .73, .65, 'do')   # nệm tựa
    chan(1.1, .6, .44, 0, -.35); hop(1.2, .7, .06, 0, -.35, .44, 'go2'); am_chen(0, -.35, .5)
    for x in (-1.0, 1.0): tru(.2, .42, x, -.35, 0, 'go2', n=10, r2=.17)
def sap():        # sập gụ: mặt phản dày, diềm chạm, chân quỳ, chiếu và khay trà
    hop(2.0, 1.4, .14, 0, 0, .38, 'go2'); hop(1.94, 1.34, .2, 0, 0, .18, 'go2')
    chan(1.96, 1.36, .2, 0, 0, 'go2', .14); hop(1.8, 1.2, .02, 0, 0, .52, 'tre')
    hop(.6, .4, .1, .4, 0, .54, 'go2'); am_chen(.4, 0, .64)
def tuche():      # tủ chè: thân gỗ gụ, ô kính, bày bình và ấm chén
    chan(1.5, .5, .12, 0, 0); hop(1.5, .5, .78, 0, 0, .12, 'go2'); hop(1.56, .54, .05, 0, 0, .9, 'go2')
    for x in (-.37, .37): hop(.6, .04, .5, x, -.25, .25, 'go'); cau_(.025, x * .2, -.29, .5, 'vang')
    hop(1.4, .44, .55, 0, .02, .95, 'kinh'); hop(1.5, .5, .05, 0, 0, 1.5, 'go2')
    for x in (-.73, 0, .73): hop(.05, .5, .55, x, 0, .95, 'go2')
    am_chen(-.35, 0, 1.55); tru(.1, .3, .45, 0, 1.55, 'su', n=10, r2=.06); tru(.07, .05, .45, 0, 1.6, 'xanhsu', n=10)
def tuao():       # tủ áo gỗ mở hai cánh, thanh treo bên trong (áo gắn vào tủ trên web)
    hop(1.6, .05, 2.0, 0, .28, .1, 'go2'); hop(.05, .6, 2.0, -.78, 0, .1, 'go2'); hop(.05, .6, 2.0, .78, 0, .1, 'go2')
    hop(1.66, .64, .08, 0, 0, 2.1, 'go2'); hop(1.6, .6, .1, 0, 0, 0, 'go2'); hop(1.5, .55, .02, 0, 0, .1, 'go')
    hop(1.5, .03, .03, 0, 0, 1.78, 'kim')
    for s in (-1, 1): hop(.04, .78, 1.92, s * .82, -.68, .14, 'go2'); hop(.05, .5, 1.5, s * .84, -.68, .36, 'go')
def moc(x=0):     # móc áo
    hop(.42, .03, .03, x, 0, 1.68, 'kim'); hop(.02, .02, .1, x, 0, 1.71, 'kim')
def aodai():      # áo dài đỏ: thân ôm, tà dài, tay dài, quần trắng
    moc(); hop(.36, .12, .5, 0, 0, 1.18, 'lua'); hop(.12, .12, .08, 0, 0, 1.66, 'lua')
    hop(.32, .06, .9, 0, -.04, .3, 'lua'); hop(.32, .06, .8, 0, .04, .38, 'lua')
    for s in (-1, 1): hop(.07, .08, .62, s * .22, 0, .9, 'lua')
    for s in (-1, 1): hop(.12, .08, .5, s * .08, 0, .28, 'cot')
def quanphuc():   # quân phục: áo xanh lá, cúc vàng, cầu vai, quần, mũ trên giá
    moc(); hop(.48, .16, .62, 0, 0, 1.02, 'xanh'); hop(.5, .16, .05, 0, 0, 1.6, 'xanh')
    for s in (-1, 1): hop(.1, .14, .58, s * .29, 0, 1.0, 'xanh'); hop(.08, .17, .04, s * .16, 0, 1.6, 'do')
    for z in (1.1, 1.25, 1.4): cau_(.022, 0, -.09, z, 'vang')
    hop(.44, .12, .7, 0, .03, .3, 'xanh'); hop(.46, .13, .05, 0, .03, 1.0, 'toi')
    cau_(.17, 0, .12, 1.86, 'xanh', sz=(1, 1, .55)); cau_(.04, 0, -.04, 1.88, 'vang')
def aolen():      # áo len mẹ đan: thân rộng, sọc kem, cổ tròn
    moc(); hop(.52, .18, .6, 0, 0, 1.06, 'len'); cau_(.08, 0, 0, 1.66, 'len', sz=(1, .6, .5))
    for s in (-1, 1): hop(.13, .17, .6, s * .32, 0, 1.0, 'len')
    for z in (1.18, 1.32): hop(.53, .19, .04, 0, 0, z, 'cot')
    hop(.53, .19, .08, 0, 0, 1.0, 'toi')
DO = [('dao', dao), ('sen', sen), ('cau', cau), ('rao', rao), ('den', den), ('xemay', xemay), ('xedap', xedap), ('oto', oto), ('binhsen', binhsen),
      ('truongky', truongky), ('sap', sap), ('tuche', tuche), ('tuao', tuao), ('aodai', aodai), ('quanphuc', quanphuc), ('aolen', aolen)]
# ---------------- ranh giới ô đất (thay hàng rào xanh nướng sẵn): gốc ở tâm bãi cỏ 10 x 10 của ô, chừa lối vào 2.4 m phía trước ----------------
def vong(dung):   # gọi dung(x0, y0, x1, y1) cho từng đoạn: sau, hai bên, hai nửa trước
    a, b = 4.85, 1.2
    for x0, y0, x1, y1 in ((-a, a, a, a), (-a, -a, -a, a), (a, -a, a, a), (-a, -a, -b, -a), (b, -a, a, -a)): dung(x0, y0, x1, y1)
def doan_hop(x0, y0, x1, y1, d, h, t, z=0):
    hop(abs(x1 - x0) + d, abs(y1 - y0) + d, h, (x0 + x1) / 2, (y0 + y1) / 2, z, t)
def ranh_xanh(): vong(lambda *p: doan_hop(*p, .46, .5, 'rao'))
def ranh_gach():
    def d(x0, y0, x1, y1):
        doan_hop(x0, y0, x1, y1, .3, .55, 'gach'); doan_hop(x0, y0, x1, y1, .38, .07, 'da', .55)
        n = max(1, round(max(abs(x1 - x0), abs(y1 - y0)) / 2.4))
        for i in range(n + 1): hop(.42, .42, .8, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 0, 'gach')
    vong(d)
def ranh_tre():
    def d(x0, y0, x1, y1):
        n = max(1, round(max(abs(x1 - x0), abs(y1 - y0)) / .6))
        for i in range(n + 1): tru(.05, .8, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n, 0, 'tre', n=6)
        for z in (.3, .62): doan_hop(x0, y0, x1, y1, .06, .06, 'tre', z)
    vong(d)
def ranh_hoa():
    def d(x0, y0, x1, y1):
        doan_hop(x0, y0, x1, y1, .5, .22, 'da'); doan_hop(x0, y0, x1, y1, .4, .06, 'toi', .22)
        n = max(1, round(max(abs(x1 - x0), abs(y1 - y0)) / .55))
        for i in range(n + 1):
            x, y = x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n
            cau_(.2, x, y, .38, 'la', sz=(1, 1, .8)); cau_(.09, x + .06, y - .05, .55, ('hong', 'vang2', 'cot')[i % 3])
    vong(d)
RANH = [('xanh', ranh_xanh), ('gach', ranh_gach), ('tre', ranh_tre), ('hoa', ranh_hoa)]
for i, (k, f) in enumerate(RANH):
    f(); o = gom('ranh_' + k, X=i * 12); o.location.y = 30
for i, (k, f) in enumerate(DO):
    f(); o = gom('do_' + k, X=i * 4); o.location.y = 12

# chuẩn hoá: mọi vật về gốc toạ độ khi xuất (web tự đặt chỗ); gốc vật thể = (0,0,0) cục bộ
for o in list(sc.objects):
    if o.parent is None: o.location.x = o.location.x;
bpy.ops.object.select_all(action='DESELECT')

if XEM:   # ảnh xem trước: đặt tất cả thành hàng, chụp từ góc iso giống web
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE_NEXT'
    w = bpy.data.worlds.new('w'); w.color = (.9, .92, .95); sc.world = w
    s = bpy.data.objects.new('nang', bpy.data.lights.new('nang', 'SUN')); s.data.energy = 3.5; s.rotation_euler = (math.radians(50), 0, math.radians(30)); sc.collection.objects.link(s)
    c = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); c.data.type = 'ORTHO'; c.data.ortho_scale = 190; sc.collection.objects.link(c); sc.camera = c
    el, az = math.radians(42), math.radians(-38); tg = Vector((100, -25, 2)); d = Vector((math.sin(az) * math.cos(el), -math.cos(az) * math.cos(el), math.sin(el)))
    c.location = tg + d * 120; c.rotation_euler = (-d).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x, sc.render.resolution_y = 1800, 1200; sc.render.filepath = XEM; bpy.ops.render.render(write_still=True)
    for o in (s, c): bpy.data.objects.remove(o)

for o in sc.objects:
    if o.parent is None: o.location = (0, 0, 0)
bpy.ops.export_scene.gltf(filepath=RA, export_format='GLB', export_apply=True, export_yup=True, export_materials='EXPORT', export_extras=False, export_cameras=False, export_lights=False)
print('XONG', RA, len([o for o in sc.objects if o.type == 'MESH']))
