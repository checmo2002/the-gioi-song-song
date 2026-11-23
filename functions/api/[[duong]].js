// Máy chủ gia phả dòng họ: Cloudflare Pages Functions + D1 (binding DB). Thiết kế: docs/gia-pha-dong-ho.md
const NGAY = 864e5, PHIEN_HAN = 30 * NGAY, MOI_HAN = 14 * NGAY, KHOA_LAN = 8, KHOA_THOI = 15 * 6e4;
const enc = new TextEncoder();

const json = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...h } });
const loi = (st, chu) => json({ loi: chu }, st);
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const sha = async s => b64(await crypto.subtle.digest('SHA-256', enc.encode(s)));
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, '0')).join('');
// mã đọc được (bỏ 0/o, 1/l/i), lấy mẫu loại bỏ để không lệch xác suất
function ma(n) { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; while (s.length < n) for (const x of crypto.getRandomValues(new Uint8Array(n))) if (x < 248 && s.length < n) s += A[x % 31]; return s }
async function bamMk(mk, muoi) {
  const k = await crypto.subtle.importKey('raw', enc.encode(mk), 'PBKDF2', false, ['deriveBits']);
  return b64(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(muoi), iterations: 100000 }, k, 256));
}
function bang(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0 }

// ---------- kiểm dữ liệu tại ranh giới tin cậy ----------
const chu = (v, max, can) => { if (v == null || v === '') { if (can) throw 0; return null } if (typeof v !== 'string') throw 0; v = v.trim(); if (!v && can) throw 0; if (v.length > max) throw 0; return v || null };
const so = (v, a, b) => { if (v == null || v === '') return null; if (!Number.isInteger(v) || v < a || v > b) throw 0; return v };
const co = v => v === true;
const ID = /^[A-Za-z0-9_-]{1,24}$/, NGAY_THANG = /^([1-9]|[12]\d|3[01])\/([1-9]|1[0-2])$/;
// Gia phả: chỉ giữ trường đã biết (docs/tinh-nang.md, phần 07-12); bỏ self, houseOf… là đồ riêng của từng máy
export function kiemCay(c) {
  if (!c || typeof c !== 'object' || !Array.isArray(c.members) || c.members.length > 2000) throw 0;
  const ids = new Set(), ms = c.members.map(m => {
    if (!m || typeof m !== 'object' || typeof m.id !== 'string' || !ID.test(m.id) || ids.has(m.id)) throw 0; ids.add(m.id);
    const nm = chu(m.nm, 5), ns = chu(m.ns, 5); if ((nm && !NGAY_THANG.test(nm)) || (ns && !NGAY_THANG.test(ns))) throw 0;
    if (m.sp2 != null && (!Array.isArray(m.sp2) || m.sp2.length > 10)) throw 0;
    return { id: m.id, name: chu(m.name, 60, true), g: m.g === 'f' ? 'f' : 'm', b: so(m.b, 1000, 2100), d: so(m.d, 1000, 2100), ls: co(m.ls),
      parent: chu(m.parent, 24), mother: chu(m.mother, 24), spouse: chu(m.spouse, 24), sp2: (m.sp2 || []).map(x => chu(x, 24, true)),
      ns, nm, nmAl: co(m.nmAl), huy: chu(m.huy, 40), tu: chu(m.tu, 40), thuy: chu(m.thuy, 60), chi: chu(m.chi, 40),
      thu: so(m.thu, 1, 30), nuoi: co(m.nuoi), an: chu(m.an, 120), tk: chu(m.tk, 24) };
  });
  for (const m of ms) for (const r of [m.parent, m.mother, m.spouse, ...m.sp2]) if (r != null && !ids.has(r)) throw 0;
  const out = { members: ms, seq: so(c.seq, 1, 1e7) || ms.length + 1 };
  if (JSON.stringify(out).length > 1e6) throw 0;
  return out;
}
// số điện thoại: bỏ dấu cách, chấm, gạch; email: chỉ đổi chữ thường
const lienHe = v => { v = String(v || '').trim().toLowerCase(); if (!v.includes('@')) v = v.replace(/[\s.-]/g, ''); return /^\+?\d{9,12}$/.test(v) || /^[^@\s]{1,64}@[^@\s]{1,190}\.[a-z]{2,}$/.test(v) ? v : null };

