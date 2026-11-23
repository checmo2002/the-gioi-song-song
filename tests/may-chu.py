"""Kiểm máy chủ gia phả dòng họ (functions/api, docs/gia-pha-dong-ho.md): quyền, khoá đăng nhập sai, cây xấu, giả mạo yêu cầu.
Chạy máy chủ thật ở máy (wrangler + D1 cục bộ, xem docs/gia-pha-dong-ho.md mục "Chạy thử ở máy") rồi:
    python3 tests/may-chu.py [http://localhost:8788]"""
import json, sys, random, urllib.request, urllib.error

GOC = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8788').rstrip('/')
loi = []


class Nguoi:
    """Một trình duyệt: tự giữ cookie phiên (cookie Secure không đi qua http cục bộ nếu dùng cookiejar)."""
    def __init__(s): s.ck = ''

    def goi(s, method, duong, body=None, origin=GOC, ctype='application/json'):
        h = {'Cookie': s.ck}
        if origin: h['Origin'] = origin
        if body is not None: h['Content-Type'] = ctype
        req = urllib.request.Request(GOC + duong, method=method, headers=h, data=None if body is None else json.dumps(body).encode())
        try: r = urllib.request.urlopen(req); st = r.status
        except urllib.error.HTTPError as e: r = e; st = e.code
        sc = r.headers.get('Set-Cookie')
        if sc: s.ck = sc.split(';')[0]
        t = r.read().decode()
        return st, (json.loads(t) if t else {})


def ky(ten, dk, st, du_kien):
    if st != du_kien: loi.append(f'{ten}: được {st}, cần {du_kien} — {dk}')
    else: print(f'  ✓ {ten}')


so = lambda: '09' + ''.join(random.choice('0123456789') for _ in range(8))
CAY = {'members': [{'id': 'u1', 'name': 'Phạm Văn Lễ', 'g': 'm', 'b': 1890, 'd': 1951, 'nm': '12/3', 'nmAl': True, 'spouse': 'u2', 'self': True, 'houseOf': 'u2'},
                   {'id': 'u2', 'name': 'Đinh Thị Tơ', 'g': 'f', 'b': 1894, 'd': 1960, 'spouse': 'u1'},
                   {'id': 'u3', 'name': '<img src=x onerror=alert(1)>', 'g': 'm', 'b': 1922, 'parent': 'u1'}], 'seq': 4}

A, B, C = Nguoi(), Nguoi(), Nguoi()
lhA, lhB, lhC = so(), so(), so()
st, r = A.goi('POST', '/api/dang-ky', {'ten': 'Trưởng họ', 'lien_he': lhA, 'mat_khau': 'matkhau-a-123'}); ky('đăng ký A', r, st, 201)
st, r = B.goi('POST', '/api/dang-ky', {'ten': 'Thành viên B', 'lien_he': lhB, 'mat_khau': 'matkhau-b-123'}); ky('đăng ký B', r, st, 201)
st, r = C.goi('POST', '/api/dang-ky', {'ten': 'Người ngoài C', 'lien_he': lhC, 'mat_khau': 'matkhau-c-123'}); ky('đăng ký C', r, st, 201)
st, r = Nguoi().goi('POST', '/api/dang-ky', {'ten': 'Trùng', 'lien_he': lhA, 'mat_khau': 'matkhau-x-123'}); ky('đăng ký trùng số', r, st, 409)
st, r = Nguoi().goi('POST', '/api/dang-ky', {'ten': 'Ngắn', 'lien_he': so(), 'mat_khau': '123'}); ky('mật khẩu quá ngắn', r, st, 400)

# giả mạo yêu cầu từ trang khác
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, origin='https://trang-xau.example'); ky('chặn Origin lạ', r, st, 403)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, origin=None); ky('chặn thiếu Origin', r, st, 403)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}, ctype='text/plain'); ky('chặn không phải JSON', r, st, 415)

# cây xấu
xau = json.loads(json.dumps(CAY)); xau['members'][2]['parent'] = 'khong-co'
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': xau}); ky('cây trỏ tới người không có', r, st, 400)
xau = json.loads(json.dumps(CAY)); xau['members'][0]['b'] = '1890; DROP TABLE'
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': xau}); ky('cây sai kiểu năm', r, st, 400)
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': {'members': [{'id': 'u%d' % i, 'name': 'x'} for i in range(2001)]}}); ky('cây quá 2.000 người', r, st, 400)

# lập dòng họ
st, r = A.goi('POST', '/api/dong-ho', {'ten': 'Họ Phạm', 'cay': CAY}); ky('A lập dòng họ', r, st, 201); DH = r.get('id')
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); ky('A xem cây', r, st, 200)
m0 = (r.get('cay') or {}).get('members', [{}])[0]
if 'self' in m0 or 'houseOf' in m0: loi.append('máy chủ lưu cả trường riêng của máy (self/houseOf)')
if (r.get('cay') or {}).get('members', [{}, {}, {}])[2].get('name') != CAY['members'][2]['name']: loi.append('tên có ký tự đặc biệt bị đổi')
st, r = C.goi('GET', f'/api/dong-ho/{DH}'); ky('người ngoài không xem được', r, st, 404)
st, r = Nguoi().goi('GET', f'/api/dong-ho/{DH}'); ky('chưa đăng nhập không xem được', r, st, 401)

