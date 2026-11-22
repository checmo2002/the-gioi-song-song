"""Kiểm tra bảo mật: soi mã tĩnh + thử chèn mã độc (XSS) qua dữ liệu người dùng nhập.
Chạy: python3 -m http.server 8000 & python3 tests/bao-mat.py [url]"""
import re, subprocess, sys, json
from playwright.sync_api import sync_playwright

url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
loi = []

# ---------- 1. Soi mã tĩnh ----------
files = subprocess.run(['git', 'ls-files'], capture_output=True, text=True).stdout.split()
ma = [f for f in files if f.endswith(('.js', '.html')) and not f.startswith('js/thu-vien/')]

BI_MAT = re.compile(r'sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36}|AIza[0-9A-Za-z_-]{35}'
                    r'|-----BEGIN [A-Z ]*PRIVATE KEY|xox[baprs]-[A-Za-z0-9-]{10,}|eyJhbGciOi[A-Za-z0-9_-]{20,}')
for f in files:
    if f.startswith('img/') or f.endswith(('.webp', '.png', '.jpg', '.wav', '.mp3', '.glb')): continue  # img/: mô hình 3D dạng JSON chứa base64, dễ trùng mẫu khoá
    try: s = open(f, encoding='utf-8').read()
    except (UnicodeDecodeError, IsADirectoryError): continue
    for m in BI_MAT.finditer(s): loi.append(f'{f}: có vẻ là khoá bí mật "{m.group()[:12]}…"')

for f in ma:
    s = open(f, encoding='utf-8').read()
    for i, dong in enumerate(s.split('\n'), 1):
        if re.search(r'\beval\s*\(|new Function\s*\(|document\.write\s*\(|setTimeout\s*\(\s*["\']', dong):
            loi.append(f'{f}:{i}: dùng eval/new Function/document.write/setTimeout chuỗi')
        # tải mã từ máy chủ ngoài: phải đưa thư viện vào js/thu-vien/
        if re.search(r'''(import\s*(\(|[^'"]*from)\s*['"]https?:|<script[^>]+src=["']https?:)''', dong):
            loi.append(f'{f}:{i}: tải mã JS từ máy chủ ngoài')
        for m in re.finditer(r'<a\b[^>]*target=["\']_blank["\'][^>]*>', dong):
            if 'noopener' not in m.group(): loi.append(f'{f}:{i}: target=_blank thiếu rel="noopener"')
        # chữ người dùng nhập đi thẳng vào HTML mà không qua esc()
        if 'innerHTML' in dong or 'insertAdjacentHTML' in dong or re.search(r'`[^`]*<', dong):
            for m in re.finditer(r'\$\{\s*(?!esc\()([^{}]*?\b(?:p|q|m|n|u|user|ME\.user)\.(?:name|place|story|letter|cite|note|title|b|d)\b(?!\s*\?)[^{}]*)\}', dong):
                loi.append(f'{f}:{i}: chưa esc() dữ liệu người dùng: ${{{m.group(1)[:50]}}}')

# workflow GitHub: phải giới hạn quyền token, không chạy mã PR lạ với quyền ghi
for f in files:
    if f.startswith('.github/workflows/') and f.endswith(('.yml', '.yaml')):
        s = open(f, encoding='utf-8').read()
        if not re.search(r'^permissions:', s, re.M): loi.append(f'{f}: thiếu khối permissions: ở cấp trên cùng')
        if 'pull_request_target' in s: loi.append(f'{f}: dùng pull_request_target')

# ---------- 2. Thử tấn công XSS ----------
P = '"><img src=x onerror="window.__xss=(window.__xss||0)+1"><svg onload="window.__xss=(window.__xss||0)+1">'
ME = {'user': {'name': 'Nguyễn ' + P, 'place': P, 'phone': '0900000000'},
      'members': [{'id': 'xss0', 'self': True, 'name': 'Nguyễn ' + P, 'b': '1985'},
                  {'id': 'xss1', 'name': 'Nguyễn Văn ' + P, 'b': P, 'd': '1972', 'ls': True, 'g': 'm'},
                  {'id': 'xss2', 'name': P, 'b': '1930', 'd': P, 'g': 'f'},
                  {'id': 'xss3', 'name': 'Còn sống ' + P, 'b': '1990'}],
      'seq': 4, 'balance': 100}
TRANG = ['nguoi-than', 'ho-so', 'ban-do', 'cua-hang', 'ca-nhan', 'ky-uc', 'cong-vien', 'ngoi-nha', 'thiep',
         'thap-nhang', 'hanh-trinh', 'hoi-dap']
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1366, 820), (390, 844)]:
        pg = b.new_page(viewport={'width': w, 'height': h})
        js_loi = []
        pg.on('pageerror', lambda e: js_loi.append(str(e)))
        goc = url.split('/', 3)[0] + '//' + url.split('/')[2]
        pg.route('**/*', lambda r: r.continue_() if r.request.url.startswith(goc) else r.abort())
        pg.add_init_script('try{localStorage.clear();localStorage.setItem("ss-me",' + json.dumps(json.dumps(ME)) + ')}catch(e){}')
        pg.goto(url)
        pg.wait_for_function("!document.getElementById('loader')", timeout=300000)  # chỉ còn 3D: máy kiểm tra vẽ bằng CPU, nạp lâu
        pg.wait_for_timeout(1500)
        for t in TRANG:
            pg.evaluate(f"location.hash='{t}'"); pg.wait_for_timeout(500)
            if t in ('ho-so', 'ban-do'):
                for pid in ('xss1', 'xss2'):
                    pg.evaluate(f"window.ssPerson&&ssPerson.select('{pid}')"); pg.wait_for_timeout(300)
        pg.evaluate("window.ssRitual&&ssRitual.open()"); pg.wait_for_timeout(500)
        n = pg.evaluate("window.__xss||0")
        the = pg.evaluate("document.querySelectorAll('img[src=\"x\"],svg[onload]').length")
        hien = pg.evaluate("document.body.textContent.split('<img src=x onerror').length-1")  # mã độc hiện thành chữ = đã lọc
        print(f'{w}x{h}: mã chạy={n} thẻ lọt={the} số chỗ hiện thành chữ={hien} lỗi JS={len(js_loi)}')
        if n or the: loi.append(f'{w}px: mã độc trong tên người dùng đã chạy ({n} lần, {the} thẻ lọt)')
        if not hien: loi.append(f'{w}px: không thấy tên người thân thử nghiệm, bài thử không chạm tới dữ liệu')
        loi += [f'{w}px lỗi JS: {e[:150]}' for e in js_loi]
    b.close()

for x in loi: print('  ✗', x)
assert not loi, 'KHÔNG ĐẠT'
print('ĐẠT')
