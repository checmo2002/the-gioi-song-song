"""NPC đời thường mới, ghép từ bộ phận đất nặn của TuyChinh (cùng bộ xương 24 khớp, cùng động tác Idle/Walk/Pray/Bow của ThanhNien).
blender -b --python nv-npc-moi.py -- <TuyChinh.json> <thư mục ra> [thư mục ảnh xem]
Trong Blender đang mở (Blender MCP): đặt ARGS = [...] cùng thứ tự rồi exec file này (không reset Blender để addon còn chạy).
Mỗi mẫu ra <thư mục ra>/<Tên>.json (glTF nhúng base64, nén meshopt) như img/3d/nv/*.json, và <Tên>.png nếu có thư mục ảnh.
  TreEm          bé trai: người 0,62, đầu to hơn cho tỉ lệ trẻ con
  CuOngTocBac    cụ ông tóc bạc, râu bạc, sơ mi màu be
  ThanhNienSoMi  thanh niên sơ mi trắng, quần sẫm
  NguoiCamO      phụ nữ áo bà ba xanh xám cầm ô; tay phải giữ cố định ở tư thế cầm ô trong mọi động tác
Màu ghi mã sRGB như CSS; vật liệu không để web nhuộm (khác TuyChinh)."""
import bpy, bmesh, sys, os, json, base64, struct, math
from mathutils import Vector, Matrix
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else ARGS   # noqa: F821 (ARGS đặt sẵn khi exec trong Blender đang mở)
NGUON, RA, XEM = A[0], A[1], (A[2] if len(A) > 2 else None)

def json2glb(src, dst):
    j = json.load(open(src)); b = base64.b64decode(j['buffers'][0].pop('uri').split(',')[1])
    js = json.dumps(j, separators=(',', ':')).encode(); js += b' ' * ((4 - len(js) % 4) % 4); b += b'\0' * ((4 - len(b) % 4) % 4)
    open(dst, 'wb').write(struct.pack('<III', 0x46546C67, 2, 28 + len(js) + len(b)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(b), 0x004E4942) + b)
def glb2json(src, dst):
    b = open(src, 'rb').read(); o, j, bin_ = 12, None, b''
    while o < len(b):
        L, T = struct.unpack('<II', b[o:o + 8]); d = b[o + 8:o + 8 + L]; o += 8 + L
        if T == 0x4E4F534A: j = json.loads(d)
        elif T == 0x004E4942: bin_ = d
    j['buffers'][0]['uri'] = 'data:application/octet-stream;base64,' + base64.b64encode(bin_).decode()
    json.dump(j, open(dst, 'w'), separators=(',', ':'))

def lin(h):   # '#rrggbb' sRGB -> màu tuyến tính cho Blender/glTF
    return tuple(((int(h[i:i + 2], 16) / 255 + .055) / 1.055) ** 2.4 for i in (1, 3, 5))
def mat(ten, h):
    m = bpy.data.materials.new(ten); m.use_nodes = True; c = (*lin(h), 1); m.diffuse_color = c
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = c; b.inputs['Roughness'].default_value = .8
    return m

DA = '#efc7a8'
BO = {
    'TreEm': dict(phan=['than_nam', 'mat_1', 'toc_ngan', 'ao_thun', 'quan_dai', 'giay'], co=.62, dau=1.28,
                  mau=dict(da=DA, toc='#2a1f18', ao='#9cc0d8', ao2='#e8eef2', quan='#3d4a63', giay='#7a4f33', moi='#c46a62')),
    'CuOngTocBac': dict(phan=['than_nam', 'mat_3', 'toc_ngan', 'ao_somi', 'quan_dai', 'giay'], rau=1,
                        mau=dict(da='#e6b896', toc='#d9d6cf', ao='#d7cbb2', ao2='#efe8da', quan='#5a4a3c', giay='#3a2a1e', moi='#a3625a', rau='#e4e1da')),
    'ThanhNienSoMi': dict(phan=['than_nam', 'mat_1', 'toc_mai', 'ao_somi', 'quan_dai', 'giay'],
                          mau=dict(da=DA, toc='#1c1512', ao='#f4f3ee', ao2='#dcdad2', quan='#262b38', giay='#2b211b', moi='#a3625a')),
    'NguoiCamO': dict(phan=['than_nu', 'mi_nu', 'mat_2', 'toc_bui', 'ao_baba', 'quan_rong', 'giay'], nu=1, o=1,
                      mau=dict(da=DA, toc='#1f1714', ao='#6f8494', ao2='#9aaab5', quan='#2d2a2c', giay='#3a2a1e', moi='#cf4f5c', hong='#f2a6a0', o='#8e3a2c', can='#3b2a1f')),
}
GIU_MAU = {'mat': '#100b0a', 'trang': '#ffffff', 'hong': '#f5a8a0'}

