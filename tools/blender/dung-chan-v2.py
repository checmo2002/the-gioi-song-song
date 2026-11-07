# Dựng lại cảnh chân núi (giống hệt bản cũ) nhưng thay cầu thang lên chùa, lưu ra .blend cho nuong-canh-3d.py.
# Không sửa file gốc: đọc render-nen-72.py + canh-dat-set.py, thay đoạn bậc thang trong bộ nhớ.
#   blender -b --python dung-chan-v2.py -- <ra.blend> [anh-xem-truoc.png]
import bpy, sys, os, math
from mathutils import Vector
GOC = r'E:\5.2\TheGioiSongSong\nhan-vat'
_A = sys.argv[sys.argv.index('--') + 1:]; RA_BLEND = _A[0]; ANH = _A[1] if len(_A) > 1 else None
THANG = r'''
# --- bậc thang đá lên núi (bản 2): bậc rộng có mũi bậc sáng, tường má lan can xây liền có mái ngói dốc theo bậc,
#     trụ lan can búp vàng, đèn đá hai bên, cổng nhỏ ở chân dốc và hai trụ ở đầu dốc
daT=M('daTrang',C('ECE6DA'));cotT=M('cotTrang',C('F2EBDD'))
BW,WX=5.0,2.85
ys=[];y=13.0
while y<40.5:ys.append(y);y+=.75
zp=H(0,ys[0]-.75)+.55
for i,y in enumerate(ys):
    z=H(0,y);box(col,'bac',(0,y,z/2),(BW,.9,max(.2,z)),stone);box(col,'matBac',(0,y-.05,z+.04),(BW,.86,.08),daT)
    zt=z+.6
    for sx in (-1,1):
        box(col,'maTuong',(sx*WX,y,zt/2),(.5,.78,zt),wallW)
        dz=zt-zp;L=math.hypot(.75,dz);o=box(col,'maMai',(sx*WX,y-.375,(zt+zp)/2+.12),(.72,L+.06,.16),ngoi);o.rotation_euler[0]=math.atan2(dz,.75)
        if i%6==0 or i==len(ys)-1:
            box(col,'truLan',(sx*WX,y,(z+1.35)/2),(.72,.72,z+1.35),cotT);cyl(col,'chopTru',(sx*WX,y,z+1.35),.5,.28,ngoi,4,.08).rotation_euler[2]=math.pi/4
            sph(col,'bupTru',(sx*WX,y,z+1.75),.16,gold,1)
    zp=zt
    if i%9==4:
        for sx in (-1,1):
            x=sx*4.1;z0=H(x,y)
            cyl(col,'dd1',(x,y,z0),.45,.3,stone,8);cyl(col,'dd2',(x,y,z0+.3),.18,1.1,stone,8);box(col,'dd3',(x,y,z0+1.6),(.7,.7,.55),lamp);hip_roof(col,'dd4',(x,y,z0+1.88),.7,.7,.35,.12,stone,ridge=.0)
# cổng nhỏ chân dốc
for sx in (-1,1):box(col,'tqThang',(sx*3.6,11.7,2.3),(.85,.85,4.6),wallW);box(col,'tqThangD',(sx*3.6,11.7,.2),(1.2,1.2,.4),stone)
box(col,'tqThangDam',(0,11.7,4.45),(8.2,.95,.45),wallW);hip_roof(col,'tqThangMai',(0,11.7,4.65),8.8,1.7,1.0,.6,ngoi,ridge=.8);box(col,'tqThangT2',(0,11.7,5.55),(3.6,.8,.7),wallW);hip_roof(col,'tqThangMai2',(0,11.7,5.85),5.4,1.3,.9,.45,ngoi,ridge=.7);sph(col,'tqThangNgoc',(0,11.7,6.85),.22,gold,1)
box(col,'tqThangBien',(0,11.2,3.75),(2.6,.1,.6),son);box(col,'tqThangBienV',(0,11.15,3.75),(2.8,.06,.74),gold)
# hai trụ đầu dốc
for sx in (-1,1):
    z=H(0,40.5);box(col,'truDinh',(sx*3.4,40.9,z+1.1),(.8,.8,2.2),cotT);cyl(col,'chopTru',(sx*3.4,40.9,z+2.2),.55,.3,ngoi,4,.08).rotation_euler[2]=math.pi/4;sph(col,'bupTru',(sx*3.4,40.9,z+2.65),.2,gold,1)
'''
src = open(os.path.join(GOC, 'render-nen-72.py'), encoding='utf-8').read().split('# 8 hướng quanh tâm')[0]
a = src.index('# --- bậc thang đá lên núi'); b = src.index("box(col,'sanCD'")
_SRC = src[:a] + THANG + src[b:]
DS_FILE = os.path.join(GOC, 'canh-dat-set.py'); DS_RA = os.path.join(os.path.dirname(RA_BLEND), '_tam'); DS_NHE = True
cds = open(DS_FILE, encoding='utf-8').read()
cu = "_src = open(os.path.join(_DIR, 'render-nen-72.py'), encoding='utf-8').read().split('# 8 hướng quanh tâm')[0]"
assert cu in cds; cds = cds.replace(cu, '_src = _SRC')
exec(compile(cds, 'canh-dat-set', 'exec'))

