"""Kiểm phòng chung (functions/api/phong → phong/index.js, docs/phong-chung.md): chỉ người đăng nhập vào được,
tên không giả được, dữ liệu rác bị lọc, gửi dồn dập bị đuổi, đăng xuất thì hết vào.
Cần: máy chủ trang (wrangler pages dev) bật Google với GOOGLE_THU=http://localhost:8790, TK_KHOA, và binding PHONG
nối tới `wrangler dev` của thư mục phong/ (xem docs/phong-chung.md mục "Chạy thử ở máy"). Cần python: websockets.
Chạy: python3 tests/phong.py [http://localhost:8789]"""
import asyncio, json, sys, time, random, threading, base64, hashlib, http.server, urllib.request, urllib.error, urllib.parse
import websockets

GOC = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8789').rstrip('/')
WS = GOC.replace('http', 'ws', 1) + '/api/phong'
loi = []

# ---------- Google giả ----------
CHO, NGUOI = {}, {}
class Gia(http.server.BaseHTTPRequestHandler):
    def tra(s, o, st=200):
        b = json.dumps(o).encode(); s.send_response(st); s.send_header('Content-Type', 'application/json'); s.end_headers(); s.wfile.write(b)
    def do_POST(s):
        f = urllib.parse.parse_qs(s.rfile.read(int(s.headers.get('Content-Length', 0))).decode()); g = lambda k: (f.get(k) or [''])[0]
        c = CHO.pop(g('code'), None); cc = base64.urlsafe_b64encode(hashlib.sha256(g('code_verifier').encode()).digest()).rstrip(b'=').decode()
        if not c or c['cc'] != cc: return s.tra({'error': 'invalid_grant'}, 400)
        NGUOI['at' + c['zid']] = c; s.tra({'access_token': 'at' + c['zid']})
    def do_GET(s):
        c = NGUOI.get((s.headers.get('Authorization') or '')[7:]); s.tra({'sub': c['zid'], 'name': c['ten']} if c else {'error': 'x'}, 200 if c else 401)
    def log_message(s, *a): pass
threading.Thread(target=http.server.HTTPServer(('127.0.0.1', 8790), Gia).serve_forever, daemon=True).start()

class KhongTheo(urllib.request.HTTPRedirectHandler):
    def redirect_request(s, *a): return None
mo = urllib.request.build_opener(KhongTheo)
def goi(ck, duong, method='GET', body=None):
    h = {'Cookie': ck, 'Origin': GOC}
    if body is not None: h['Content-Type'] = 'application/json'
    req = urllib.request.Request(GOC + duong, method=method, headers=h, data=None if body is None else json.dumps(body).encode())
    try: r = mo.open(req)
    except urllib.error.HTTPError as e: r = e
    return r
def dang_nhap(ten):
    r = goi('', '/api/google/bat-dau'); ck = r.headers.get('Set-Cookie').split(';')[0]
    q = urllib.parse.parse_qs(urllib.parse.urlparse(r.headers.get('Location')).query)
    code = 'ma-%d' % random.randint(1, 10**12); CHO[code] = {'cc': q['code_challenge'][0], 'zid': str(random.randint(10**15, 10**16)), 'ten': ten}
    r = goi(ck, '/api/google/ve?' + urllib.parse.urlencode({'code': code, 'state': q['state'][0]}))
    return [v.split(';')[0] for v in r.headers.get_all('Set-Cookie') if v.startswith('__Host-ss_phien=') and v.split(';')[0].split('=', 1)[1]][0]

def ky(ten, dung):
    if dung: print('  ✓', ten)
    else: loi.append(ten)

async def ket(ck, origin=GOC):
    return await websockets.connect(WS, additional_headers={'Cookie': ck} if ck else {}, origin=origin, open_timeout=10)
async def nhan(ws, t, cho=3):
    while True:
        m = json.loads(await asyncio.wait_for(ws.recv(), cho))
        if m.get('t') == t: return m
async def bi_dong(ws):   # máy chủ báo 'het' rồi đóng (mã 4002)
    try: return (await nhan(ws, 'het', 5)).get('ma') == 4002
    except Exception: return ws.close_code == 4002
async def bi_chan(ck, origin=GOC):
    try: w = await ket(ck, origin); await w.close(); return False
    except Exception: return True

