"""Sảnh Song Song -> web 3D kiểu đất nặn (cùng quy trình chân núi: canh-dat-set.py + nuong-canh.py + nuong-cay.py, gộp một file).
blender -b <bản sao song-song-sanh-iso.blend> --python nuong-sanh.py -- <thư mục ra> [số mẫu=256] [ảnh nền=2048] [ảnh vật=4096]
Ra: canh.glb (nền + 3 khối vật, UV nướng), nen.png, vat-0.png (sân, nhà), vat-1.png (cảnh xa), vat-3.png (đồ nhỏ),
    tuong.glb (hai tượng, ảnh màu gốc, trình duyệt tự chiếu sáng),
    cay.glb (cây: pháp tuyến + màu đỉnh, trình duyệt tự chiếu sáng), thong-tin.json (camera ảnh iso, nắng).
Không lưu file .blend. Rút kinh nghiệm chân núi: tấm nền không nằm chồng dưới sân/đồi (bỏ ô bị che trước khi nướng)."""
import bpy, bmesh, sys, os, json, math
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]
OUTD = A[0]; os.makedirs(OUTD, exist_ok=True)
SM = int(A[1]) if len(A) > 1 else 256; SN = int(A[2]) if len(A) > 2 else 2048; SV = int(A[3]) if len(A) > 3 else 4096
sc = bpy.data.scenes['More']
for s in [x for x in bpy.data.scenes if x != sc]: bpy.data.scenes.remove(s)
TX, TY, R = 2.0, 10.0, 75.0   # vùng giữ lại quanh sảnh; ngoài vùng là sương màu cỏ trên web

def lin(h):
    return tuple(((int(h[i:i + 2], 16) / 255 + .055) / 1.055) ** 2.4 if int(h[i:i + 2], 16) > 10 else int(h[i:i + 2], 16) / 255 / 12.92 for i in (0, 2, 4))
# bảng màu đất nặn của chân núi + màu riêng của sảnh (mã sRGB; hai mã = hai đầu dải màu)
BANG = {'gach': ('F0D8B0', 'D2A877'), 'co': ('9DB96B', 'AEC97B'), 'co2': ('8FAF5F', '9FBF6E'),
        'la0': ('7FA650', '95B964'), 'la1': ('8CB35A', 'A4C56F'), 'la2': ('6F9847', '84AB57'), 'laTre': ('9BBE62', 'B0CE75'), 'tre': ('A7C46C', 'BAD27F'),
        'bach': ('5F8A42', '78A052'), 'than': ('9A6B45',), 'thanCau': ('C9AE86',), 'da': ('CFC5B2', 'E1D8C6'), 'daTrang': ('ECE6DA',), 'daHang': ('E4DDCF',),
        'ngoi': ('C87458', 'D98A6B'), 'tuongTrang': ('F4E4BA',), 'tuong': ('F0CC80',), 'sonDo': ('B9483A',), 'cua': ('9F4B36',), 'cuaGoT': ('9F4B36',),
        'cotCo': ('DBA65F',), 'den': ('F5C87B',), 'denTrang': ('FFF1D2',), 'vangKim': ('E3B150',), 'dongK': ('C08B4E',), 'haoQuangL': ('F2C661',), 'haoC': ('F2C661',),
        'vaiPhuon': ('E89B3E',), 'sen': ('F2A8B5',), 'hong': ('F29BB0',), 'hongP': ('E2574C',), 'nuoc': ('80B7B1',), 'maiXam': ('9AA0A8',), 'maiXam2': ('8A9098',),
        'kinhMau': ('A9C3E6',), 'aoXanh': ('6D8FC0',), 'sat': ('5A524A',), 'bangGo': ('B98E5E',), 'goX': ('9A6B45',), 'latSanh': ('EEEAE2', 'DCD6CB')}
