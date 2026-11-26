// Nhận báo lỗi và tốc độ tải từ js/00-theo-doi.js, lưu vào D1 (bảng theo_doi, docs/theo-doi.md). Không dùng dịch vụ ngoài.
// Route cụ thể này được Cloudflare Pages ưu tiên hơn functions/api/[[duong]].js. Không lưu IP: chỉ giữ HMAC theo ngày để giới hạn tần suất.
const NGAY = 864e5, TOI_DA = 30, GIU = 30 * NGAY, MAX = 4096, enc = new TextEncoder();

const xong = (st, h = {}) => new Response(null, { status: st, headers: { 'Cache-Control': 'no-store', ...h } });
const LA = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g;   // ký tự điều khiển, đảo chiều chữ (giữ xuống dòng của stack)
const chu = n => v => typeof v === 'string' ? v.replace(LA, '').slice(0, n) : undefined;
const so = v => Number.isFinite(v) ? Math.min(Math.max(Math.round(v), -1), 1e7) : undefined;   // mili giây hoặc số dòng
// danh sách trắng: trường lạ bỏ, sai kiểu bỏ, chữ dài thì cắt
const TRUONG = {
  loi: { m: chu(300), f: chu(200), d: so, c: so, s: chu(600), trang: chu(60) },
  'toc-do': { ttfb: so, dom: so, tai: so, lcp: so, d3: so, mang: chu(8) },
};

// đọc thân yêu cầu, dừng ngay khi quá MAX byte (kể cả khi gửi không kèm Content-Length)
async function doc(req) {
  if (!req.body) return '';
  const r = req.body.getReader(), p = []; let n = 0;
  for (;;) { const { done, value } = await r.read(); if (done) break; n += value.length; if (n > MAX) { r.cancel().catch(() => { }); return null } p.push(value) }
  return new Blob(p).text();
}

export async function onRequest({ request: req, env, waitUntil }) {
  if (req.method !== 'POST') return xong(405, { Allow: 'POST' });
  let cung = false; try { cung = new URL(req.headers.get('Origin') || '').host === new URL(req.url).host } catch { }
  if (!cung) return xong(403);
  if (!(req.headers.get('Content-Type') || '').startsWith('application/json')) return xong(415);
  if (+(req.headers.get('Content-Length') || 0) > MAX) return xong(413);
  if (!env.DB || !env.TK_KHOA) return xong(204);
  try {
    const t = await doc(req); if (t === null) return xong(413);
    let o; try { o = JSON.parse(t) } catch { return xong(400) }
    const ds = o && typeof o === 'object' && Object.hasOwn(TRUONG, o.t) && TRUONG[o.t];
    if (!ds) return xong(400);
    const du = {};
    for (const k in ds) { const v = ds[k](o[k]); if (v !== undefined) du[k] = v }
    if (o.may === 'dt' || o.may === 'mt') du.may = o.may;
    const now = Date.now(), ngay = new Date(now).toISOString().slice(0, 10);
    const k = await crypto.subtle.importKey('raw', enc.encode(env.TK_KHOA), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', k, enc.encode('td:' + ngay + ':' + (req.headers.get('CF-Connecting-IP') || '')));
    const may = [...new Uint8Array(sig, 0, 8)].map(x => x.toString(16).padStart(2, '0')).join('');
    // may đổi mỗi ngày nên đếm theo may là đếm trong ngày; một câu lệnh để hai yêu cầu cùng lúc không cùng lọt qua
    await env.DB.prepare('INSERT INTO theo_doi (luc, loai, may, du_lieu) SELECT ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM theo_doi WHERE may = ?) < ?')
      .bind(now, o.t, may, JSON.stringify(du), may, TOI_DA).run();
    if (Math.random() < 0.01) waitUntil(env.DB.prepare('DELETE FROM theo_doi WHERE luc < ?').bind(now - GIU).run().catch(() => { }));
    return xong(204);
  } catch (e) {
    console.error(e);
    return xong(500);
  }
}
