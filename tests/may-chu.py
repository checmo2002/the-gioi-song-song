"""Kiểm máy chủ gia phả dòng họ (functions/api, docs/gia-pha-dong-ho.md): đăng nhập Google/Zalo, phiên, quyền, cây xấu, giả mạo yêu cầu.
Bài thử tự dựng "Google giả" và "Zalo giả" ở http://localhost:8790 (đổi mã lấy token có kiểm khoá bí mật và PKCE, trả thông tin người dùng).
Máy chủ thử phải chạy với biến môi trường (file .dev.vars cạnh wrangler.toml, xem docs/gia-pha-dong-ho.md mục "Chạy thử ở máy"):
    TK_KHOA=khoa-thu   GOOGLE_CLIENT_ID=gg-thu   GOOGLE_CLIENT_SECRET=gg-bi-mat   GOOGLE_THU=http://localhost:8790
    ZALO_APP_ID=app-thu   ZALO_APP_SECRET=bi-mat-thu   ZALO_OAUTH=http://localhost:8790   ZALO_GRAPH=http://localhost:8790
Chạy: python3 tests/may-chu.py [http://localhost:8788]"""
import json, sys, random, threading, base64, hashlib, http.server, urllib.request, urllib.error, urllib.parse

GOC = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8788').rstrip('/')
loi = []

# ---------- Google giả, Zalo giả ----------
CHO = {}   # mã code -> {cc, zid, ten, ve}
class Gia(http.server.BaseHTTPRequestHandler):
    def tra(s, o, st=200):
        b = json.dumps(o).encode(); s.send_response(st); s.send_header('Content-Type', 'application/json'); s.end_headers(); s.wfile.write(b)
    def do_POST(s):   # Google: /token, Zalo: /v4/access_token
        f = urllib.parse.parse_qs(s.rfile.read(int(s.headers.get('Content-Length', 0))).decode())
        g = lambda k: (f.get(k) or [''])[0]; c = CHO.pop(g('code'), None)
        cc = base64.urlsafe_b64encode(hashlib.sha256(g('code_verifier').encode()).digest()).rstrip(b'=').decode()
        if s.path == '/token':
            if g('client_id') != 'gg-thu' or g('client_secret') != 'gg-bi-mat' or g('grant_type') != 'authorization_code' or not c or c['cc'] != cc or g('redirect_uri') != c['ve']:
                return s.tra({'error': 'invalid_grant'}, 400)
        elif s.headers.get('secret_key') != 'bi-mat-thu' or g('app_id') != 'app-thu' or not c or c['cc'] != cc: return s.tra({'error': -14014, 'error_name': 'invalid'}, 400)
        s.tra({'access_token': 'at-' + c['zid'], 'expires_in': 3600}); NGUOI['at-' + c['zid']] = c
    def do_GET(s):    # Google: /v1/userinfo (Bearer), Zalo: /v2.0/me
        if s.path.startswith('/v1/userinfo'):
            c = NGUOI.get((s.headers.get('Authorization') or '')[7:]); return s.tra({'sub': c['zid'], 'name': c['ten']} if c else {'error': 'invalid_token'}, 200 if c else 401)
        c = NGUOI.get(s.headers.get('access_token'))
        s.tra({'id': c['zid'], 'name': c['ten']} if c else {'error': 452, 'message': 'Access token is invalid'})
    def log_message(s, *a): pass
NGUOI = {}
threading.Thread(target=http.server.HTTPServer(('127.0.0.1', 8790), Gia).serve_forever, daemon=True).start()


class KhongTheo(urllib.request.HTTPRedirectHandler):
    def redirect_request(s, *a): return None
mo = urllib.request.build_opener(KhongTheo)


