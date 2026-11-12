"""Ô lưới đi (144x96 theo ảnh iso) bị cột/xà che, bỏ cột rồi thì thấy mặt sàn: in ra để mở trong js/04-00-du-lieu-canh.js.
blender -b <cảnh .blend như lúc nướng> --python mo-luoi-cot.py -- <ra.json>
Ra: {"o": [[i, j, tên vật thấy sau khi bỏ, pháp tuyến z]]}. Ô nào thấy sàn phẳng (z > .7) thì mở (tools/mo-luoi-cot.py làm việc này)."""
import bpy, sys, json
from mathutils import Vector
RA = sys.argv[sys.argv.index('--') + 1]
BO_COT = {'cot', 'chanCot', 'cotHien', 'chanCotH', 'xa', 'xaD'}   # giống nuong-canh-3d.py; thêm tham số thứ hai 'a,b' để bỏ vật khác
if len(sys.argv) > sys.argv.index('--') + 2: BO_COT = set(sys.argv[sys.argv.index('--') + 2].split(','))
QUA = {'xaLau', 'tanBd', 'tre', 'cay', 'may', 'cau', 'bach', 'thanB', 'tanS'}   # tán cây, xà lầu: người đi bên dưới (mái SS_Mai web làm mờ)
sc = max(bpy.data.scenes, key=lambda s: len(s.objects))
for x in [x for x in bpy.data.scenes if x != sc]: bpy.data.scenes.remove(x)   # còn một cảnh để depsgraph của context là cảnh này
VL = sc.view_layers[0]; VL.update(); CAM = next(o for o in sc.objects if o.type == 'CAMERA')
fw = (CAM.rotation_euler.to_matrix() @ Vector((0, 0, -1))).normalized(); OW = CAM.data.ortho_scale; OH = OW * sc.render.resolution_y / sc.render.resolution_x
tg = CAM.location + fw * (-CAM.location.z / fw.z); RI = fw.cross(Vector((0, 0, 1))).normalized(); UP = RI.cross(fw).normalized(); C0 = tg - fw * 160
def ban():
    VL.update(); dg = VL.depsgraph; r = {}
    for j in range(96):
        for i in range(144):
            o0 = C0 + RI * (((i + .5) / 144 - .5) * OW) + UP * ((.5 - (j + .5) / 96) * OH)
            for _ in range(8):
                ok, loc, nor, fi, ob, mx = sc.ray_cast(dg, o0, fw)
                if not ok: break
                b = ob.name.split('.')[0]
                if b in QUA or b.startswith('SS_Mai'): o0 = loc + fw * 1e-3; continue
                r[i, j] = (b, round(nor.z, 2)); break
    return r
truoc = ban()
for o in [o for o in sc.objects if o.type == 'MESH' and o.name.split('.')[0] in BO_COT]: bpy.data.objects.remove(o)
sau = ban()
o = [[i, j, sau[i, j][0], sau[i, j][1]] for (i, j), (b, z) in truoc.items() if b in BO_COT and (i, j) in sau]
json.dump({'o': o}, open(RA, 'w')); print('MO', len(o))
