# Ảnh iso 2D (bản dự phòng cho máy không có GPU) dựng từ chính kết quả nướng, nên giống hệt cảnh 3D trên web.
#   blender -b --python anh-iso-tu-nuong.py -- <thư mục nướng> <ra.png> [rộng=3600]
# Màu nướng in thẳng ra (emission), cây theo màu đỉnh, tượng/mái giữ vật liệu gốc dưới nắng; camera lấy từ thong-tin.json.
import bpy, sys, os, json, math
from mathutils import Vector
A = sys.argv[sys.argv.index('--') + 1:]; VAO, RA = A[0], A[1]; W = int(A[2]) if len(A) > 2 else 3600
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
for f in ('canh.glb', 'cay.glb', 'tuong.glb'):
    if os.path.exists(os.path.join(VAO, f)): bpy.ops.import_scene.gltf(filepath=os.path.join(VAO, f))
def phat(m, nguon):   # vật liệu chỉ phát màu: ảnh nướng hoặc màu đỉnh
    nt = m.node_tree; nt.nodes.clear(); o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission'); nt.links.new(e.outputs[0], o.inputs[0])
    nt.links.new(nguon(nt).outputs[0], e.inputs[0])
for ob in sc.objects:
    if ob.type != 'MESH': continue
    for s in ob.material_slots:
        m = s.material
        if not m: continue
        m.use_nodes = True
        if m.name.startswith('nuong-'):
            img = bpy.data.images.load(os.path.join(VAO, m.name[6:] + '.png'), check_existing=True)
            def tex(nt, img=img):
                t = nt.nodes.new('ShaderNodeTexImage'); t.image = img; return t
            phat(m, tex)
        elif ob.data.color_attributes:
            def mau(nt): a = nt.nodes.new('ShaderNodeVertexColor'); return a
            phat(m, mau)
tt = json.load(open(os.path.join(VAO, 'thong-tin.json'))); c = tt['cam']
el, az = math.radians(c['el']), math.radians(c['az']); fw = Vector((-math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), -math.sin(el)))
cd = bpy.data.cameras.new('iso'); cd.type = 'ORTHO'; cd.ortho_scale = c['ortho']; cam = bpy.data.objects.new('iso', cd); sc.collection.objects.link(cam)
cam.location = Vector(c['tgt']) - fw * c['dist']; cam.rotation_euler = (-fw).to_track_quat('Z', 'Y').to_euler(); sc.camera = cam
sun = bpy.data.lights.new('nang', 'SUN'); sun.energy = 3.2; sun.color = (1, .9, .77); so = bpy.data.objects.new('nang', sun); sc.collection.objects.link(so)
so.rotation_euler = Vector(tt['nang_huong']).to_track_quat('Z', 'Y').to_euler()
w = bpy.data.worlds.new('W'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (1, .9, .76, 1); w.node_tree.nodes['Background'].inputs[1].default_value = 1.0
sc.render.engine = 'CYCLES'; sc.cycles.samples = 32; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y = W, W * c['res'][1] // c['res'][0]; sc.view_settings.view_transform = 'Standard'
sc.render.filepath = RA; bpy.ops.render.render(write_still=True); print('ANH', RA)