# nuong-canh-3d.py tự bo cạnh: bỏ modifier bo/chia mịn của canh-dat-set để khỏi bo hai lần (giữ mái dày, núi gồ ghề của cảnh gốc)
for o in sc.objects:
    if o.type == 'MESH':
        for md in [m for m in o.modifiers if m.name in ('tron', 'bo', 'mat')]: o.modifiers.remove(md)
# cây nhận theo tên vật trong nuong-canh-3d.py: đặt tên 'cay' cho mọi vật lá/thân như bản nướng cũ (nuong-cay.py chọn theo vật liệu)
LA = {'la0', 'la1', 'la2', 'laTre', 'than', 'tre'}; TEN = ('cay', 'tanS', 'thanB', 'tanBd', 'bach', 'cau', 'bd', 'bdS', 'tre')
n = 0
for o in sc.objects:
    if o.type == 'MESH' and o.material_slots and o.material_slots[0].name.split('.')[0] in LA and o.name.split('.')[0] not in TEN: o.name = 'cay'; n += 1
print('DOI TEN CAY', n)
# camera ảnh iso: nhìn chéo như web (nghiêng 42°, phương vị -38°), tâm (2,0), rộng 108 m -> vùng nướng R≈86 m như bản cũ
cam = next(o for o in sc.objects if o.type == 'CAMERA'); cam.data.ortho_scale = 108
el, az = math.radians(42), math.radians(-38)
fw = Vector((-math.sin(az) * math.cos(el), math.cos(az) * math.cos(el), -math.sin(el)))
assert abs(math.degrees(math.atan2(-fw.x, fw.y)) + 38) < .01
cam.location = Vector((2, 0, 0)) - fw * 150; cam.rotation_euler = (-fw).to_track_quat('Z', 'Y').to_euler(); sc.camera = cam
os.makedirs(os.path.dirname(RA_BLEND), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=RA_BLEND, copy=True); print('LUU', RA_BLEND)
if ANH:
    sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'MATERIAL'; sc.display.shading.show_shadows = True
    for m in bpy.data.materials:
        bc = m.node_tree and next((x for x in m.node_tree.nodes if x.type == 'BSDF_PRINCIPLED'), None)
        if bc: m.diffuse_color = tuple(bc.inputs['Base Color'].default_value)
    cd = bpy.data.cameras.new('xem'); cd.lens = 32; c = bpy.data.objects.new('xem', cd); sc.collection.objects.link(c)
    c.location = (16, -2, 16); c.rotation_euler = (math.radians(62), 0, math.radians(32)); sc.camera = c
    sc.render.resolution_x, sc.render.resolution_y = 1600, 1000; sc.render.filepath = ANH; bpy.ops.render.render(write_still=True); print('ANH', ANH)