// ---------- phiên đăng nhập ----------
const cookie = (tok, han) => `ss_phien=${tok}; HttpOnly; Secure; SameSite=Lax; Path=/api; Max-Age=${han}`;
async function ai(env, req) {
  const m = /(?:^|;\s*)ss_phien=([0-9a-f]{64})/.exec(req.headers.get('Cookie') || ''); if (!m) return null;
  return env.DB.prepare('SELECT n.id, n.ten FROM phien p JOIN nguoi_dung n ON n.id = p.nguoi_id WHERE p.ma_bam = ? AND p.het > ?').bind(await sha(m[1]), Date.now()).first();
}
async function moPhien(env, id) { const t = hex(32); await env.DB.prepare('INSERT INTO phien (ma_bam, nguoi_id, het) VALUES (?, ?, ?)').bind(await sha(t), id, Date.now() + PHIEN_HAN).run(); return cookie(t, PHIEN_HAN / 1000) }
const vaiCua = (env, dh, nguoi) => env.DB.prepare('SELECT vai FROM thanh_vien WHERE dong_ho_id = ? AND nguoi_id = ?').bind(dh, nguoi).first('vai');

// ---------- các lệnh ----------
async function dangKy(env, b) {
  const ten = (() => { try { return chu(b.ten, 60, true) } catch { return null } })(), lh = lienHe(b.lien_he), mk = b.mat_khau;
  if (!ten) return loi(400, 'Hãy nhập họ và tên.'); if (!lh) return loi(400, 'Số điện thoại hoặc email chưa đúng.');
  if (typeof mk !== 'string' || mk.length < 8 || mk.length > 128) return loi(400, 'Mật khẩu cần từ 8 ký tự.');
  if (await env.DB.prepare('SELECT 1 FROM nguoi_dung WHERE lien_he = ?').bind(lh).first()) return loi(409, 'Số điện thoại hoặc email này đã có tài khoản. Hãy đăng nhập.');
  const id = ma(12), muoi = hex(16);
  await env.DB.prepare('INSERT INTO nguoi_dung (id, ten, lien_he, mk_bam, mk_muoi, tao) VALUES (?, ?, ?, ?, ?, ?)').bind(id, ten, lh, await bamMk(mk, muoi), muoi, Date.now()).run();
  return json({ nguoi: { id, ten } }, 201, { 'Set-Cookie': await moPhien(env, id) });
}
async function dangNhap(env, b) {
  const lh = lienHe(b.lien_he), mk = typeof b.mat_khau === 'string' ? b.mat_khau.slice(0, 128) : '', now = Date.now();
  if (!lh) return loi(400, 'Số điện thoại hoặc email chưa đúng.');
  const sai = await env.DB.prepare('SELECT lan, tu FROM dang_nhap_sai WHERE lien_he = ?').bind(lh).first();
  if (sai && sai.lan >= KHOA_LAN && now - sai.tu < KHOA_THOI) return loi(429, 'Nhập sai quá nhiều lần. Hãy thử lại sau 15 phút.');
  const n = await env.DB.prepare('SELECT id, ten, mk_bam, mk_muoi FROM nguoi_dung WHERE lien_he = ?').bind(lh).first();
  const bam = await bamMk(mk, n ? n.mk_muoi : 'khong-co-tai-khoan');   // vẫn băm khi không có tài khoản: thời gian trả lời như nhau
  if (!n || !bang(bam, n.mk_bam)) {
    const moi = !sai || now - sai.tu >= KHOA_THOI;
    await env.DB.prepare('INSERT INTO dang_nhap_sai (lien_he, lan, tu) VALUES (?, 1, ?) ON CONFLICT(lien_he) DO UPDATE SET lan = ?, tu = ?').bind(lh, now, moi ? 1 : sai.lan + 1, moi ? now : sai.tu).run();
    return loi(401, 'Sai số điện thoại/email hoặc mật khẩu.');
  }
  await env.DB.batch([env.DB.prepare('DELETE FROM dang_nhap_sai WHERE lien_he = ?').bind(lh), env.DB.prepare('DELETE FROM phien WHERE het < ?').bind(now)]);
  return json({ nguoi: { id: n.id, ten: n.ten } }, 200, { 'Set-Cookie': await moPhien(env, n.id) });
}
async function dangXuat(env, req) {
  const m = /(?:^|;\s*)ss_phien=([0-9a-f]{64})/.exec(req.headers.get('Cookie') || '');
  if (m) await env.DB.prepare('DELETE FROM phien WHERE ma_bam = ?').bind(await sha(m[1])).run();
  return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
}
async function dongHoCua(env, id) { const r = await env.DB.prepare('SELECT id, ten, cay, phien_ban FROM dong_ho WHERE id = ?').bind(id).first(); if (r) r.cay = JSON.parse(r.cay); return r }