class Nguoi:
    def __init__(s, ck=''): s.ck = ck

    def goi(s, method, duong, body=None, origin=GOC, ctype='application/json'):
        h = {'Cookie': s.ck}
        if origin: h['Origin'] = origin
        if body is not None: h['Content-Type'] = ctype
        req = urllib.request.Request(GOC + duong, method=method, headers=h, data=None if body is None else json.dumps(body).encode())
        try: r = mo.open(req); st = r.status
        except urllib.error.HTTPError as e: r = e; st = e.code
        for v in r.headers.get_all('Set-Cookie') or []:
            k, gt = v.split(';')[0].split('=', 1)
            s.ck = '; '.join([x for x in s.ck.split('; ') if x and not x.startswith(k + '=')] + ([k + '=' + gt] if gt else []))
        s.vi_tri = r.headers.get('Location') or ''
        t = r.read().decode()
        try: return st, (json.loads(t) if t else {})
        except ValueError: return st, {'tho': t[:120]}


def ky(ten, dk, st, du_kien):
    if st != du_kien: loi.append(f'{ten}: được {st}, cần {du_kien} — {dk}')
    else: print(f'  ✓ {ten}')


def dn(ten, ben='google', n=None, sua=None):
    """Đi trọn luồng đăng nhập (Google hoặc Zalo); sua(n, state, code) để thử luồng hỏng."""
    n = n or Nguoi(); n.goi('GET', f'/api/{ben}/bat-dau')
    q = urllib.parse.parse_qs(urllib.parse.urlparse(n.vi_tri).query); g = lambda k: (q.get(k) or [''])[0]
    ok = (g('client_id') == 'gg-thu' and g('code_challenge_method') == 'S256' and g('scope') == 'openid profile') if ben == 'google' else g('app_id') == 'app-thu'
    if not ok or not g('code_challenge') or not g('redirect_uri').endswith(f'/api/{ben}/ve'): loi.append(f'URL sang {ben} thiếu tham số: {n.vi_tri[:160]}')
    code = 'ma-%d' % random.randint(1, 10**12); CHO[code] = {'cc': g('code_challenge'), 'zid': str(random.randint(10**15, 10**16)), 'ten': ten, 've': g('redirect_uri')}
    st, code = (sua(n, g('state'), code) if sua else (g('state'), code))
    n.goi('GET', f'/api/{ben}/ve?' + urllib.parse.urlencode({'code': code, 'state': st}))
    return n


CAY = {'members': [{'id': 'u1', 'name': 'Phạm Văn Lễ', 'g': 'm', 'b': 1890, 'd': 1951, 'nm': '12/3', 'nmAl': True, 'spouse': 'u2', 'self': True, 'houseOf': 'u2'},
                   {'id': 'u2', 'name': 'Đinh Thị Tơ', 'g': 'f', 'b': 1894, 'd': 1960, 'spouse': 'u1'},
                   {'id': 'u3', 'name': '<img src=x onerror=alert(1)>', 'g': 'm', 'b': 1922, 'parent': 'u1'}], 'seq': 4}
sao = lambda c: json.loads(json.dumps(c))