# mời
st, r = B.goi('POST', '/api/tham-gia', {'ma': 'abcdefghjk'}); ky('mã mời sai', r, st, 404)
st, r = C.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('người ngoài không tạo được mã', r, st, 404)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('A tạo mã mời', r, st, 201); MA = r.get('ma')
st, r = B.goi('POST', '/api/tham-gia', {'ma': (MA or '').upper()}); ky('B vào bằng mã (chữ hoa vẫn được)', r, st, 200)
st, r = B.goi('GET', f'/api/dong-ho/{DH}'); ky('B xem cây', r, st, 200)
if r.get('vai') != 'thanh-vien': loi.append(f'B phải là thanh-vien, đang là {r.get("vai")}')
st, r = B.goi('POST', f'/api/dong-ho/{DH}/loi-moi', {}); ky('thành viên không tạo được mã', r, st, 403)

# thành viên chỉ gửi đề xuất, trưởng họ duyệt
moi = json.loads(json.dumps(CAY)); moi['members'].append({'id': 'u4', 'name': 'Phạm Văn Khiêm', 'g': 'm', 'b': 1951, 'd': 1972, 'ls': True, 'parent': 'u3'}); moi['seq'] = 5
st, r = B.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 1}); ky('thành viên không sửa thẳng', r, st, 403)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat', {'cay': moi, 'phien_ban': 1, 'ghi_chu': 'Thêm chú Khiêm'}); ky('B gửi đề xuất', r, st, 201); DX1 = r.get('id')
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX1}/duyet', {}); ky('B không tự duyệt', r, st, 403)
st, r = A.goi('GET', f'/api/dong-ho/{DH}/de-xuat'); ky('A xem đề xuất chờ', r, st, 200)
if len(r.get('de_xuat', [])) != 1: loi.append('A phải thấy đúng 1 đề xuất chờ')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX1}/duyet', {}); ky('A duyệt', r, st, 200)
st, r = B.goi('GET', f'/api/dong-ho/{DH}')
if r.get('phien_ban') != 2 or len(r.get('cay', {}).get('members', [])) != 4: loi.append('sau duyệt cây phải lên phiên bản 2, có 4 người')

# xung đột: đề xuất làm trên bản cũ
moi2 = json.loads(json.dumps(moi)); moi2['members'][1]['an'] = 'Nghĩa trang làng'
st, r = B.goi('POST', f'/api/dong-ho/{DH}/de-xuat', {'cay': moi2, 'phien_ban': 2}); DX2 = r.get('id')
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 2}); ky('A sửa thẳng', r, st, 200)
st, r = A.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi, 'phien_ban': 2}); ky('sửa trên bản cũ bị chặn', r, st, 409)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/de-xuat/{DX2}/duyet', {}); ky('duyệt đề xuất trên bản cũ bị chặn', r, st, 409)
st, r = B.goi('GET', f'/api/dong-ho/{DH}/de-xuat')
if (r.get('de_xuat') or [{}])[0].get('trang_thai') != 'tu-choi': loi.append('đề xuất trên bản cũ phải chuyển sang tu-choi')

# vai
st, r = B.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': 'x', 'vai': 'truong'}); ky('thành viên không giao vai', r, st, 403)
st, r = A.goi('GET', f'/api/dong-ho/{DH}/thanh-vien'); ky('xem thành viên', r, st, 200)
idB = [t['nguoi_id'] for t in r.get('thanh_vien', []) if t['ten'] == 'Thành viên B'][0]
idA = [t['nguoi_id'] for t in r.get('thanh_vien', []) if t['ten'] == 'Trưởng họ'][0]
if any('lien_he' in t for t in r.get('thanh_vien', [])): loi.append('danh sách thành viên lộ số điện thoại/email')
st, r = A.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idA, 'vai': 'thanh-vien'}); ky('trưởng họ không tự bỏ vai', r, st, 400)
st, r = A.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idB, 'vai': 'duyet'}); ky('A giao B vai duyệt', r, st, 200)
st, r = B.goi('PUT', f'/api/dong-ho/{DH}/cay', {'cay': moi2, 'phien_ban': 3}); ky('B (duyệt) sửa thẳng được', r, st, 200)
st, r = B.goi('POST', f'/api/dong-ho/{DH}/vai', {'nguoi_id': idA, 'vai': 'thanh-vien'}); ky('người duyệt không giao vai', r, st, 403)

# khoá đăng nhập sai
X = Nguoi()
for i in range(8): X.goi('POST', '/api/dang-nhap', {'lien_he': lhC, 'mat_khau': 'sai-mat-khau'})
st, r = X.goi('POST', '/api/dang-nhap', {'lien_he': lhC, 'mat_khau': 'matkhau-c-123'}); ky('khoá sau 8 lần sai, kể cả mật khẩu đúng', r, st, 429)
st, r = Nguoi().goi('POST', '/api/dang-nhap', {'lien_he': lhA, 'mat_khau': 'matkhau-a-123'}); ky('đăng nhập đúng', r, st, 200)

# đăng xuất
st, r = A.goi('POST', '/api/dang-xuat', {}); ky('đăng xuất', r, st, 200)
st, r = A.goi('GET', '/api/toi')
if r.get('nguoi') is not None: loi.append('đăng xuất rồi vẫn còn phiên')
st, r = A.goi('GET', f'/api/dong-ho/{DH}'); ky('sau đăng xuất không xem được', r, st, 401)

for x in loi: print('  ✗', x)
assert not loi, 'KHÔNG ĐẠT'
print('ĐẠT')
