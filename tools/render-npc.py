"""Render hình NPC (img/nv/npc/) từ nhan-vat.blend của Song Song (dựng bằng tools/dung-nhan-vat.py).
Chạy ngầm: blender -b <thư mục>/nhan-vat.blend --python tools/render-npc.py -- <thư mục ra> [Ten …]
Mỗi nhân vật 5 tư thế × 8 hướng, ô 128×192 (render 256×384 rồi thu nhỏ), khớp với img/nv/nam-*.webp.
Ra PNG ở OUT; đổi sang WebP: Pillow, quality 82. Không lưu đè file .blend (camera/đèn tạm, nên đóng không lưu)."""
import bpy, math, os
import numpy as np
import sys
A = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = A[0] if A else r'E:\5.2\TheGioiSongSong\nhan-vat\sprite'
CH = A[1:] or ['OngAoNau','BaCu','ChiBaBa','PhuNuTim','CoAoDai','CuuChienBinh','ThanhNien','HocSinh','SuThay','NuTu']
POSE = {'dung':('Idle',[0]), 'di':('Walk',8), 'chap':('Pray',[0]), 'lay':('Bow',6), 'ngoi':('Kneel',[0])}   # số = rải đều theo độ dài động tác   # hàng = hướng d (0 nhìn xuống màn hình, 2 sang phải…)
S = bpy.context.scene
os.makedirs(OUT, exist_ok=True)
cam = bpy.data.objects.new('NPC_Cam', bpy.data.cameras.new('NPC_Cam')); S.collection.objects.link(cam)
cam.data.type = 'ORTHO'; cam.data.ortho_scale = 1.6; cam.data.shift_y = 0.055; S.camera = cam
sun = bpy.data.objects.new('NPC_Sun', bpy.data.lights.new('NPC_Sun','SUN')); sun.data.energy = 3.5; S.collection.objects.link(sun)
w = bpy.data.worlds.new('NPC_World'); w.use_nodes = True; S.world = w
bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (0.85,0.8,0.72,1); bg.inputs[1].default_value = 0.9
r = S.render; r.engine = 'BLENDER_EEVEE'; r.resolution_x, r.resolution_y, r.resolution_percentage = 256, 384, 100
r.film_transparent = True; r.image_settings.file_format = 'PNG'; r.image_settings.color_mode = 'RGBA'
EL, DST = math.radians(45), 20
def place(d):   # động tác ghi đè hướng xoay của xương nên xoay camera + đèn thay cho người
    th = -math.radians(45*d); y = -DST*math.cos(EL)
    cam.location = (-y*math.sin(th), y*math.cos(th), 0.8 + DST*math.sin(EL))
    cam.rotation_euler = (math.radians(90)-EL, 0, th)
    sun.rotation_euler = (math.radians(40), 0, math.radians(-30)+th)
def sheet(n, key):
    act, frames = POSE[key]
    if isinstance(frames, int):
        a0, a1 = bpy.data.actions[act+'_'+n].frame_range; st = (a1-a0)/frames
        frames = [round(a0 + i*st) for i in range(frames)]
    for o in S.objects:
        if o.type in ('MESH','ARMATURE'): o.hide_render = o.name not in (n, 'Rig'+n)
    rig = bpy.data.objects['Rig'+n]; ad = rig.animation_data
    ad.action = bpy.data.actions[act+'_'+n]
    if hasattr(ad,'action_slot') and len(ad.action.slots): ad.action_slot = ad.action.slots[0]
    rig.location = (0, 0, 0)
    W, H = 128, 192; big = np.zeros((H*8, W*len(frames), 4), np.float32); tmp = os.path.join(OUT, '_tmp.png')
    for d in range(8):
        place(d)
        for i, f in enumerate(frames):
            S.frame_set(f); r.filepath = tmp; bpy.ops.render.render(write_still=True)
            im = bpy.data.images.load(tmp, check_existing=False)
            px = np.array(im.pixels[:], np.float32).reshape(384,256,4)[::-1]; bpy.data.images.remove(im)
            px[...,:3] *= px[...,3:4]; sm = px.reshape(192,2,128,2,4).mean((1,3))   # thu nhỏ trên màu nhân alpha để khỏi viền
            a = sm[...,3:4]; sm[...,:3] = np.where(a > 0, sm[...,:3]/np.maximum(a,1e-6), 0)
            big[d*H:(d+1)*H, i*W:(i+1)*W] = sm
    img = bpy.data.images.new('npc_sheet', big.shape[1], big.shape[0], alpha=True)
    img.pixels[:] = big[::-1].ravel(); img.filepath_raw = os.path.join(OUT, f'{n}-{key}.png'); img.file_format = 'PNG'
    img.save(); bpy.data.images.remove(img)
for n in CH:
    for k in POSE: sheet(n, k)