# ---------- đăng nhập Google / Zalo, phiên ----------
st, r = Nguoi().goi('GET', '/api/toi'); ky('chưa đăng nhập: /toi vẫn trả', r, st, 200)
if r.get('nguoi') is not None: loi.append('chưa đăng nhập mà /toi có người')
A = dn('Trưởng họ'); st, r = A.goi('GET', '/api/toi'); ky('đăng nhập Google thành công', r, st, 200)
if not (r.get('nguoi') or {}).get('id', '').startswith('g'): loi.append(f'đăng nhập Google xong mà chưa có phiên: {r}')
if sorted(r.get('cach') or []) != ['google', 'zalo']: loi.append(f'/toi phải báo các cách đăng nhập đang bật: {r.get("cach")}')
Z = dn('Người dùng Zalo', 'zalo'); st, r = Z.goi('GET', '/api/toi')
if not (r.get('nguoi') or {}).get('id', '').startswith('z'): loi.append(f'đăng nhập Zalo (để sẵn) không chạy: {r}')
else: print('  ✓ đăng nhập Zalo vẫn chạy khi có khoá')
X = Nguoi(); X.goi('GET', '/api/google/bat-dau'); q = urllib.parse.parse_qs(urllib.parse.urlparse(X.vi_tri).query)
code = 'ma-%d' % random.randint(1, 10**12); CHO[code] = {'cc': q['code_challenge'][0], 'zid': '42', 'ten': 'Lẫn bên', 've': q['redirect_uri'][0]}
X.goi('GET', '/api/zalo/ve?' + urllib.parse.urlencode({'code': code, 'state': q['state'][0]}))
if '__Host-ss_phien=' in X.ck: loi.append('state của lượt Google dùng được ở đường về của Zalo')
else: print('  ✓ state của bên này không dùng được cho bên kia')
st, r = A.goi('GET', '/api/facebook/bat-dau'); ky('bên đăng nhập lạ bị từ chối', r, st, 404)
if '__Host-ss_dn=' in A.ck: loi.append('đăng nhập xong vẫn còn cookie __Host-ss_dn')
B, C = dn('Thành viên B'), dn('Người ngoài C')
gai = Nguoi(); gai.goi('GET', '/api/google/bat-dau'); q = urllib.parse.parse_qs(urllib.parse.urlparse(gai.vi_tri).query)
nan = Nguoi(); st, r = nan.goi('GET', '/api/google/ve?' + urllib.parse.urlencode({'code': 'ma-bat-ky', 'state': q['state'][0]}))
if '__Host-ss_phien=' in nan.ck or 'dang-nhap=loi' not in nan.vi_tri: loi.append('trình duyệt khác dùng state của người khác vẫn đăng nhập được (gài đăng nhập)')
else: print('  ✓ chặn gài đăng nhập bằng state của trình duyệt khác')
D = dn('Sai PKCE', sua=lambda n, st, code: (CHO[code].update(cc='sai'), (st, code))[1])
if '__Host-ss_phien=' in D.ck: loi.append('mã code không khớp PKCE mà vẫn đăng nhập được')
else: print('  ✓ chặn mã code không khớp PKCE')
E = Nguoi(); E.goi('GET', '/api/google/bat-dau'); q = urllib.parse.parse_qs(urllib.parse.urlparse(E.vi_tri).query); ck = E.ck
E.goi('GET', '/api/google/ve?' + urllib.parse.urlencode({'code': 'x', 'state': q['state'][0]})); E.ck = ck
E.goi('GET', '/api/google/ve?' + urllib.parse.urlencode({'code': 'x', 'state': q['state'][0]}))
if 'dang-nhap=het-han' not in E.vi_tri: loi.append(f'dùng lại state lần hai phải báo hết hạn: {E.vi_tri}')
else: print('  ✓ state chỉ dùng được một lần')
st, r = Nguoi('__Host-ss_phien=' + '0' * 64).goi('POST', '/api/dong-ho', {'ten': 'Họ X', 'cay': CAY}); ky('phiên giả bị từ chối', r, st, 401)
# cookie ném từ tên miền con (bản xem trước) không có tiền tố __Host-, hoặc trùng tên: phải bị bỏ qua
gai = Nguoi(); gai.goi('GET', '/api/google/bat-dau'); q = urllib.parse.parse_qs(urllib.parse.urlparse(gai.vi_tri).query)
code = 'ma-%d' % random.randint(1, 10**12); CHO[code] = {'cc': q['code_challenge'][0], 'zid': '1234567890123456', 'ten': 'Kẻ xấu'}
nan = Nguoi('ss_dn=' + q['state'][0]); nan.goi('GET', '/api/google/ve?' + urllib.parse.urlencode({'code': code, 'state': q['state'][0]}))
if '__Host-ss_phien=' in nan.ck: loi.append('cookie ss_dn ném từ tên miền con gài được đăng nhập')
else: print('  ✓ bỏ qua cookie state không có tiền tố __Host-')
tk = [x for x in B.ck.split('; ') if x.startswith('__Host-ss_phien=')][0].split('=', 1)[1]
st, r = Nguoi('ss_phien=' + tk).goi('GET', '/api/toi')
if r.get('nguoi'): loi.append('máy chủ nhận cookie phiên không có tiền tố __Host-')
st, r = Nguoi(f'__Host-ss_phien={tk}; __Host-ss_phien={tk}').goi('GET', '/api/toi')
if r.get('nguoi'): loi.append('cookie phiên trùng tên vẫn được nhận')
else: print('  ✓ bỏ qua cookie phiên trùng tên')
st, r = A.goi('PUT', '/api/toi', {'ten': 'Trưởng họ Phạm'}); ky('đổi tên hiển thị', r, st, 200)