def don():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o)
    for a in list(bpy.data.actions): bpy.data.actions.remove(a)   # có fake user nên phải xoá tay, không thì xuất lẫn sang mẫu sau
    for coll in (bpy.data.meshes, bpy.data.armatures, bpy.data.actions, bpy.data.materials, bpy.data.images): [coll.remove(x) for x in list(coll) if x.users == 0]

def nap():
    g = os.path.join(RA, '_TuyChinh.glb'); json2glb(NGUON, g); bpy.ops.import_scene.gltf(filepath=g); os.remove(g)
    return next(o for o in bpy.data.objects if o.type == 'ARMATURE')

def gan(o, arm, xuong):   # vật mới gắn trọn vào một xương, toạ độ đỉnh đang ở thế giới
    o.parent = arm; o.matrix_parent_inverse = arm.matrix_world.inverted()
    o.vertex_groups.new(name=xuong).add(list(range(len(o.data.vertices))), 1, 'REPLACE')
    m = o.modifiers.new('xuong', 'ARMATURE'); m.object = arm

def khoi(ten, pts, m):   # các ellipsoid (tâm, bán kính) gộp một lưới mượt
    bm = bmesh.new()
    for c, r in pts: bmesh.ops.create_uvsphere(bm, u_segments=16, v_segments=10, radius=1, matrix=Matrix.Translation(Vector(c)) @ Matrix.Diagonal((*r, 1)))
    me = bpy.data.meshes.new(ten); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new(ten, me); bpy.context.scene.collection.objects.link(o)
    for p in me.polygons: p.use_smooth = True
    me.materials.append(m); return o

def rau(arm, m):   # chòm râu ngắn dưới cằm, mặt quay về -Y (đầu tâm (0,-.005,1.145), bán kính (.16,.15,.175))
    gan(khoi('rau', [((0, -.118, .99), (.05, .03, .028)), ((0, -.112, .965), (.03, .022, .03))], m), arm, 'Head')

def dau_to(objs, arm, k):   # phóng đầu quanh cằm theo trọng số xương đầu (mượt ở cổ)
    tam = Vector((0, -.005, 1.0)); dau = {'Head', 'head_end', 'headfront'}
    for o in objs:
        G = {g.index: g.name for g in o.vertex_groups}; Mw = o.matrix_world; Mi = Mw.inverted()
        for v in o.data.vertices:
            w = min(1, sum(x.weight for x in v.groups if G[x.group] in dau))
            if w > 0: p = Mw @ v.co; v.co = Mi @ (tam + (p - tam) * (1 + (k - 1) * w))

