"""Kiểm phòng chung (functions/api/phong → phong/index.js, docs/phong-chung.md): chỉ người đăng nhập vào được,
tên không giả được, dữ liệu rác bị lọc, gửi dồn dập bị đuổi, đăng xuất thì hết vào.
Cần: máy chủ trang (wrangler pages dev) bật Google với GOOGLE_THU=http://localhost:8790, TK_KHOA, và binding PHONG
nối tới `wrangler dev` của thư mục phong/ (xem docs/phong-chung.md mục "Chạy thử ở máy"). Cần python: websockets.
Chạy: python3 tests/phong.py [http://localhost:8789]"""
import asyncio, json, sys, random, threading, base64, hashlib, http.server, urllib.request, urllib.error, urllib.parse
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
    ky('tên do máy chủ gắn, không giả được', p.get('n') == 'Trưởng họ An')
    ky('bỏ trường lạ, giới hạn toạ độ', 'xau' not in p and 's2' not in p and p.get('y') == 2)
    await wa.send(json.dumps({'p': {'s': '<script>', 'a': 'x' * 300, 'tc': 'A B', 'x': 'chữ', 'c': 1.5}}))
    p = (await nhan(wb, 'p'))['p']
    ky('chữ có ký tự lạ hoặc quá dài bị bỏ', all(k not in p for k in ('s', 'a', 'tc', 'x', 'c')))
    wc = await ket(B); cc = await nhan(wc, 'chao')
    ky('người vào sau thấy ngay người đang có mặt', any(x['peer'] == ca['toi'] for x in cc['ds']))
    await wa.send('{hỏng'); await wa.send(json.dumps({'p': 'x' * 3000}))
    await wa.send(json.dumps({'p': {'x': 0.5}})); p = (await nhan(wb, 'p'))['p']
    ky('tin hỏng hoặc quá lớn không làm sập phòng', p.get('x') == 0.5)
    await wc.close()
    m = await nhan(wb, 'di')
    ky('rời phòng: người khác được báo', m.get('peer') == cc['toi'])
    try:
        for _ in range(200): await wa.send(json.dumps({'p': {'x': 0.1}}))
        await asyncio.wait_for(wa.wait_closed(), 5)
    except Exception: pass
    ky('gửi dồn dập thì bị đuổi khỏi phòng', wa.close_code == 1008)
    ws5 = []
    try:
        for _ in range(6): w = await ket(B); await nhan(w, 'chao'); ws5.append(w)
        ky('một người mở quá 5 kết nối bị chặn', False)
    except Exception: ky('một người mở quá 5 kết nối bị chặn', True)
    for w in ws5: await w.close()
    await wb.close()
    goi(A, '/api/dang-xuat', 'POST', {})
    ky('đăng xuất rồi không vào lại được', await bi_chan(A))

asyncio.run(main())
if loi:
    print('KHÔNG ĐẠT:'); [print('  ✗', x) for x in loi]; sys.exit(1)
print('ĐẠT')