# ---------- giả mạo yêu cầu ----------
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, origin='https://trang-xau.example'); ky('chặn Origin lạ', r, st, 403)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, origin='null'); ky('chặn Origin null', r, st, 403)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, origin=None); ky('chặn thiếu Origin', r, st, 403)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, ctype='text/plain'); ky('chặn không phải JSON', r, st, 415)

# ---------- cây xấu ----------
def cay_xau(ten, sua):
    x = sao(CAY); sua(x); st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': x}); ky(ten, r, st, 400)
cay_xau('cây trỏ tới người không có', lambda x: x['members'][2].update(parent='khong-co'))
cay_xau('cây sai kiểu năm', lambda x: x['members'][0].update(b='1890; DROP TABLE'))
cay_xau('người tự làm cha mình', lambda x: x['members'][2].update(parent='u3'))
cay_xau('vòng cha – con', lambda x: x['members'][0].update(parent='u3'))
cay_xau('id __proto__', lambda x: x['members'][2].update(id='__proto__'))
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': {'members': [{'id': 'u%d' % i, 'name': 'x'} for i in range(2001)]}}); ky('cây quá 2.000 người', r, st, 400)

# ---------- lập dòng họ ----------
dk = sao(CAY); dk['members'][1]['name'] = 'Đinh Thị‮ Tơ\u0000'
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': dk}); ky('A lập dòng họ', r, st, 201); DH = r.get('id')
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); ky('A xem cây', r, st, 200)
ms = (r.get('cay') or {}).get('members', [{}, {}, {}])
if 'self' in ms[0] or 'houseOf' in ms[0]: loi.append('máy chủ lưu cả trường riêng của máy (self/houseOf)')
if ms[2].get('name') != CAY['members'][2]['name']: loi.append('tên có ký tự đặc biệt bị đổi')
if ms[1].get('name') != 'Đinh Thị Tơ': loi.append(f'chưa bỏ ký tự điều khiển/đảo chiều: {ms[1].get("name")!r}')
st, r = C.goi('GET', f'/api/dong-ho/{DH}'); ky('người ngoài không xem được', r, st, 404)
st, r = Nguoi().goi('GET', f'/api/dong-ho/{DH}'); ky('chưa đăng nhập không xem được', r, st, 401)

# ---------- mời ----------
st, r = B.goi('POST', '/api/tham-gia', {'ma': 'abcdefghjk'}); ky('mã mời sai', r, st, 404)
st, r = C.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('người ngoài không tạo được mã', r, st, 404)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('A tạo mã mời', r, st, 201); MA = r.get('ma')
st, r = B.goi('POST', '/api/tham-gia', {'ma': (MA or '').upper()}); ky('B vào bằng mã (chữ hoa vẫn được)', r, st, 200)
st, r = B.goi('GET', f'/api/dong-ho/{DH}'); ky('B xem cây', r, st, 200)
if r.get('vai') != 'thanh-vien': loi.append(f'B phải là thanh-vien, đang là {r.get("vai")}')
st, r = B.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('thành viên không tạo được mã', r, st, 403)
st, r = A.goi('DELETE', f'/api/dong-ho/{DH}/loi-moi', {}); ky('A thu hồi mã mời', r, st, 200)
st, r = C.goi('POST', '/api/tham-gia', {'ma': MA}); ky('mã đã thu hồi không dùng được', r, st, 404)