def cam_o(arm, mo, mc):
    """Tay phải co trước ngực giữ cán ô thẳng đứng: tính tư thế một lần rồi khoá góc vai và 3 khớp tay phải trong mọi động tác.
    Ô dựng ở tư thế đã co tay rồi đưa ngược về tư thế T để gắn trọn vào xương RightHand."""
    sc = bpy.context.scene; arm.animation_data.action = bpy.data.actions['Idle']; sc.frame_set(1); sc.frame_set(0)   # đổi khung để Blender tính lại tư thế Idle (đang ở khung 0 thì frame_set(0) không làm gì)
    Mi = arm.matrix_world.inverted(); pb = arm.pose.bones
    # IK của Blender lệch vì đuôi xương tay RigThanhNien dài bất thường: tự tính khuỷu (hai đoạn vai-khuỷu, khuỷu-cổ tay) rồi xoay từng xương cho trúng
    W, P = Vector((-20, -15, 84)), Vector((-45, 15, 60))   # cổ tay muốn tới, hướng khuỷu chĩa (cm, khung xương: trước mặt là -Y, bên phải là -X)
    S, E0, W0 = pb['RightArm'].head.copy(), pb['RightForeArm'].head.copy(), pb['RightHand'].head.copy()
    L1, L2 = (E0 - S).length, (W0 - E0).length; d = min((W - S).length, L1 + L2 - .01); u = (W - S).normalized(); W = S + u * d
    a = (L1 * L1 - L2 * L2 + d * d) / (2 * d); v = ((P - S) - u * u.dot(P - S)).normalized(); E = S + u * a + v * math.sqrt(max(0, L1 * L1 - a * a))
    def ngam(b, goc, dau, muon):   # xoay xương b quanh điểm goc để điểm dau chĩa theo hướng muon
        R = (dau - goc).rotation_difference(muon).to_matrix().to_4x4()
        b.matrix = Matrix.Translation(goc) @ R @ Matrix.Translation(-goc) @ b.matrix; bpy.context.view_layer.update()
    ngam(pb['RightArm'], S, E0, E - S); ngam(pb['RightForeArm'], E, pb['RightHand'].head.copy(), W - E)
    pb['RightHand'].rotation_quaternion = (1, 0, 0, 0); bpy.context.view_layer.update()
    assert (pb['RightHand'].head - W).length < 1, pb['RightHand'].head   # tự kiểm: cổ tay đã tới đích (cm)
    tay = {t: pb[t].rotation_quaternion.copy() for t in ('RightShoulder', 'RightArm', 'RightForeArm', 'RightHand')}   # khoá cả vai: Walk lắc vai làm ô nghiêng 45°
    for a in bpy.data.actions:   # khoá góc tay phải: thay đường cong xoay của 3 khớp bằng hằng số
        cs = [c for l in a.layers for s in l.strips for b in s.channelbags for c in b.fcurves] if getattr(a, 'layers', None) else list(a.fcurves)
        for c in cs:
            for t, q in tay.items():
                if c.data_path == 'pose.bones["%s"].rotation_quaternion' % t:
                    for k in c.keyframe_points: k.co[1] = q[c.array_index]; k.handle_left[1] = k.handle_right[1] = q[c.array_index]
    sc.frame_set(1); sc.frame_set(0); bpy.context.view_layer.update()
    h = pb['RightHand']; D = arm.matrix_world @ (h.matrix @ h.bone.matrix_local.inverted()) @ Mi   # biến dạng tư thế T -> tư thế cầm, toạ độ thế giới
    ve = D.inverted()
    tay_cam = arm.matrix_world @ h.matrix @ Vector((0, 6, 0))   # giữa lòng bàn tay, 6 cm từ cổ tay (đuôi xương RigThanhNien dài bất thường, không dùng độ dài xương)
    x, y, z = tay_cam
    can = [((x, y, z - .08 + i * .06), (.009, .009, .04)) for i in range(17)]   # cán từ dưới tay lên quá đầu
    bm = bmesh.new()   # tán ô giấy: nón nông liền mặt, mép cách tay 0,8 m
    bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=.5, radius2=.015, depth=.2, matrix=Matrix.Translation((x, y, z + .9)))
    me = bpy.data.meshes.new('o_tan'); bm.to_mesh(me); bm.free(); o1 = bpy.data.objects.new('o_tan', me); bpy.context.scene.collection.objects.link(o1); me.materials.append(mo)
    o2 = khoi('o_can', can + [((x, y, z - .1), (.02, .02, .02))], mc)
    for o in (o1, o2):
        for v in o.data.vertices: v.co = ve @ v.co
        gan(o, arm, 'RightHand')

