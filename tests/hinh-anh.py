"""Kiểm tra hình ảnh: chụp các màn chính rồi so với ảnh chuẩn trong tests/anh-chuan/.
Chạy:            python3 tests/hinh-anh.py [url]
Cập nhật chuẩn:  python3 tests/hinh-anh.py [url] --cap-nhat   (chỉ khi thay đổi giao diện đã được duyệt)
Ảnh lệch được lưu ở tests/ket-qua/ (ảnh mới + ảnh tô đỏ chỗ khác)."""
import sys, os
from playwright.sync_api import sync_playwright
from PIL import Image, ImageChops

args = [a for a in sys.argv[1:] if not a.startswith('--')]
url = args[0] if args else 'http://localhost:8000/'
CAP_NHAT = '--cap-nhat' in sys.argv
HERE = os.path.dirname(os.path.abspath(__file__))
CHUAN, KQ = os.path.join(HERE, 'anh-chuan'), os.path.join(HERE, 'ket-qua')
NGUONG = 0.005  # tối đa 0,5% điểm ảnh được lệch (khử răng cưa, chữ)
CHO_PHEP = ('fonts.googleapis.com', 'fonts.gstatic.com')  # font thật để mọi máy vẽ giống nhau
GIO = '2026-11-04T09:00:00+07:00'  # đóng băng đồng hồ: ánh sáng ban ngày, lịch âm cố định
# (tên, cỡ màn hình, cách tới màn đó)
MAN = [('cong', 'chọn lối'), ('the-gioi', 'sau khi chọn Phật giáo'),
       ('nguoi-than', '#nguoi-than'), ('ho-so', '#ho-so'), ('cua-hang', '#cua-hang'), ('ca-nhan', '#ca-nhan')]
CO = [(1366, 820), (390, 844)]

def so(a, b):
    a, b = a.convert('RGB'), b.convert('RGB')
    if a.size != b.size: return 1.0, None
    d = ImageChops.difference(a, b).convert('L').point(lambda p: 255 if p > 32 else 0)
    return d.histogram()[255] / (a.size[0] * a.size[1]), d

def chup_khi_dung_yen(pg, duong_dan):
    """Chụp lại tới khi hai ảnh liền nhau gần như giống hệt (camera đã dừng trượt)."""
    import io
    truoc = Image.open(io.BytesIO(pg.screenshot()))
    for _ in range(30):
        pg.wait_for_timeout(500)
        sau = Image.open(io.BytesIO(pg.screenshot()))
        if so(truoc, sau)[0] < 0.0005: break
        truoc = sau
    sau.save(duong_dan)

loi = []
os.makedirs(KQ, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in CO:
        pg = b.new_page(viewport={'width': w, 'height': h}, reduced_motion='reduce',
                        timezone_id='Asia/Ho_Chi_Minh', locale='vi-VN')  # máy nào cũng như ở Việt Nam
        js_loi = []
        pg.on('pageerror', lambda e: js_loi.append(str(e)))
        goc = url.split('/')[2]
        pg.route('**/*', lambda r: r.continue_() if goc in r.request.url or any(c in r.request.url for c in CHO_PHEP) else r.abort())
        pg.add_init_script("Math.random=(()=>{let s=7;return()=>(s=(s*9301+49297)%233280)/233280})();"
                           "try{localStorage.clear()}catch(e){}")
        pg.clock.set_fixed_time(GIO)   # chỉ đóng băng giờ hiển thị, hẹn giờ và hoạt ảnh vẫn chạy
        pg.goto(url)
        pg.wait_for_function("!document.getElementById('loader')", timeout=300000)  # qua màn chờ (chỉ còn 3D: máy kiểm tra vẽ bằng CPU, nạp lâu)
        pg.wait_for_timeout(1500)
        pg.evaluate('document.fonts.ready')
        for ten, cach in MAN:
            if ten == 'the-gioi':
                pg.click('.sanh-tip [data-sp="g-phat"]')  # đúng nút người dùng bấm
                # nhân vật đi tới cổng rồi phi thăng sang cảnh khác
                pg.wait_for_function("(document.getElementById('hall').dataset.ws||'sanh')!=='sanh'", timeout=180000)
                pg.wait_for_timeout(2500)
            elif cach.startswith('#'):
                # trang mục mở đè lên thế giới; ẩn thế giới để chụp riêng trang
                pg.evaluate(f"location.hash='{cach[1:]}'"); pg.wait_for_timeout(1200)
                pg.evaluate("['gate','hall','world'].forEach(i=>{const e=document.getElementById(i);if(e)e.hidden=true});document.documentElement.classList.remove('hall-on');scrollTo(0,0)")  # như ssHall.close() khi bấm sang trang
                pg.wait_for_timeout(600)
            pg.wait_for_timeout(300)        # cho ảnh nền tải xong
            pg.evaluate("Promise.all([...document.images].map(i=>i.complete||new Promise(r=>{i.onload=i.onerror=r})))")
            f = f'{ten}-{w}.png'
            moi = os.path.join(KQ, f)
            chup_khi_dung_yen(pg, moi)
            chuan = os.path.join(CHUAN, f)
            if CAP_NHAT or not os.path.exists(chuan):
                os.replace(moi, chuan); print('cập nhật', f); continue
            ti_le, d = so(Image.open(chuan), Image.open(moi))
            if ti_le > NGUONG:
                loi.append(f'{f}: lệch {ti_le:.2%}')
                if d: Image.composite(Image.new('RGB', d.size, 'red'), Image.open(moi).convert('RGB'), d).save(os.path.join(KQ, 'lech-' + f))
            else:
                os.remove(moi)
            print(f'{f}: lệch {ti_le:.3%}')
        if js_loi: loi.append(f'{w}px lỗi JS: {js_loi[:3]}')
        pg.close()
    b.close()
for l in loi: print('  ✗', l)
print('KHÔNG ĐẠT' if loi else 'ĐẠT')
sys.exit(1 if loi else 0)