# ---------- đề xuất và duyệt ----------
moi = sao(CAY); moi['members'].append({'id': 'u4', 'name': 'Phạm Văn Khiêm', 'g': 'm', 'b': 1951, 'd': 1972, 'ls': True, 'parent': 'u3'}); moi['seq'] = 5
st, r = B.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 1}); ky('thành viên không sửa thẳng', r, st, 403)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat', {'cay': moi, 'phien_ban': 999}); ky('đề xuất trên phiên bản không có', r, st, 409)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat', {'cay': moi, 'phien_ban': 1, 'ghi_chu': 'Thêm chú Khiêm'}); ky('B gửi đề xuất', r, st, 201); DX1 = r.get('id')
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX1}/duyet', {}); ky('B không tự duyệt', r, st, 403)
st, r = A.goi('GET', f'/api/dong-ho/{DH}/de-xuat'); ky('A xem đề xuất chờ', r, st, 200)
if len(r.get('de_xuat', [])) != 1: loi.append('A phải thấy đúng 1 đề xuất chờ')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX1}/duyet', {}); ky('A duyệt', r, st, 200)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX1}/duyet', {}); ky('duyệt lần hai bị chặn', r, st, 404)
st, r = B.goi('GET', f'/api/dong-ho/{DH}')
if r.get('phien_ban') != 2 or len(r.get('cay', {}).get('members', [])) != 4: loi.append('sau duyệt cây phải lên phiên bản 2, có 4 người')
moi2 = sao(moi); moi2['members'][1]['an'] = 'Nghĩa trang làng'
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat', {'cay': moi2, 'phien_ban': 2}); DX2 = r.get('id')
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': '2'}); ky('phiên bản dạng chữ bị chặn', r, st, 400)
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 2}); ky('A sửa thẳng', r, st, 200)
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 2}); ky('sửa trên bản cũ bị chặn', r, st, 409)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX2}/duyet', {}); ky('duyệt đề xuất trên bản cũ bị chặn', r, st, 409)
st, r = B.goi('GET', f'/api/dong-ho/{DH}/de-xuat')
if (r.get('de_xuat') or [{}])[0].get('trang_thai') != 'tu-choi': loi.append('đề xuất trên bản cũ phải chuyển sang tu-choi')

# ---------- vai, mời ra ----------
st, r = B.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': 'x', 'vai': 'truong'}); ky('thành viên không giao vai', r, st, 403)
st, r = A.goi('GET', f'/api/dong-ho/{DH}/thanh-vien'); ky('xem thành viên', r, st, 200)
tv = {t['ten']: t['nguoi_id'] for t in r.get('thanh_vien', [])}
idA, idB = tv.get('Trưởng họ Phạm'), tv.get('Thành viên B')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idA, 'vai': 'thanh-vien'}); ky('trưởng họ không tự bỏ vai', r, st, 400)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idB, 'vai': 'truong'}); ky('A giao B vai trưởng họ', r, st, 200)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idA, 'vai': 'thanh-vien'}); ky('không hạ được người lập dòng họ', r, st, 403)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); MA2 = r.get('ma')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idB, 'vai': 'thanh-vien'}); ky('A hạ B về thành viên', r, st, 200)
st, r = C.goi('POST', '/api/tham-gia', {'ma': MA2}); ky('mã của người bị hạ vai hết hiệu lực', r, st, 404)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/xoa-thanh-vien', {'nguoi_id': idB}); ky('A mời B ra khỏi dòng họ', r, st, 200)
st, r = B.goi('GET', f'/api/dong-ho/{DH}'); ky('B đã ra không xem được nữa', r, st, 404)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); MA3 = r.get('ma')
st, r = B.goi('POST', '/api/tham-gia', {'ma': MA3}); ky('người bị mời ra không vào lại bằng mã mới', r, st, 404)

# ---------- gắn tài khoản (tk): chỉ gắn với chính mình ----------
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); pb = r['phien_ban']; cay = r['cay']
cay['members'][1]['tk'] = 'uid-nguoi-khac'; cay['members'][0]['tk'] = idA
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': cay, 'phien_ban': pb}); ky('A lưu cây có tk', r, st, 200)
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); ms = r['cay']['members']
if ms[1].get('tk') is not None: loi.append('gắn được người trong cây với tài khoản người khác')
if ms[0].get('tk') != idA: loi.append('không tự gắn được người trong cây với chính mình')

