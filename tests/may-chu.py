"""Kiểm máy chủ gia phả dòng họ (functions/api, docs/gia-pha-dong-ho.md): mã đăng nhập Firebase, quyền, cây xấu, giả mạo yêu cầu.
Bài thử tự làm "Firebase giả": tự sinh khoá RSA, phát khoá công khai ở http://localhost:8790/jwks và tự ký mã đăng nhập.
Máy chủ thử phải chạy với biến môi trường (file .dev.vars cạnh wrangler.toml, xem docs/gia-pha-dong-ho.md mục "Chạy thử ở máy"):
    FIREBASE_PROJECT_ID=song-song-thu   FIREBASE_API_KEY=khoa-thu   FIREBASE_JWKS=http://localhost:8790/jwks
Chạy: python3 tests/may-chu.py [http://localhost:8788]"""
import json, sys, time, random, threading, base64, urllib.request, urllib.error, http.server
import jwt
from cryptography.hazmat.primitives.asymmetric import rsa

GOC = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8788').rstrip('/')
DU_AN = 'song-song-thu'
loi = []

# ---------- Firebase giả ----------
khoa, khoa_la = rsa.generate_private_key(public_exponent=65537, key_size=2048), rsa.generate_private_key(public_exponent=65537, key_size=2048)
KID = 'thu-%d' % random.randint(1, 10**9)
b64u = lambda n: base64.urlsafe_b64encode(n.to_bytes((n.bit_length() + 7) // 8, 'big')).rstrip(b'=').decode()
pub = khoa.public_key().public_numbers()
JWKS = json.dumps({'keys': [{'kty': 'RSA', 'alg': 'RS256', 'use': 'sig', 'kid': KID, 'n': b64u(pub.n), 'e': b64u(pub.e)}]}).encode()


class Jwks(http.server.BaseHTTPRequestHandler):
    def do_GET(s):
        s.send_response(200); s.send_header('Content-Type', 'application/json'); s.send_header('Cache-Control', 'max-age=60'); s.end_headers(); s.wfile.write(JWKS)
    def log_message(s, *a): pass


threading.Thread(target=http.server.HTTPServer(('127.0.0.1', 8790), Jwks).serve_forever, daemon=True).start()


def ma_dn(uid, ten, xac_minh=True, **sua):
    now = int(time.time())
    c = {'aud': DU_AN, 'iss': 'https://securetoken.google.com/' + DU_AN, 'sub': uid, 'iat': now, 'auth_time': now, 'exp': now + 3600,
         'email': uid + '@vi-du.vn', 'email_verified': xac_minh, 'name': ten}
    c.update(sua)
    return jwt.encode(c, khoa, algorithm='RS256', headers={'kid': KID})


class Nguoi:
    def __init__(s, ma=None): s.ma = ma

    def goi(s, method, duong, body=None, origin=GOC, ctype='application/json'):
        h = {}
        if s.ma: h['Authorization'] = 'Bearer ' + s.ma
        if origin: h['Origin'] = origin
        if body is not None: h['Content-Type'] = ctype
        req = urllib.request.Request(GOC + duong, method=method, headers=h, data=None if body is None else json.dumps(body).encode())
        try: r = urllib.request.urlopen(req); st = r.status
        except urllib.error.HTTPError as e: r = e; st = e.code
        t = r.read().decode()
        try: return st, (json.loads(t) if t else {})
        except ValueError: return st, {'tho': t[:120]}


def ky(ten, dk, st, du_kien):
    if st != du_kien: loi.append(f'{ten}: được {st}, cần {du_kien} — {dk}')
    else: print(f'  ✓ {ten}')


uid = lambda: 'uid%d' % random.randint(1, 10**12)
A, B, C = Nguoi(ma_dn(uid(), 'Trưởng họ')), Nguoi(ma_dn(uid(), 'Thành viên B')), Nguoi(ma_dn(uid(), 'Người ngoài C'))
CAY = {'members': [{'id': 'u1', 'name': 'Phạm Văn Lễ', 'g': 'm', 'b': 1890, 'd': 1951, 'nm': '12/3', 'nmAl': True, 'spouse': 'u2', 'self': True, 'houseOf': 'u2'},
                   {'id': 'u2', 'name': 'Đinh Thị Tơ', 'g': 'f', 'b': 1894, 'd': 1960, 'spouse': 'u1'},
                   {'id': 'u3', 'name': '<img src=x onerror=alert(1)>', 'g': 'm', 'b': 1922, 'parent': 'u1'}], 'seq': 4}
sao = lambda c: json.loads(json.dumps(c))

# ---------- mã đăng nhập ----------
st, r = Nguoi().goi('GET', '/api/cau-hinh'); ky('cấu hình đăng nhập', r, st, 200)
if r.get('projectId') != DU_AN: loi.append('cau-hinh phải trả projectId của máy chủ')
st, r = Nguoi().goi('GET', '/api/toi'); ky('chưa đăng nhập: /toi vẫn trả', r, st, 200)
if r.get('nguoi') is not None: loi.append('chưa đăng nhập mà /toi có người')
for ten, ma in [('mã ký bằng khoá lạ', jwt.encode({'aud': DU_AN, 'iss': 'https://securetoken.google.com/' + DU_AN, 'sub': 'x', 'iat': int(time.time()), 'auth_time': int(time.time()), 'exp': int(time.time()) + 600}, khoa_la, algorithm='RS256', headers={'kid': KID})),
                ('mã hết hạn', ma_dn('x', 'x', exp=int(time.time()) - 10)),
                ('mã của dự án khác', ma_dn('x', 'x', aud='du-an-khac')),
                ('mã sai nơi cấp', ma_dn('x', 'x', iss='https://securetoken.google.com/du-an-khac')),
                ('mã không ký (alg none)', jwt.encode({'aud': DU_AN, 'sub': 'x'}, None, algorithm='none'))]:
    st, r = Nguoi(ma).goi('POST', '/api/dong-ho', {'ten': 'Họ X', 'cay': CAY}); ky(ten + ' bị từ chối', r, st, 401)
st, r = Nguoi(ma_dn(uid(), 'Chưa xác nhận', xac_minh=False)).goi('POST', '/api/dong-ho', {'ten': 'Họ X', 'cay': CAY}); ky('email chưa xác nhận không lập được dòng họ', r, st, 403)
for n in (A, B, C): n.goi('GET', '/api/toi')
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

for x in loi: print('  ✗', x)
assert not loi, 'KHÔNG ĐẠT'
print('ĐẠT')
