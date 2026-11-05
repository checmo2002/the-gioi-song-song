"""Đóng gói bản thử để đăng thành artifact trên claude.ai (miễn phí, riêng tư, mở được trên điện thoại).
Artifact tự bọc trang trong <!doctype><html><head>…<body>, nên ở đây bỏ phần vỏ đó và đưa
meta/title/link lên đầu nội dung. Kết quả: dist/ban-thu/index.html; css/js/data/img dùng nguyên từ repo.
Chạy: python3 tools/ban-thu.py"""
import os, re
goc = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
s = open(os.path.join(goc, 'index.html'), encoding='utf-8').read()
m = re.search(r'<head>(.*?)</head>\s*<body>(.*)</body>', s, re.S)
assert m, 'index.html không có <head>/<body> như mong đợi'
dau = re.sub(r'<title>.*?</title>', '<title>Song Song bản thử</title>', m.group(1))  # tách tên khỏi bản gốc trong danh sách artifact
dau = re.sub(r'<meta charset[^>]*>|<meta name=viewport[^>]*>', '', dau).strip()
ra = os.path.join(goc, 'dist', 'ban-thu')
os.makedirs(ra, exist_ok=True)
lang = '<script>document.documentElement.lang="vi"</script>'  # vỏ của artifact không có lang="vi": trình đọc màn hình sẽ đọc sai giọng
open(os.path.join(ra, 'index.html'), 'w', encoding='utf-8').write(lang + '\n' + dau + '\n' + m.group(2).strip() + '\n')
print('đã ghi', os.path.join(ra, 'index.html'))
