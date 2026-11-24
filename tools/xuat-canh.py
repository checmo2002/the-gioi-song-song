"""Xuất một cảnh sa bàn (song-song-*-iso.blend) sang glb cho web 3D, giữ nguyên vật liệu màu.
Chạy ngầm: blender -b <cảnh>.blend --python xuat-canh.py -- <file .glb ra>. Không lưu file .blend."""
import bpy, sys, math, json
OUT = sys.argv[sys.argv.index('--') + 1]
S = bpy.context.scene
for o in bpy.data.objects:   # vài file lưu khối ngoài cảnh: đưa hết vào để xuất
    if o.type == 'MESH' and S.name not in [s.name for s in o.users_scene]: S.collection.objects.link(o)
for o in S.objects: o.select_set(o.type == 'MESH')
sun = next((o for o in bpy.data.objects if o.type == 'LIGHT' and o.data.type == 'SUN'), None)
info = {'sun_rot': [round(math.degrees(a), 1) for a in sun.rotation_euler] if sun else None,
        'sun_energy': sun.data.energy if sun else None, 'sun_color': list(sun.data.color) if sun else None,
        'sun_angle': round(math.degrees(sun.data.angle), 2) if sun else None,
        'view': S.view_settings.view_transform, 'look': S.view_settings.look, 'exposure': S.view_settings.exposure,
        'world': [list(n.inputs[0].default_value)[:3] + [n.inputs[1].default_value] for n in (S.world.node_tree.nodes if S.world and S.world.node_tree else []) if n.type == 'BACKGROUND'],
        'mats': {m.name: [round(c, 3) for c in m.diffuse_color[:3]] for m in bpy.data.materials}}
for m in bpy.data.materials:
    b = m.node_tree and next((n for n in m.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
    if b: info['mats'][m.name] = [round(c, 3) for c in b.inputs['Base Color'].default_value[:3]] + [round(b.inputs['Roughness'].default_value, 2)]
print('INFO', json.dumps(info))
bpy.ops.export_scene.gltf(filepath=OUT, use_selection=True, export_format='GLB', export_apply=True,
    export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=7, export_animations=False)
print('XUAT', OUT)
