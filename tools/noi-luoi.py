"""Nối các vùng rời của lưới đi (js/04-00-du-lieu-canh.js) vào vùng chính bằng lối ngắn nhất.

Lưới từ Blender đôi khi bị cắt vụn: xà cổng che mất một hàng ô, gốc bồ đề nằm giữa bãi cỏ...
Khi đó nhân vật không tìm được đường và đi thẳng xuyên địa hình. Công cụ này lát lối nối:
  '1' đi được, '2' cỏ (đi được nếu cần nối, rẻ), '0' không (chỉ lát khi khe hẹp, đắt).
Dùng:
  python3 tools/noi-luoi.py <cảnh> [luoi.json]   # luoi.json: {"w","h","rows"} có thể chứa '2' (từ Blender)
Không có luoi.json thì lấy lưới đang có của cảnh. Ghi thẳng vào js/04-00-du-lieu-canh.js.
"""
import heapq, json, re, sys

DU_LIEU = 'js/04-00-du-lieu-canh.js'
GIA = {'2': 1, '0': 6}    # giá mỗi ô khi lát lối nối
TRAN = 40                 # khe đắt hơn mức này thì bỏ (là tường thật)
NHO = 6                   # vùng nhỏ hơn thế là nhiễu, không nối


def vung(R, W, H):
    lab = [[0] * W for _ in range(H)]; sz = [0]
    for j in range(H):
        for i in range(W):
            if R[j][i] == '1' and not lab[j][i]:
                n = len(sz); st = [(i, j)]; lab[j][i] = n; c = 0
                while st:
                    x, y = st.pop(); c += 1
                    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                        a, b = x + dx, y + dy
                        if 0 <= a < W and 0 <= b < H and R[b][a] == '1' and not lab[b][a]:
                            lab[b][a] = n; st.append((a, b))
                sz.append(c)
    return lab, sz


def noi(R, W, H):
    R = [list(r) for r in R]; so = 0
    while True:
        lab, sz = vung(R, W, H); chinh = sz.index(max(sz))
        con = [n for n in range(1, len(sz)) if n != chinh and sz[n] >= NHO]
        tot = None
        for n in con:   # Dijkstra từ vùng n tới vùng chính
            d = {}; prev = {}; q = []
            for j in range(H):
                for i in range(W):
                    if lab[j][i] == n: d[(i, j)] = 0; heapq.heappush(q, (0, i, j))
            while q:
                c, i, j = heapq.heappop(q)
                if c > d.get((i, j), 1e9) or c > TRAN: continue
                if lab[j][i] == chinh:
                    if tot is None or c < tot[0]: tot = (c, n, (i, j), prev)
                    break
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    a, b = i + dx, j + dy
                    if not (0 <= a < W and 0 <= b < H): continue
                    k = R[b][a]; nc = c + (0 if k == '1' else GIA[k])
                    if nc < d.get((a, b), 1e9): d[(a, b)] = nc; prev[(a, b)] = (i, j); heapq.heappush(q, (nc, a, b))
        if tot is None: break
        _, n, o, prev = tot; lo = []
        while o in prev: o = prev[o]; lo.append(o)
        for i, j in lo:   # lối rộng 2 ô để đường chéo vẫn qua được (luật góc của js/04-01)
            for a, b in ((i, j), (i + 1, j), (i, j + 1)):
                if 0 <= a < W and 0 <= b < H and R[b][a] == '2': R[b][a] = '1'
            R[j][i] = '1'
        so += 1
    return [''.join('1' if c == '1' else '0' for c in r) for r in R], so


def main():
    canh = sys.argv[1]; s = open(DU_LIEU, encoding='utf-8').read()
    m = re.search(r'(\n\s*' + canh + r':\{"map":1.*?"grid":)(\{"w":\d+,"h":\d+,"rows":\[[^\]]*\]\})', s)
    g = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else json.loads(m.group(2))
    rows, so = noi(g['rows'], g['w'], g['h'])
    _, sz = vung(rows, g['w'], g['h'])
    moi = json.dumps({'w': g['w'], 'h': g['h'], 'rows': rows}, separators=(',', ':'))
    open(DU_LIEU, 'w', encoding='utf-8').write(s[:m.start(2)] + moi + s[m.end(2):])
    print(canh, 'nối', so, 'lối; vùng', len(sz) - 1, 'lớn nhất', max(sz), 'ô')


if __name__ == '__main__':
    main()
