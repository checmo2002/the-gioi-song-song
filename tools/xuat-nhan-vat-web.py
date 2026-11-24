"""Xuất bộ nhân vật Song Song cho web 3D thời gian thực: giảm lưới, ảnh vân nhỏ, đủ 5 động tác.
Chạy ngầm: blender -b nhan-vat.blend --python xuat-web.py -- <file .glb ra> [tỉ lệ giảm lưới, mặc định 0.33]
Không lưu file .blend."""
import bpy, sys
A = sys.argv[sys.argv.index('--') + 1:]
OUT = A[0]; TI_LE = float(A[1]) if len(A) > 1 else 0.33
CH = ['OngAoNau', 'BaCu', 'ChiBaBa', 'PhuNuTim', 'CoAoDai', 'CuuChienBinh', 'ThanhNien', 'HocSinh', 'SuThay', 'NuTu']
DT = ['Idle', 'Walk', 'Pray', 'Kneel', 'Bow']
for o in bpy.data.objects: o.select_set(False)
mat_trc = mat_sau = 0
for n in CH:
    rig, me = bpy.data.objects['Rig' + n], bpy.data.objects[n]
    mat_trc += len(me.data.polygons)
    # giảm lưới trước khi gắn xương (modifier đứng đầu) rồi áp dụng
    dec = me.modifiers.new('giam', 'DECIMATE'); dec.ratio = TI_LE
    while me.modifiers.find('giam') > 0:
        with bpy.context.temp_override(object=me, active_object=me):
            bpy.ops.object.modifier_move_up(modifier='giam')
    with bpy.context.temp_override(object=me, active_object=me, selected_objects=[me], selected_editable_objects=[me]):
        bpy.ops.object.modifier_apply(modifier='giam')
    mat_sau += len(me.data.polygons)
    ad = rig.animation_data; rig.location = (0, 0, 0); ad.action = None
    for tr in list(ad.nla_tracks): ad.nla_tracks.remove(tr)
    for a in DT:
        act = bpy.data.actions[a + '_' + n]; tr = ad.nla_tracks.new(); tr.name = a
        st = tr.strips.new(a, int(act.frame_range[0]), act)
        if hasattr(st, 'action_slot') and len(act.slots): st.action_slot = act.slots[0]
    rig.select_set(True); me.select_set(True)
    for m in me.data.materials:
        for nd in (m.node_tree.nodes if m and m.node_tree else []):
            if nd.type == 'TEX_IMAGE' and nd.image and nd.image.size[0] > 512: nd.image.scale(512, 512)
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_format='GLB', export_animation_mode='NLA_TRACKS',
    export_merge_animation='NLA_TRACK', export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7,
    export_image_format='JPEG', export_jpeg_quality=80)
print('XUAT', OUT, 'mat', mat_trc, '->', mat_sau)