def xuat(ten, arm):
    sc = bpy.context.scene
    for o in sc.objects: o.select_set(o == arm or (o.parent == arm and o.type == 'MESH'))
    g = os.path.join(RA, ten + '.glb')
    bpy.ops.export_scene.gltf(filepath=g, export_format='GLB', use_selection=True, export_yup=True, export_skins=True, export_morph=False, export_animations=True,
                              export_animation_mode='ACTIONS', export_materials='EXPORT', export_extras=False, export_cameras=False, export_lights=False,
                              export_meshopt_compression_enable=True)
    glb2json(g, os.path.join(RA, ten + '.json')); os.remove(g)
    print('XUAT', ten, os.path.getsize(os.path.join(RA, ten + '.json')))

def chup(ten, arm):   # ảnh xem: Idle khung 12, nhìn chéo 3/4 trước, nền ngà
    sc = bpy.context.scene; arm.animation_data.action = bpy.data.actions['Idle']; sc.frame_set(12)
    eng = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items]
    sc.render.engine = 'BLENDER_EEVEE' if 'BLENDER_EEVEE' in eng else 'BLENDER_EEVEE_NEXT'
    w = bpy.data.worlds.get('xem') or bpy.data.worlds.new('xem'); sc.world = w; w.use_nodes = True
    w.node_tree.nodes['Background'].inputs[0].default_value = (.93, .88, .8, 1); w.node_tree.nodes['Background'].inputs[1].default_value = .8
    l = bpy.data.objects.new('den', bpy.data.lights.new('den', 'SUN')); l.data.energy = 3.2; l.rotation_euler = (.75, 0, -.5); sc.collection.objects.link(l)
    c = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); c.data.lens = 60; sc.collection.objects.link(c); sc.camera = c
    cao = 1.9   # mọi mẫu chung một khung (người lớn 1,3 m + ô) để so được tỉ lệ
    tam = Vector((0, 0, cao * .5)); c.location = tam + Vector((-.36, -.92, .16)) * cao * 3.4
    c.rotation_euler = (tam - c.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.resolution_x, sc.render.resolution_y = 600, 900; sc.render.film_transparent = False
    sc.render.filepath = os.path.join(XEM, ten + '.png'); bpy.ops.render.render(write_still=True)
    bpy.data.objects.remove(l); bpy.data.objects.remove(c)

os.makedirs(RA, exist_ok=True)
for ten, b in BO.items():
    don(); arm = nap(); M = {k: mat(k, h) for k, h in {**GIU_MAU, **b['mau']}.items()}
    for o in [o for o in bpy.data.objects if o.type == 'MESH']:
        if o.parent != arm or o.name not in b['phan']: bpy.data.objects.remove(o); continue
        bpy.context.view_layer.objects.active = o
        if o.data.shape_keys:   # áo quần có khoá dáng 'nu': nữ thì nướng cứng dáng nữ vào lưới
            k = [d.co.copy() for d in o.data.shape_keys.key_blocks['nu' if b.get('nu') else 'Basis'].data]; o.shape_key_clear()
            for v, c in zip(o.data.vertices, k): v.co = c
        for i, m in enumerate(o.data.materials): o.data.materials[i] = M[m.name.split('.')[0]]
        o.name = o.data.name = ten + '_' + o.name
    for a in bpy.data.actions: a.use_fake_user = True
    if b.get('rau'): rau(arm, M['rau'])
    if b.get('o'): cam_o(arm, M['o'], M['can'])
    if b.get('dau'): dau_to([o for o in bpy.data.objects if o.parent == arm and o.type == 'MESH'], arm, b['dau'])
    if b.get('co'): arm.scale = arm.scale * b['co']
    arm.name = 'Rig' + ten; bpy.context.view_layer.update()
    xuat(ten, arm)
    if XEM: chup(ten, arm)
print('XONG')