async function xuLy(env, req, duong, toi) {
  const [a, id, b, dx, c] = duong, M = req.method;
  let body = {};
  if (M !== 'GET') { const t = await req.text(); if (t.length > 1.2e6) return loi(413, 'Dữ liệu quá lớn.'); try { body = t ? JSON.parse(t) : {} } catch { return loi(400, 'Dữ liệu không đọc được.') } if (!body || typeof body !== 'object') return loi(400, 'Dữ liệu không đọc được.') }

  if (a === 'dang-ky' && M === 'POST') return dangKy(env, body);
  if (a === 'dang-nhap' && M === 'POST') return dangNhap(env, body);
  if (a === 'dang-xuat' && M === 'POST') return dangXuat(env, req);
  if (a === 'toi' && M === 'GET') {
    if (!toi) return json({ nguoi: null });
    const { results } = await env.DB.prepare('SELECT d.id, d.ten, t.vai FROM thanh_vien t JOIN dong_ho d ON d.id = t.dong_ho_id WHERE t.nguoi_id = ? ORDER BY t.vao').bind(toi.id).all();
    return json({ nguoi: toi, dong_ho: results });
  }
  if (!toi) return loi(401, 'Hãy đăng nhập.');

  if (a === 'tham-gia' && M === 'POST') {
    const m = String(body.ma || '').trim().toLowerCase(); if (!/^[a-z0-9]{10}$/.test(m)) return loi(400, 'Mã mời gồm 10 ký tự.');
    const r = await env.DB.prepare('SELECT l.dong_ho_id, d.ten FROM loi_moi l JOIN dong_ho d ON d.id = l.dong_ho_id WHERE l.ma_bam = ? AND l.het > ?').bind(await sha(m), Date.now()).first();
    if (!r) return loi(404, 'Mã mời không đúng hoặc đã hết hạn.');
    await env.DB.prepare("INSERT OR IGNORE INTO thanh_vien (dong_ho_id, nguoi_id, vai, vao) VALUES (?, ?, 'thanh-vien', ?)").bind(r.dong_ho_id, toi.id, Date.now()).run();
    return json({ dong_ho: { id: r.dong_ho_id, ten: r.ten } });
  }
  if (a !== 'dong-ho') return loi(404, 'Không có lệnh này.');

  if (!id && M === 'POST') {
    let ten, cay; try { ten = chu(body.ten, 60, true); cay = kiemCay(body.cay) } catch { return loi(400, 'Tên dòng họ hoặc gia phả chưa hợp lệ.') }
    const dem = await env.DB.prepare("SELECT COUNT(*) n FROM thanh_vien WHERE nguoi_id = ? AND vai = 'truong'").bind(toi.id).first('n');
    if (dem >= 10) return loi(400, 'Mỗi tài khoản lập tối đa 10 dòng họ.');
    const dh = ma(12), now = Date.now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO dong_ho (id, ten, tao_boi, tao, cay) VALUES (?, ?, ?, ?, ?)').bind(dh, ten, toi.id, now, JSON.stringify(cay)),
      env.DB.prepare("INSERT INTO thanh_vien (dong_ho_id, nguoi_id, vai, vao) VALUES (?, ?, 'truong', ?)").bind(dh, toi.id, now)]);
    return json({ id: dh, ten, phien_ban: 1, vai: 'truong' }, 201);
  }
  const vai = id && await vaiCua(env, id, toi.id);
  if (!vai) return loi(404, 'Không thấy dòng họ này, hoặc bạn chưa là thành viên.');   // không tiết lộ dòng họ có tồn tại hay không
  const duyet = vai === 'truong' || vai === 'duyet';

  if (!b && M === 'GET') { const d = await dongHoCua(env, id); return json({ ...d, vai }) }
  if (b === 'cay' && M === 'PUT') {
    if (!duyet) return loi(403, 'Chỉ trưởng họ hoặc người được giao duyệt mới sửa thẳng. Hãy gửi đề xuất.');
    let cay; try { cay = kiemCay(body.cay) } catch { return loi(400, 'Gia phả chưa hợp lệ.') }
    const r = await env.DB.prepare('UPDATE dong_ho SET cay = ?, phien_ban = phien_ban + 1 WHERE id = ? AND phien_ban = ?').bind(JSON.stringify(cay), id, body.phien_ban).run();
    if (!r.meta.changes) { const d = await dongHoCua(env, id); return json({ loi: 'Gia phả vừa được người khác sửa. Hãy xem bản mới rồi sửa lại.', ...d }, 409) }
    return json({ phien_ban: body.phien_ban + 1 });
  }
  if (b === 'de-xuat' && !dx && M === 'POST') {
    let cay, gc; try { cay = kiemCay(body.cay); gc = chu(body.ghi_chu, 200) } catch { return loi(400, 'Gia phả chưa hợp lệ.') }
    if (!Number.isInteger(body.phien_ban)) return loi(400, 'Thiếu phiên bản gia phả.');
    const cho = await env.DB.prepare("SELECT COUNT(*) n FROM de_xuat WHERE dong_ho_id = ? AND nguoi_id = ? AND trang_thai = 'cho'").bind(id, toi.id).first('n');
    if (cho >= 20) return loi(429, 'Bạn đã có 20 đề xuất đang chờ duyệt.');
    const m = ma(12);
    await env.DB.prepare('INSERT INTO de_xuat (id, dong_ho_id, nguoi_id, cay, phien_ban_goc, ghi_chu, tao) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(m, id, toi.id, JSON.stringify(cay), body.phien_ban, gc, Date.now()).run();
    return json({ id: m }, 201);
  }
  if (b === 'de-xuat' && !dx && M === 'GET') {
    const q = duyet ? "SELECT x.id, x.nguoi_id, n.ten nguoi, x.cay, x.phien_ban_goc, x.ghi_chu, x.trang_thai, x.ly_do, x.tao FROM de_xuat x JOIN nguoi_dung n ON n.id = x.nguoi_id WHERE x.dong_ho_id = ? AND x.trang_thai = 'cho' ORDER BY x.tao LIMIT 50"
      : "SELECT x.id, x.nguoi_id, n.ten nguoi, x.cay, x.phien_ban_goc, x.ghi_chu, x.trang_thai, x.ly_do, x.tao FROM de_xuat x JOIN nguoi_dung n ON n.id = x.nguoi_id WHERE x.dong_ho_id = ? AND x.nguoi_id = ? ORDER BY x.tao DESC LIMIT 20";
    const { results } = await (duyet ? env.DB.prepare(q).bind(id) : env.DB.prepare(q).bind(id, toi.id)).all();
    return json({ de_xuat: results.map(r => ({ ...r, cay: r.trang_thai === 'cho' ? JSON.parse(r.cay) : undefined })) });
  }
  if (b === 'de-xuat' && dx && M === 'POST' && (c === 'duyet' || c === 'tu-choi')) {
    if (!duyet) return loi(403, 'Chỉ trưởng họ hoặc người được giao mới duyệt được.');
    const x = await env.DB.prepare("SELECT cay, phien_ban_goc FROM de_xuat WHERE id = ? AND dong_ho_id = ? AND trang_thai = 'cho'").bind(dx, id).first();
    if (!x) return loi(404, 'Đề xuất không còn chờ duyệt.');
    const now = Date.now(), xong = (tt, ld) => env.DB.prepare('UPDATE de_xuat SET trang_thai = ?, ly_do = ?, xu_ly_boi = ?, xu_ly_luc = ? WHERE id = ?').bind(tt, ld, toi.id, now, dx);
    if (c === 'tu-choi') { let ld; try { ld = chu(body.ly_do, 200) } catch { return loi(400, 'Lý do tối đa 200 ký tự.') } await xong('tu-choi', ld).run(); return json({ ok: true }) }
    const r = await env.DB.prepare('UPDATE dong_ho SET cay = ?, phien_ban = phien_ban + 1 WHERE id = ? AND phien_ban = ?').bind(x.cay, id, x.phien_ban_goc).run();
    if (!r.meta.changes) { await xong('tu-choi', 'Gia phả đã đổi sau khi đề xuất được gửi. Cần gửi lại trên bản mới.').run(); return loi(409, 'Gia phả đã đổi từ lúc đề xuất được gửi, nên đề xuất đã bị từ chối. Người gửi cần gửi lại.') }
    await xong('duyet', null).run();
    return json({ phien_ban: x.phien_ban_goc + 1 });
  }
  if (b === 'loi-moi' && M === 'POST') {
    if (!duyet) return loi(403, 'Chỉ trưởng họ hoặc người được giao mới tạo mã mời.');
    const m = ma(10), het = Date.now() + MOI_HAN;
    await env.DB.prepare('INSERT INTO loi_moi (ma_bam, dong_ho_id, tao_boi, het) VALUES (?, ?, ?, ?)').bind(await sha(m), id, toi.id, het).run();
    return json({ ma: m, het }, 201);
  }
  if (b === 'thanh-vien' && M === 'GET') {
    const { results } = await env.DB.prepare('SELECT n.id nguoi_id, n.ten, t.vai FROM thanh_vien t JOIN nguoi_dung n ON n.id = t.nguoi_id WHERE t.dong_ho_id = ? ORDER BY t.vao').bind(id).all();
    return json({ thanh_vien: results });
  }
  if (b === 'vai' && M === 'POST') {
    if (vai !== 'truong') return loi(403, 'Chỉ trưởng họ mới giao vai.');
    if (!['truong', 'duyet', 'thanh-vien'].includes(body.vai) || typeof body.nguoi_id !== 'string') return loi(400, 'Vai không hợp lệ.');
    if (body.nguoi_id === toi.id) return loi(400, 'Không tự đổi vai của mình.');
    const r = await env.DB.prepare('UPDATE thanh_vien SET vai = ? WHERE dong_ho_id = ? AND nguoi_id = ?').bind(body.vai, id, body.nguoi_id).run();
    return r.meta.changes ? json({ ok: true }) : loi(404, 'Người này không ở trong dòng họ.');
  }
  return loi(404, 'Không có lệnh này.');
}

export async function onRequest({ request: req, env, params }) {
  try {
    if (!env.DB) return loi(503, 'Máy chủ gia phả chưa được cấu hình.');
    if (req.method !== 'GET') {   // chống giả mạo yêu cầu từ trang khác
      const o = req.headers.get('Origin');
      if (!o || new URL(o).host !== new URL(req.url).host) return loi(403, 'Yêu cầu không đến từ trang Song Song.');
      if (!(req.headers.get('Content-Type') || '').startsWith('application/json')) return loi(415, 'Cần gửi dữ liệu JSON.');
    }
    const duong = [].concat(params.duong || []);
    return await xuLy(env, req, duong, await ai(env, req));
  } catch (e) {
    console.error(e);
    return loi(500, 'Máy chủ gặp lỗi. Hãy thử lại sau.');
  }
}
