"""Kiểm tra nhanh: trang mở được, không lỗi JS, các khu chính có mặt.
Chạy: python3 -m http.server 8000 & python3 tests/smoke.py [url]"""
import sys
from playwright.sync_api import sync_playwright
url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
shot = sys.argv[2] if len(sys.argv) > 2 else None
KEYS = ['#gate', '#hall', '#ho-so', '#cua-hang', '#ky-uc', '#ca-nhan']
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in [(1366, 820), (390, 844)]:
        pg = b.new_page(viewport={'width': w, 'height': h})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and 'net::' not in m.text and errs.append(m.text))
        # mạng ngoài không bắt buộc cho kiểm tra
        pg.route('**/*', lambda r: r.abort() if not r.request.url.startswith(url.split('/', 3)[0] + '//' + url.split('/')[2]) else r.continue_())
        pg.goto(url)
        pg.wait_for_timeout(4000)
        missing = [k for k in KEYS if not pg.query_selector(k)]
        if shot: pg.screenshot(path=f'{shot}-{w}.png')
        print(f'{w}x{h}: lỗi={len(errs)} thiếu={missing}')
        for e in errs[:5]: print('  ', e[:200])
        assert not errs and not missing, 'KHÔNG ĐẠT'
    b.close()
print('ĐẠT')