TRON = {'la0', 'la1', 'la2', 'laTre'}
CAY = ('cay', 'tanS', 'thanB', 'tanBd', 'bach', 'cau', 'bd', 'bdS')   # tên vật là cây (bụi, lá sen không phải cây)
def la_cay(o): return o.name.split('.')[0] in CAY
def la_tuong(o): return o.name.startswith('SS_')   # tượng Phật, tượng Chúa: giữ ảnh màu gốc, trình duyệt tự chiếu sáng
NK = open(os.path.join(OUTD, 'nhat-ky.txt'), 'w', encoding='utf-8')
def log(*a): print(*a, flush=True); NK.write(' '.join(map(str, a)) + '\n'); NK.flush()
def vat(o): return o.material_slots[0].name.split('.')[0] if o.material_slots else ''
def tam(o): return sum((o.matrix_world @ Vector(b) for b in o.bound_box), Vector()) / 8

def chinh():
    # ---- camera ảnh iso (web dùng để đổi toạ độ ảnh <-> 3D) và dọn vùng xa
    cam = bpy.data.objects['camIso']; fw = (cam.matrix_world.to_3x3() @ Vector((0, 0, -1))).normalized(); t = -cam.location.z / fw.z
    tg = cam.location + fw * t
    tt = {'cam': {'ortho': cam.data.ortho_scale, 'res': [sc.render.resolution_x, sc.render.resolution_y], 'tgt': list(tg), 'dist': t,
                  'el': math.degrees(math.asin(-fw.z)), 'az': math.degrees(math.atan2(-fw.x, fw.y))}}
    for o in list(sc.objects):
        if o.type == 'CAMERA': bpy.data.objects.remove(o)
        elif o.type == 'MESH':
            c = tam(o)
            if abs(c.x - TX) > R + 10 or abs(c.y - TY) > R + 10: bpy.data.objects.remove(o)
    dat = [o for o in sc.objects if o.type == 'MESH' and vat(o) == 'co' and max(o.dimensions) > 100]
    for o in dat: bpy.data.objects.remove(o)

    # lá sen cùng độ cao chồng lên nhau: chỗ chồng nướng ra đen, nâng mỗi lá cao hơn lá trước vài mm
    for i, o in enumerate(sorted([o for o in sc.objects if o.name.split('.')[0] in ('laSen', 'laSenP')], key=lambda o: o.name)):
        o.location.z += .004 * (i + 1)
    # ---- kiểu đất nặn: tượng giảm mặt, cạnh bo tròn, tán lá chia mịn, vật liệu mờ như đất sét
    for o in sc.objects:
        if o.type != 'MESH': continue
        if la_tuong(o):
            d = o.modifiers.new('giam', 'DECIMATE'); d.ratio = min(1, 25000 / max(1, len(o.data.polygons)))
            for p in o.data.polygons: p.use_smooth = True
            continue
        if max(o.dimensions) > 60: continue
        if vat(o) in TRON and len(o.data.polygons) < 3000: pass   # tán lá cầu đã tròn; pháp tuyến mịn là đủ (chia mịn làm tệp cây quá nặng)
        else:
            dm = [d for d in o.dimensions if d > 1e-4]
            if dm:
                b = o.modifiers.new('bo', 'BEVEL'); b.width = min(.09, .18 * min(dm)); b.segments = 2
                b.limit_method = 'ANGLE'; b.angle_limit = math.radians(35)
        for p in o.data.polygons: p.use_smooth = True
        o.modifiers.new('mat', 'WEIGHTED_NORMAL').keep_sharp = False
    for m in bpy.data.materials:
        if not m.node_tree: continue
        mau = BANG.get(m.name.split('.')[0])
        for n in m.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                n.inputs['Roughness'].default_value = .8; n.inputs['Metallic'].default_value = min(.25, n.inputs['Metallic'].default_value)
                n.inputs['Sheen Weight'].default_value = .25; n.inputs['Subsurface Weight'].default_value = .06; n.inputs['Specular IOR Level'].default_value = .3
                if mau and not n.inputs['Base Color'].is_linked: n.inputs['Base Color'].default_value = (*lin(mau[0]), 1)
            if n.type == 'VALTORGB' and mau:
                es = n.color_ramp.elements
                for i, e in enumerate(es): e.color = (*lin(mau[min(len(mau) - 1, round(i * (len(mau) - 1) / max(1, len(es) - 1)))]), 1)
    # sân lát gạch vuông như chân núi: bên Phật kem ấm, bên Công giáo trắng xám
    for ten, c1, c2, cm in [('gach', 'F0D8B0', 'DDBB8C', 'F7EAD2'), ('latSanh', 'EEEAE2', 'DCD6CB', 'F8F6F0')]:
        for m in [m for m in bpy.data.materials if m.name.split('.')[0] == ten and m.node_tree]:
            nt = m.node_tree; bs = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
            g = nt.nodes.new('ShaderNodeNewGeometry'); br = nt.nodes.new('ShaderNodeTexBrick')
            br.offset = 0; br.inputs['Scale'].default_value = 1; br.inputs['Brick Width'].default_value = .8; br.inputs['Row Height'].default_value = .8
            br.inputs['Mortar Size'].default_value = .035; br.inputs['Mortar Smooth'].default_value = .6
            br.inputs['Color1'].default_value = (*lin(c1), 1); br.inputs['Color2'].default_value = (*lin(c2), 1); br.inputs['Mortar'].default_value = (*lin(cm), 1)
            for l in list(bs.inputs['Base Color'].links): nt.links.remove(l)
            nt.links.new(g.outputs['Position'], br.inputs['Vector']); nt.links.new(br.outputs['Color'], bs.inputs['Base Color'])

    # ---- nắng ấm mềm, trời kem, AgX như chân núi
    sun = next(o for o in sc.objects if o.type == 'LIGHT'); sun.data.angle = math.radians(14); sun.data.energy = 3.2; sun.data.color = (1, .9, .77)
    nt = sc.world.node_tree; bg = next(n for n in nt.nodes if n.type == 'BACKGROUND')
    for l in list(bg.inputs['Color'].links): nt.links.remove(l)
    bg.inputs['Color'].default_value = (1, .9, .76, 1); bg.inputs['Strength'].default_value = 1.15
    sc.render.engine = 'CYCLES'
    try:
        pr = bpy.context.preferences.addons['cycles'].preferences; pr.compute_device_type = 'OPTIX'; pr.get_devices()
        for d in pr.devices: d.use = d.type != 'CPU'
        sc.cycles.device = 'GPU'
    except Exception as e: print('gpu', e)
    sc.cycles.samples = SM; sc.cycles.use_denoising = True
    sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium Low Contrast'; sc.view_settings.exposure = .35
    sc.render.bake.margin = 16; sc.render.bake.use_pass_direct = sc.render.bake.use_pass_indirect = True

    def ap_dung(o):
        if o.data.users > 1: o.data = o.data.copy()
        bpy.context.view_layer.objects.active = o
        for md in list(o.modifiers):
            try: bpy.ops.object.modifier_apply(modifier=md.name)
            except Exception: o.modifiers.remove(md)
        bm = bmesh.new(); bm.from_mesh(o.data); mw = o.matrix_world; n3 = mw.to_3x3()   # bỏ mặt đáy sát đất, không bao giờ nhìn thấy
        xoa = [f for f in bm.faces if (n3 @ f.normal).normalized().z < -0.95 and (mw @ f.calc_center_median()).z < 0.5]
        if xoa: bmesh.ops.delete(bm, geom=xoa, context='FACES'); bm.to_mesh(o.data)
        bm.free()

    # ---- cây: màu đỉnh đất sét (chân tối, ngọn sáng) + pháp tuyến, xuất riêng; giữ lại trong cảnh để đổ bóng khi nướng
    cay = [o for o in sc.objects if o.type == 'MESH' and la_cay(o)]
    for o in sc.objects: o.select_set(False)
    for o in cay: ap_dung(o)
    for o in cay:
        c = [lin(h) for h in BANG.get(vat(o), ('7FA650',))]; a, b = c[0], c[-1]
        mw = o.matrix_world; zs = [(mw @ v.co).z for v in o.data.vertices]; z0, z1 = min(zs), max(zs)
        ca = o.data.color_attributes.new('Col', 'BYTE_COLOR', 'POINT')
        for v, z in zip(o.data.vertices, zs):
            t = (z - z0) / max(1e-4, z1 - z0); t = t * t * (3 - 2 * t); ca.data[v.index].color = (*(a[k] + (b[k] - a[k]) * t for k in range(3)), 1)
        for x in list(o.data.color_attributes):
            if x.name != 'Col': o.data.color_attributes.remove(x)
        o.data.color_attributes.active_color = o.data.color_attributes['Col']; o.data.materials.clear()
    mc = bpy.data.materials.new('cay-thuc'); mc.use_nodes = True
    vc = mc.node_tree.nodes.new('ShaderNodeVertexColor'); vc.layer_name = 'Col'
    mc.node_tree.links.new(vc.outputs['Color'], mc.node_tree.nodes['Principled BSDF'].inputs['Base Color'])
    for o in cay: o.data.materials.append(mc)
    bpy.context.view_layer.objects.active = cay[0]
    for o in cay: o.select_set(True)
    bpy.ops.object.join(); gc = bpy.context.view_layer.objects.active; gc.name = 'cay'
    for x in sc.objects: x.select_set(x is gc)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, 'cay.glb'), use_selection=True, export_format='GLB', export_apply=True,
        export_normals=True, export_vertex_color='ACTIVE', export_animations=False, export_materials='EXPORT', export_meshopt_compression_enable=True)
    log('CAY', len(cay), len(gc.data.polygons))

    # ---- tượng: giảm mặt, ảnh màu gốc thu về 1024, xuất riêng; cũng giữ lại trong cảnh để đổ bóng khi nướng
    tuong = [o for o in sc.objects if o.type == 'MESH' and la_tuong(o)]
    for o in tuong:
        ap_dung(o)
        if len(o.data.polygons) > 30000:   # mô hình nhiều mảnh rời: lượt giảm đầu dừng sớm, giảm thêm một lượt
            d = o.modifiers.new('giam2', 'DECIMATE'); d.ratio = 30000 / len(o.data.polygons); ap_dung(o)
    for im in {n.image for o in tuong for s in o.material_slots if s.material and s.material.node_tree for n in s.material.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image}:
        if max(im.size) > 1024: im.scale(1024, 1024)
    for x in sc.objects: x.select_set(x in tuong)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, 'tuong.glb'), use_selection=True, export_format='GLB', export_apply=True,
        export_normals=True, export_image_format='WEBP', export_image_quality=85, export_animations=False, export_materials='EXPORT', export_meshopt_compression_enable=True)
    log('TUONG', [(o.name, len(o.data.polygons)) for o in tuong])

    # ---- áp bo/chia mịn cho mọi vật còn lại trước khi dò chỗ che
    con = [o for o in sc.objects if o.type == 'MESH' and o is not gc and o not in tuong]
    for o in con: ap_dung(o)
    dg = bpy.context.evaluated_depsgraph_get()
    def phu(x, y):   # mặt đất ở (x,y) đã có sân, đồi, nền đá... che (cao hơn 0 không quá 1,5 m, mặt ngửa lên)? Bỏ qua cây và vật cao.
        z = 60.0
        for _ in range(8):
            ok, loc, nor, i, ob, mx = sc.ray_cast(dg, Vector((x, y, z)), Vector((0, 0, -1)))
            if not ok: return False
            if vat(ob) in ('co', 'co2') or ob.name.startswith('nui'): return True   # đồi cỏ: che dù cao bao nhiêu
            if ob is gc or ob in tuong or loc.z > 1.5: z = loc.z - 1e-3; continue
            return nor.z > .3 and loc.z > -0.1
        return False

    # ---- tấm nền: lưới 64x64, UV chiếu từ trên; bỏ ô nằm trọn dưới sân/đồi (tránh hai lớp chồng nhau nhấp nháy)
    bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=64, y_segments=64, size=R); bmesh.ops.translate(bm, vec=(TX, TY, 0), verts=bm.verts)
    xoa = []
    for f in bm.faces:
        c = f.calc_center_median(); mau = [c] + [v.co.lerp(c, .2) for v in f.verts]
        if all(phu(p.x, p.y) for p in mau): xoa.append(f)
    bmesh.ops.delete(bm, geom=xoa, context='FACES')
    nen = bpy.data.objects.new('nen', bpy.data.meshes.new('nen')); bm.to_mesh(nen.data); bm.free()
    sc.collection.objects.link(nen); mco = bpy.data.materials.get('co') or bpy.data.materials.new('co'); nen.data.materials.append(mco)
    uv = nen.data.uv_layers.new(name='lm')
    for l in nen.data.loops:
        v = nen.data.vertices[l.vertex_index].co; uv.data[l.index].uv = ((v.x - TX + R) / (2 * R), (v.y - TY + R) / (2 * R))
    log('NEN bo', len(xoa), 'con', len(nen.data.polygons))

    # ---- nhóm vật: sân + nhà (vat-0), cảnh xa (vat-1), đồ nhỏ + tượng (vat-3, người xem phóng sát nên cần nhiều điểm ảnh)
    def gop(objs, ten):
        for o in sc.objects: o.select_set(False)
        bpy.context.view_layer.objects.active = objs[0]
        for o in objs: o.select_set(True)
        bpy.ops.object.join(); g = bpy.context.view_layer.objects.active; g.name = ten
        for l in list(g.data.uv_layers): g.data.uv_layers.remove(l)
        g.data.uv_layers.new(name='lm'); bpy.ops.object.select_all(action='DESELECT'); g.select_set(True)
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
        bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.0, area_weight=1.0, scale_to_bounds=False)
        bpy.ops.uv.pack_islands(rotate=True, margin=0.0015, shape_method='CONCAVE')
        bpy.ops.object.mode_set(mode='OBJECT'); return g
    san = [o for o in con if -34 < tam(o).x < 36 and -24 < tam(o).y < 52 and max(o.dimensions) < 60]
    gan = [o for o in san if max(o.dimensions) < 3.2 or o.name.startswith(('Torus', 'hao'))]
    san = [o for o in san if o not in gan]; xa = [o for o in con if o not in san and o not in gan]
    log('NHOM', len(san), len(xa), len(gan))
    khoi = [(gop(san, 'vat-0'), SV), (gop(xa, 'vat-1'), min(SV, 2048)), (gop(gan, 'vat-3'), SV)]

    def nuong(o, ten, size):
        img = bpy.data.images.new(ten, size, size, alpha=False, float_buffer=True)
        for s in o.material_slots:
            nt = s.material.node_tree
            n = nt.nodes.new('ShaderNodeTexImage'); n.name = '_dich'; n.image = img; nt.nodes.active = n
            uvn = nt.nodes.new('ShaderNodeUVMap'); uvn.uv_map = 'lm'; nt.links.new(uvn.outputs[0], n.inputs[0])
        for x in sc.objects: x.select_set(False)
        o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.bake(type='COMBINED', pass_filter={'DIRECT', 'INDIRECT', 'DIFFUSE', 'EMIT'}, use_clear=True, margin=16)
        img.save_render(os.path.join(OUTD, ten + '.png'), scene=sc)   # qua AgX như ảnh render
        log('NUONG', ten)
    for x in [nen] + [k for k, _ in khoi]:
        for s in x.material_slots: s.material = s.material.copy()
    nuong(nen, 'nen', SN)
    for k, sz in khoi: nuong(k, k.name, sz)
    for x in [nen] + [k for k, _ in khoi]:
        m = bpy.data.materials.new('nuong-' + x.name); m.use_nodes = True; nt = m.node_tree
        t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(os.path.join(OUTD, x.name + '.png')); nt.links.new(t.outputs[0], nt.nodes['Principled BSDF'].inputs['Base Color'])
        x.data.materials.clear(); x.data.materials.append(m)
    for x in sc.objects: x.select_set(x in [nen] + [k for k, _ in khoi])
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTD, 'canh.glb'), use_selection=True, export_format='GLB', export_apply=True,
        export_normals=False, export_image_format='NONE', export_animations=False, export_materials='EXPORT', export_meshopt_compression_enable=True)
    d = sun.matrix_world.to_quaternion() @ Vector((0, 0, 1))
    tt.update({'tam': [TX, TY], 'R': R, 'nang_huong': list(d), 'tam_giac': sum(len(x.data.polygons) for x in [nen] + [k for k, _ in khoi])})
    json.dump(tt, open(os.path.join(OUTD, 'thong-tin.json'), 'w'), indent=1)
    log('XONG')

with bpy.context.temp_override(scene=sc, view_layer=sc.view_layers[0]):
    chinh()