async def main():
    A, B = dang_nhap('Trưởng họ An'), dang_nhap('Cháu Bình')
    ky('chưa đăng nhập không vào được phòng chung', await bi_chan(''))
    ky('phiên giả không vào được', await bi_chan('__Host-ss_phien=' + '0' * 64))
    ky('trang khác (Origin lạ) không mượn được cookie để vào', await bi_chan(A, 'https://trang-xau.example'))
    wa = await ket(A); ca = await nhan(wa, 'chao')
    wb = await ket(B); cb = await nhan(wb, 'chao')
    ky('vào phòng: nhận lời chào kèm mã riêng của kết nối', bool(ca.get('toi')) and ca['toi'] != cb['toi'])
    toi_a = json.loads(goi(A, '/api/toi').read())['nguoi']['id']
    ky('mã trong phòng không phải mã tài khoản', toi_a not in json.dumps(ca) + json.dumps(cb))
    await wa.send(json.dumps({'p': {'w': 1, 'f': 'phat', 's': 'nui', 'h': 1, 'x': 0.4, 'y': 5, 'a': 'dung', 'k': 1, 'tc': 'nam.ngan.1', 'e': None,
                                    'n': 'Quản trị viên', 'xau': '<img src=x onerror=alert(1)>', 's2': 1, 'li': 1795000000000}}))
    m = await nhan(wb, 'p')
    p = m['p']
    ky('người khác thấy vị trí của mình', m['peer'] == ca['toi'] and p.get('x') == 0.4 and p.get('s') == 'nui')
    ky('tên do máy chủ gắn (chỉ tên gọi), không giả được', p.get('n') == 'An')
    ky('bỏ trường lạ, giới hạn toạ độ', 'xau' not in p and 's2' not in p and p.get('y') == 2)
    await wa.send(json.dumps({'p': {'s': '<script>', 'a': 'x' * 300, 'tc': 'A B', 'x': 'chữ', 'c': 1.5}}))
    p = (await nhan(wb, 'p'))['p']
    ky('chữ có ký tự lạ hoặc quá dài bị bỏ', all(k not in p for k in ('s', 'a', 'tc', 'x', 'c')))
    # rà PR #109: làng riêng "ho:<băm tên + số điện thoại>" dò ngược được số điện thoại; biểu cảm lạ; nhang ở tương lai; màu âm
    await wa.send(json.dumps({'p': {'x': .5, 'e': 'constructor', 's': 'ho:u1fdz86u', 'li': 9999999999999, 'c': -3}}))
    p = (await nhan(wb, 'p'))['p']
    ky('biểu cảm ngoài danh sách (pray, heart, flower, light) bị bỏ', p.get('e') in (None, 'pray', 'heart', 'flower', 'light'))
    ky('cảnh làng riêng (ho:<băm>) không gửi cho người khác', not str(p.get('s', '')).startswith('ho:'))
    ky('li (giờ thắp nhang) không ở tương lai, màu không âm', 'li' not in p and 'c' not in p)
    await wa.send(json.dumps({'p': {'x': .5, 'e': 'pray', 's': 'dien', 'li': int(time.time() * 1000) - 60000, 'c': 3}}))
    p = (await nhan(wb, 'p'))['p']
    ky('giá trị đúng vẫn qua', p.get('e') == 'pray' and p.get('s') == 'dien' and p.get('c') == 3 and 'li' in p)
    wc = await ket(B); cc = await nhan(wc, 'chao')
    ky('người vào sau thấy ngay người đang có mặt', any(x['peer'] == ca['toi'] for x in cc['ds']))
    await wa.send('{hỏng'); await wa.send(json.dumps({'p': 'x' * 3000}))
    await wa.send(json.dumps({'p': {'x': 0.5}})); p = (await nhan(wb, 'p'))['p']
    ky('tin hỏng hoặc quá lớn không làm sập phòng', p.get('x') == 0.5)
    await wc.close()
    m = await nhan(wb, 'di')
    ky('rời phòng: người khác được báo', m.get('peer') == cc['toi'])
    try:   # 15 tin/giây, gấp 3 nhịp của trang thật
        t0 = time.time()
        while time.time() - t0 < 4: await wa.send(json.dumps({'p': {'x': .1}})); await asyncio.sleep(1 / 15)
        await asyncio.wait_for(wa.wait_closed(), 3)
    except Exception: pass
    ky('gửi đều 15 tin/giây thì bị đuổi khỏi phòng', wa.close_code == 1008)
    ky('bị đuổi rồi không nối lại ngay được (cấm 60 giây)', await bi_chan(A))
    ws2 = []
    try:
        for _ in range(3): w = await ket(B); await nhan(w, 'chao'); ws2.append(w)
        ky('một người mở quá 2 kết nối bị chặn', False)
    except Exception: ky('một người mở quá 2 kết nối bị chặn', True)
    for w in ws2: await w.close()
    C = dang_nhap('Người dùng C'); wc = await ket(C); await nhan(wc, 'chao')
    goi(C, '/api/toi', 'PUT', {'ten': 'Ban Quản Trị'})
    ky('đổi tên thì kết nối cũ bị đóng (không giữ tên cũ)', await bi_dong(wc))
    wc = await ket(C); minh = (await nhan(wc, 'chao'))['toi']; await wc.send(json.dumps({'p': {'x': .3}}))
    m = await nhan(wb, 'p')
    while m.get('peer') != minh: m = await nhan(wb, 'p')   # bỏ các tin dồn từ trước
    ky('tên giả ban quản trị hiện thành "Khách viếng"', m['p'].get('n') == 'Khách viếng')
    goi(C, '/api/dang-xuat', 'POST', {})
    ky('đăng xuất thì kết nối đang mở bị đóng', await bi_dong(wc))
    ky('đăng xuất rồi không vào lại được', await bi_chan(C))
    # ---------- mã ẩn danh u, báo cáo (mục 8) ----------
    D = dang_nhap('Người Bị Báo'); wd = await ket(D); await nhan(wd, 'chao'); await wd.send(json.dumps({'p': {'x': .4, 'u': 'giamao0000000000'}}))
    m = await nhan(wb, 'p')
    while m.get('peer') is None or m['p'].get('n') != 'Báo': m = await nhan(wb, 'p')
    u = m['p'].get('u') or ''
    ky('máy chủ gắn mã ẩn danh u (không lấy u trang gửi lên)', len(u) == 16 and u != 'giamao0000000000')
    id_d = json.loads(goi(D, '/api/toi').read())['nguoi']['id']
    ky('u không phải mã tài khoản', u not in id_d)
    ky('biết mã tài khoản (cùng dòng họ) cũng không tính ra u (rà PR #114)', u != hashlib.sha256(('u:' + id_d).encode()).hexdigest()[:16])
    await wd.close(); wd = await ket(D); await nhan(wd, 'chao'); await wd.send(json.dumps({'p': {'x': .5}}))
    m = await nhan(wb, 'p')
    while m['p'].get('n') != 'Báo': m = await nhan(wb, 'p')
    ky('vào lại vẫn cùng mã u (ẩn đúng người)', m['p'].get('u') == u)
    await wd.send(json.dumps({'t': 'bao', 'u': u}))   # tự báo cáo mình: bỏ qua
    nguoi_bao = []
    for i in range(3):
        X = dang_nhap(f'Người báo {i}'); wx = await ket(X); await nhan(wx, 'chao'); nguoi_bao.append(wx)
        await wx.send(json.dumps({'t': 'bao', 'u': u}))
    try:
        while True:
            m = await nhan(wb, 'di', 5)
            if m.get('peer'): break
        bi_an = True
    except Exception: bi_an = False
    ky('3 tài khoản khác nhau báo cáo: người đó bị ẩn với mọi người', bi_an)
    E = dang_nhap('Người vào sau'); we = await ket(E); ce = await nhan(we, 'chao')
    ky('người vào sau không thấy người đang bị ẩn', all((x.get('p') or {}).get('u') != u for x in ce['ds']))
    await wd.send(json.dumps({'p': {'x': .6}}))
    try: m = await nhan(we, 'p', 2); lo = m['p'].get('u') == u
    except Exception: lo = False
    ky('người bị ẩn đi lại cũng không ai thấy', not lo)
    for w in nguoi_bao + [wd, we]: await w.close()
    await wb.close()

asyncio.run(main())
if loi:
    print('KHÔNG ĐẠT:'); [print('  ✗', x) for x in loi]; sys.exit(1)
print('ĐẠT')