# ---------- lịch sử, khôi phục sau khi cây bị xoá sạch ----------
pb = r['phien_ban']
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': {'members': [], 'seq': 1}, 'phien_ban': pb}); ky('xoá sạch cây (để thử khôi phục)', r, st, 200)
st, r = A.goi('GET', f'/api/dong-ho/{DH}/lich-su'); ky('trưởng họ xem các bản cũ', r, st, 200)
ls = r.get('lich_su', [])
if not ls or ls[0]['phien_ban'] != pb or not ls[0]['so_nguoi']: loi.append(f'lịch sử phải có bản {pb} trước khi xoá: {ls[:2]}')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/khoi-phuc', {'ve': pb, 'phien_ban': pb + 1}); ky('khôi phục bản cũ', r, st, 200)
st, r = A.goi('GET', f'/api/dong-ho/{DH}')
if len(r['cay']['members']) != len(ms): loi.append('khôi phục xong cây chưa về như cũ')
st, r = C.goi('GET', f'/api/dong-ho/{DH}/lich-su'); ky('người ngoài không xem lịch sử', r, st, 404)

st, r = A.goi('PUT', '/api/toi', {'ten': 'Trưởng\u200b họ\u2028 Phạm\ufeff'})
if r.get('ten') != 'Trưởng họ Phạm': loi.append(f'chưa lọc ký tự rộng 0 / xuống dòng lạ: {r.get("ten")!r}')

# ---------- mã tài khoản Google/Zalo không lộ cho người khác (rà PR #107) ----------
# sub của Google là mã tài khoản Google dùng chung mọi dịch vụ: lộ ra là tra được người đó ở chỗ khác
SUB = '1%020d' % random.randint(0, 10**19)
P = dn('Có sub', sua=lambda n, st, code: (CHO[code].update(zid=SUB), (st, code))[1])
st, r = P.goi('GET', '/api/toi'); pid = (r.get('nguoi') or {}).get('id') or ''
if not pid or SUB in pid: loi.append(f'mã tài khoản trên máy chủ chứa nguyên sub của Google, cả dòng họ thấy qua /thanh-vien và tk: {pid}')
else: print('  ✓ mã tài khoản không chứa sub của Google')

# ---------- tk đã gắn với người khác thì không đè được (rà PR #107) ----------
H, K = dn('Trưởng họ H'), dn('Thành viên K')
idH = H.goi('GET', '/api/toi')[1]['nguoi']['id']; idK = K.goi('GET', '/api/toi')[1]['nguoi']['id']
st, r = H.goi('POST', '/api/dong-ho', {'ten': 'Họ Thử tk', 'cay': {'members': [{'id': 'u1', 'name': 'H', 'g': 'm', 'tk': idH}], 'seq': 2}}); DH9 = r.get('id')
K.goi('POST', '/api/tham-gia', {'ma': H.goi('POST', f'/api/dong-ho/{DH9}/loi-moi', {})[1].get('ma')})
st, r = K.goi('POST', f'/api/dong-ho/{DH9}/de-xuat', {'cay': {'members': [{'id': 'u1', 'name': 'H', 'g': 'm', 'tk': idK}], 'seq': 2}, 'phien_ban': 1})
if st == 201: H.goi('POST', f'/api/dong-ho/{DH9}/de-xuat/{r["id"]}/duyet', {})
if H.goi('GET', f'/api/dong-ho/{DH9}')[1]['cay']['members'][0].get('tk') != idH: loi.append('thành viên đè được tk của người khác bằng mã của mình (trưởng họ duyệt mà không thấy)')
else: print('  ✓ không đè được tk đã gắn với người khác')

# ---------- đăng xuất ----------
st, r = A.goi('POST', '/api/dang-xuat', {}); ky('đăng xuất', r, st, 200)
st, r = A.goi('GET', '/api/toi')
if r.get('nguoi') is not None: loi.append('đăng xuất rồi vẫn còn phiên')
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); ky('sau đăng xuất không xem được', r, st, 401)

for x in loi: print('  ✗', x)
assert not loi, 'KHÔNG ĐẠT'
print('ĐẠT')
