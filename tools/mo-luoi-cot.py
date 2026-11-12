"""Mở các ô lưới đi trước bị cột/xà che (sau khi nướng lại cảnh với 'bocot').
Dùng: python3 tools/mo-luoi-cot.py <cảnh> <mo-luoi.json từ tools/blender/mo-luoi-cot.py> > luoi.json
      python3 tools/noi-luoi.py <cảnh> luoi.json      # ghi vào js/04-00-du-lieu-canh.js
Chỉ mở ô thấy mặt sàn phẳng (pháp tuyến z > .7) của vật đi được; ô thấy đỉnh tường, tượng, bàn thờ giữ nguyên."""
import json, re, sys
SAN = {'nen', 'san', 'be', 'duong', 'dn', 'bac', 'tham', 'sanTruoc', 'loiLen', 'nenLh', 'bacBe', 'matBac', 'cauDa', 'loiDa',
       'chieuLe', 'tamThamMo', 'nenLau', 'bacLau', 'daThien', 'boDoanT'}
canh = sys.argv[1]; s = open('js/04-00-du-lieu-canh.js', encoding='utf-8').read()
g = json.loads(re.search(r'\n\s*' + canh + r':\{"map":1.*?"grid":(\{"w":\d+,"h":\d+,"rows":\[[^\]]*\]\})', s).group(1))
R = [list(r) for r in g['rows']]; mo = 0
for i, j, b, z in json.load(open(sys.argv[2]))['o']:
    if b in SAN and z > .7 and R[j][i] != '1': R[j][i] = '1'; mo += 1
g['rows'] = [''.join(r) for r in R]; json.dump(g, sys.stdout); print(canh, 'mở', mo, 'ô', file=sys.stderr)
