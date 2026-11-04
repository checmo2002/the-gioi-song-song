"""Dựng bộ nhân vật riêng của Song Song từ file Meshy (xương + động tác) thành nhan-vat.blend.
Chạy ngầm: blender -b --factory-startup --python tools/dung-nhan-vat.py -- <thư mục nhan-vat>
Mỗi nhân vật: Rig<Ten> (xương), <Ten> (lưới), động tác Idle_/Walk_/Bow_ (Meshy) và Pray_/Kneel_ (tự dựng ở đây).
Nguồn: chỉ file trong E:\\5.2\\TheGioiSongSong, không lấy gì từ dự án Bản Đồ Liệt Sĩ."""
import bpy, os, sys, math
from mathutils import Vector, Matrix

D = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else r'E:\5.2\TheGioiSongSong\nhan-vat'
TEN = {'ong-ao-nau': 'OngAoNau', 'ba-cu': 'BaCu', 'chi-ba-ba': 'ChiBaBa', 'phu-nu-tim': 'PhuNuTim', 'co-ao-dai': 'CoAoDai',
       'cuu-chien-binh': 'CuuChienBinh', 'thanh-nien': 'ThanhNien', 'hoc-sinh': 'HocSinh', 'su-thay': 'SuThay', 'nu-tu': 'NuTu'}
MESHY = {'Idle': 'Idle', 'Casual_Walk': 'Walk', 'Formal_Bow': 'Bow'}
UP = Vector((0, 0, 1))

bpy.ops.wm.read_factory_settings(use_empty=True)
S = bpy.context.scene


def gan(ad, act):
    ad.action = act
    if hasattr(ad, 'action_slot') and len(getattr(act, 'slots', [])): ad.action_slot = act.slots[0]


def nhap(k, N):
    f = os.path.join(D, k + '-dong-tac.glb')
    if not os.path.exists(f): return None
    o0, a0 = set(bpy.data.objects), set(bpy.data.actions)
    bpy.ops.import_scene.gltf(filepath=f)
    moi = [o for o in bpy.data.objects if o not in o0]
    arm = [o for o in moi if o.type == 'ARMATURE'][0]
    lu = [o for o in moi if o.type == 'MESH' and o.parent == arm]   # file Meshy có kèm khối cầu phụ không gắn xương: bỏ
    for o in moi:
        if o is not arm and o not in lu: bpy.data.objects.remove(o)
    if len(lu) > 1:   # gộp về một lưới cho dễ dùng
        with bpy.context.temp_override(active_object=lu[0], selected_editable_objects=lu, object=lu[0]):
            bpy.ops.object.join()
    arm.name, lu[0].name = 'Rig' + N, N
    for a in [a for a in bpy.data.actions if a not in a0]:
        ten = next((v for kk, v in MESHY.items() if kk.lower() in a.name.lower()), None)
        if ten: a.name = ten + '_' + N; a.use_fake_user = True
        else: bpy.data.actions.remove(a)
    # kiểu đứng yên trang nghiêm (thư viện Meshy số 249, chân khép, tay buông) thay cho Idle mặc định dạng chân
    f = os.path.join(D, k + '-dung.glb')
    if os.path.exists(f):
        o1, a1 = set(bpy.data.objects), set(bpy.data.actions)
        bpy.ops.import_scene.gltf(filepath=f)
        for o in [o for o in bpy.data.objects if o not in o1]: bpy.data.objects.remove(o)
        moi = [a for a in bpy.data.actions if a not in a1]
        if moi:
            bpy.data.actions.remove(bpy.data.actions['Idle_' + N]); moi[0].name = 'Idle_' + N; moi[0].use_fake_user = True
        for a in moi[1:]: bpy.data.actions.remove(a)
    return arm


