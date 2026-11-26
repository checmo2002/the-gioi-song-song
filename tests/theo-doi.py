"""Kiểm máy chủ theo dõi lỗi và tốc độ (functions/api/bao-loi.js, docs/theo-doi.md): Origin lạ, kiểu nội dung, thân quá lớn,
trường lạ, giới hạn 30 bản ghi mỗi máy mỗi ngày (IPv6 theo dải /64), trần chung 2000 bản ghi mỗi ngày, chuỗi <script> lưu dạng chữ thuần,
không lưu IP; js/00-theo-doi.js chạy thật trong Chromium: che chữ trong ngoặc, Promise không phải Error chỉ gửi kiểu dữ liệu.
Máy chủ thử dựng theo docs/gia-pha-dong-ho.md mục "Chạy thử ở máy" (cần TK_KHOA trong .dev.vars, đã áp migrations).
Bài thử đọc thẳng tệp D1 cục bộ (sqlite) trong thư mục wrangler đó.
Chạy: python3 tests/theo-doi.py [http://localhost:8788] [thư mục wrangler]"""
import datetime, glob, json, os, sqlite3, sys, urllib.request, urllib.error, uuid
from playwright.sync_api import sync_playwright

GOC = (sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8788').rstrip('/')
TM = sys.argv[2] if len(sys.argv) > 2 else '.'
db = [f for f in glob.glob(os.path.join(TM, '.wrangler/state/v3/d1/*/*.sqlite')) if 'metadata' not in f]
if not db: sys.exit('Không thấy tệp D1 cục bộ trong ' + TM)
loi = []


def gui(body, origin=GOC, ctype='application/json', method='POST', ip=None):
    h = {'Content-Type': ctype}
    if origin: h['Origin'] = origin
    if ip: h['CF-Connecting-IP'] = ip
    data = body if isinstance(body, bytes) else (None if body is None else json.dumps(body, ensure_ascii=False).encode())
    try: return urllib.request.urlopen(urllib.request.Request(GOC + '/api/bao-loi', method=method, headers=h, data=data)).status
    except urllib.error.HTTPError as e: return e.code


def hang(dau):   # các bản ghi có m bắt đầu bằng dau
    con = sqlite3.connect(db[0])
    try: return con.execute("SELECT loai, may, du_lieu FROM theo_doi WHERE json_extract(du_lieu, '$.m') LIKE ? || '%'", (dau,)).fetchall()
    finally: con.close()


def ky(ten, dk, them=''):
    print(('ĐẠT  ' if dk else 'LỖI  ') + ten + (' ' + str(them) if them and not dk else ''))
    if not dk: loi.append(ten)


ma = uuid.uuid4().hex[:8]   # mỗi lần chạy một mã riêng, để không lẫn bản ghi cũ
ip = lambda n: f'10.{n}.{int(ma[:2], 16)}.{int(ma[2:4], 16)}'

ky('GET bị từ chối (405)', gui(None, method='GET') == 405)
ky('Origin lạ bị chặn (403)', gui({'t': 'loi', 'm': ma + 'la'}, origin='https://trang-la.example') == 403 and not hang(ma + 'la'))
ky('thiếu Origin bị chặn (403)', gui({'t': 'loi', 'm': ma + 'ko'}, origin=None) == 403 and not hang(ma + 'ko'))
ky('Content-Type không phải JSON bị chặn (415)', gui({'t': 'loi', 'm': ma + 'ct'}, ctype='text/plain') == 415 and not hang(ma + 'ct'))
ky('thân quá 4 KB bị từ chối (413)', gui({'t': 'loi', 'm': ma + 'to', 's': 'x' * 5000}) == 413 and not hang(ma + 'to'))
ky('JSON hỏng bị từ chối (400)', gui(b'{"t":"loi",') == 400)
ky('loại lạ bị từ chối (400)', gui({'t': 'khac', 'm': ma}) == 400)

st = gui({'t': 'loi', 'm': ma + 'tr', 'f': '/js/a.js', 'd': 3, 'c': 'bốn', 's': 12, 'trang': '/#dai-sanh', 'may': 'dt',
          'ten': 'Nguyễn Văn A', 'tk': 'g123', '__proto__': {'x': 1}, 'ttfb': 5}, ip=ip(1))
h = hang(ma + 'tr')
d = json.loads(h[0][2]) if h else {}
ky('báo lỗi hợp lệ được lưu (204)', st == 204 and len(h) == 1 and h[0][0] == 'loi', (st, h))
ky('trường lạ và trường sai kiểu bị bỏ', set(d) == {'m', 'f', 'd', 'trang', 'may'} and d['d'] == 3 and d['may'] == 'dt', d)
ky('không lưu IP', h and ip(1) not in h[0][1] + h[0][2] and len(h[0][1]) == 16, h)

gui({'t': 'loi', 'm': ma + 'dai' + 'y' * 400, 'may': 'may-la'}, ip=ip(2))
h = hang(ma + 'dai'); d = json.loads(h[0][2]) if h else {}
ky('chữ dài bị cắt, may lạ bị bỏ', len(d.get('m', '')) == 300 and 'may' not in d, d)

XSS = '<script>alert(1)</script><img src=x onerror=alert(2)>'
gui({'t': 'loi', 'm': ma + 'xs' + XSS, 's': XSS}, ip=ip(3))
h = hang(ma + 'xs'); d = json.loads(h[0][2]) if h else {}
ky('chuỗi <script> lưu nguyên dạng chữ thuần', d.get('m') == ma + 'xs' + XSS and d.get('s') == XSS and '<script>' in h[0][2], h)

dom = int(ma[:5], 16) + 1
st = gui({'t': 'toc-do', 'ttfb': 120.4, 'dom': dom, 'tai': 1500, 'lcp': 1100, 'd3': -1, 'mang': '4g', 'may': 'mt', 'm': ma + 'td'}, ip=ip(4))
con = sqlite3.connect(db[0]); h = con.execute("SELECT loai, du_lieu FROM theo_doi WHERE json_extract(du_lieu, '$.dom') = ?", (dom,)).fetchall(); con.close()
d = json.loads(h[0][1]) if h else {}
ky('tốc độ hợp lệ được lưu, bỏ trường của loại khác', st == 204 and len(h) == 1 and h[0][0] == 'toc-do'
   and d == {'ttfb': 120, 'dom': dom, 'tai': 1500, 'lcp': 1100, 'd3': -1, 'mang': '4g', 'may': 'mt'}, (st, h))

for i in range(35): gui({'t': 'loi', 'm': f'{ma}gh{i:02d}'}, ip=ip(5))
h = hang(ma + 'gh')
ky('một máy quá 30 bản ghi trong ngày thì ngừng lưu', len(h) == 30 and len({x[1] for x in h}) == 1, len(h))
ky('máy khác vẫn lưu được', gui({'t': 'loi', 'm': ma + 'kh'}, ip=ip(6)) == 204 and len(hang(ma + 'kh')) == 1)

v6 = f'2001:db8:{ma[:4]}:{ma[4:]}::'
for i in range(35): gui({'t': 'loi', 'm': f'{ma}v6{i:02d}'}, ip=v6 + format(i + 1, 'x'))
h = hang(ma + 'v6')
ky('IPv6 cùng dải /64 tính chung một máy (tối đa 30)', len(h) == 30 and len({x[1] for x in h}) == 1, len(h))
ky('IPv6 dải /64 khác là máy khác', gui({'t': 'loi', 'm': ma + 'w6'}, ip=f'2001:db8:{ma[:4]}:{int(ma[4:], 16) ^ 1:x}::1') == 204 and len(hang(ma + 'w6')) == 1)

# trần chung: đặt bộ đếm hôm nay (UTC, như máy chủ) thành 1999, gửi hai bản từ hai máy khác nhau, rồi trả bộ đếm về
ngay = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
con = sqlite3.connect(db[0]); cu = (con.execute('SELECT n FROM theo_doi_ngay WHERE ngay = ?', (ngay,)).fetchone() or [0])[0]
that = con.execute('SELECT COUNT(*) FROM theo_doi WHERE luc >= ?', (int(datetime.datetime.strptime(ngay, '%Y-%m-%d').replace(tzinfo=datetime.timezone.utc).timestamp() * 1000),)).fetchone()[0]
ky('bảng theo_doi_ngay đếm đúng số bản ghi trong ngày', cu == that, (cu, that))
con.execute('UPDATE theo_doi_ngay SET n = 1999 WHERE ngay = ?', (ngay,)); con.commit(); con.close()
try:
    a, b = gui({'t': 'loi', 'm': ma + 'cg1'}, ip=ip(7)), gui({'t': 'loi', 'm': ma + 'cg2'}, ip=ip(8))
    con = sqlite3.connect(db[0]); n = con.execute('SELECT n FROM theo_doi_ngay WHERE ngay = ?', (ngay,)).fetchone()[0]; con.close()
    ky('cả bảng quá 2000 bản ghi trong ngày thì ngừng lưu', a == b == 204 and len(hang(ma + 'cg1')) == 1 and not hang(ma + 'cg2') and n == 2000, (a, b, n))
finally:
    con = sqlite3.connect(db[0]); con.execute('UPDATE theo_doi_ngay SET n = ? WHERE ngay = ?', (cu + 1, ngay)); con.commit(); con.close()

# js/00-theo-doi.js thật trong Chromium, trên một trang trắng cùng địa chỉ máy thử (bỏ điều kiện https vì máy thử dùng http)
src = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'js', '00-theo-doi.js'), encoding='utf-8').read()
assert "location.protocol!=='https:'||" in src
src = src.replace("location.protocol!=='https:'||", '')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    pg.route(GOC + '/thu-theo-doi', lambda r: r.fulfill(status=200, content_type='text/html', body='<!doctype html><title>thử</title>'))
    pg.route(GOC + '/api/bao-loi', lambda r: r.continue_(headers={**r.request.headers, 'cf-connecting-ip': ip(9)}))   # máy riêng cho lần chạy này
    pg.add_init_script(src)
    pg.goto(GOC + '/thu-theo-doi')
    pg.evaluate(r'''m => { setTimeout(() => { throw new Error(m + 'f1 «Trần Thị Hoa» \'Liệt sĩ Trần Văn Bình\' "Nguyễn Văn An" (reading \'x\')') });
      Promise.reject(m + 'f2 Nguyễn Văn An'); Promise.reject({ ten: 'Nguyễn Văn An' }); Promise.reject(new Error(m + 'f3 "Nguyễn"')) }''', ma)
    pg.wait_for_timeout(3000); b.close()   # không dùng time.sleep: chặn luôn việc xử lý route
h = hang('Uncaught Error: ' + ma + 'f1')
con = sqlite3.connect(db[0]); ds = [json.loads(x[0]) for x in con.execute('SELECT du_lieu FROM theo_doi WHERE may = ? ORDER BY id', (h[0][1] if h else '',))]; con.close()
m = [d.get('m') for d in ds]
ky('trình duyệt gửi được lỗi về máy chủ', len(ds) == 4, m)
ky('chữ trong ngoặc "…" \'…\' «…» bị che', 'Uncaught Error: ' + ma + 'f1 «…» \'…\' "…" (reading \'x\')' in m and 'Promise: ' + ma + 'f3 "…"' in m, m)
ky('Promise không phải Error chỉ gửi kiểu dữ liệu', 'Promise: string' in m and 'Promise: object' in m and 'Nguyễn' not in json.dumps(ds, ensure_ascii=False), ds)

print('\nKẾT QUẢ:', 'ĐẠT' if not loi else f'LỖI ({len(loi)})')
sys.exit(1 if loi else 0)