def tu_the(arm, N, ten, quy):
    """Dựng tư thế tĩnh (1 khung) từ khung 0 của Idle: chắp tay trước ngực; quỳ thì thêm hạ hông, gập chân."""
    ad = arm.animation_data
    gan(ad, bpy.data.actions['Idle_' + N]); S.frame_set(0); bpy.context.view_layer.update()
    P, mw = arm.pose.bones, arm.matrix_world
    for pb in P: pb.rotation_mode = 'QUATERNION'
    goc = {pb.name: (pb.location.copy(), pb.rotation_quaternion.copy(), pb.scale.copy()) for pb in P}
    act = bpy.data.actions.new(ten + '_' + N); act.use_fake_user = True; gan(ad, act)
    for pb in P: pb.location, pb.rotation_quaternion, pb.scale = goc[pb.name]
    bpy.context.view_layer.update()
    w = lambda b: mw @ P[b].head

    def huong(b, d):   # xoay xương b (trong thế giới) cho trục Y của nó chỉ theo hướng d, giữ gốc xương
        pb = P[b]; Mw = mw @ pb.matrix; R = Mw.to_3x3()
        q = (R @ Vector((0, 1, 0))).normalized().rotation_difference(d.normalized())
        pb.matrix = mw.inverted() @ (Matrix.Translation(Mw.translation) @ (q.to_matrix() @ R).to_4x4())
        bpy.context.view_layer.update()

    truoc = w('headfront') - w('Head'); truoc.z = 0; truoc.normalize()
    if quy:
        dui = (w('LeftLeg') - w('LeftUpLeg')).length
        ha = w('Hips').z - (dui + .07)   # quỳ thẳng lưng: hông cao bằng đùi + gối chạm đất
        M = P['Hips'].matrix.copy(); M.translation += mw.inverted().to_3x3() @ Vector((0, 0, -ha)); P['Hips'].matrix = M
        bpy.context.view_layer.update()
        for s in ('Left', 'Right'):
            huong(s + 'UpLeg', -UP + truoc * .08)
            huong(s + 'Leg', -truoc - UP * .12)
            huong(s + 'Foot', -truoc - UP * .35)
    # chắp tay: hai bàn tay gặp nhau trước ngực, đầu ngón hướng lên
    vai = (w('LeftArm') + w('RightArm')) / 2
    T0 = vai + truoc * .2 - UP * .17
    for s in ('Left', 'Right'):
        Sv = w(s + 'Arm'); ra = Sv - vai; ra -= ra.dot(truoc) * truoc; ra.z = 0; ra.normalize()
        a = (w(s + 'ForeArm') - Sv).length; b = (w(s + 'Hand') - w(s + 'ForeArm')).length
        T = T0 + ra * .018; d = T - Sv; L = min(d.length, (a + b) * .98); u = d.normalized()
        x = (a * a - b * b + L * L) / (2 * L); h = math.sqrt(max(a * a - x * x, 0))
        cuc = -UP + ra * .35 - truoc * .1; cuc -= cuc.dot(u) * u; cuc.normalize()   # khuỷu tay chúc xuống, hơi bè ra
        E = Sv + u * x + cuc * h
        huong(s + 'Arm', E - Sv)
        huong(s + 'ForeArm', T - w(s + 'ForeArm'))
        huong(s + 'Hand', UP + truoc * .25 - ra * .1)
    for pb in P:
        pb.keyframe_insert('rotation_quaternion', frame=0)
        pb.keyframe_insert('location', frame=0)
    gan(ad, bpy.data.actions['Idle_' + N])


x = 0
for k, N in TEN.items():
    arm = nhap(k, N)
    if not arm: print('THIEU', k); continue
    arm.location.x = x; x += 1.2
    tu_the(arm, N, 'Pray', False)
    tu_the(arm, N, 'Kneel', True)
    print('XONG', N, [a.name for a in bpy.data.actions if a.name.endswith('_' + N)])
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(D, 'nhan-vat.blend'))
print('DA LUU', os.path.join(D, 'nhan-vat.blend'))
