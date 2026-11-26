// Máy chủ gia phả dòng họ: Cloudflare Pages Functions + D1 (binding DB). Đăng nhập bằng Google (OAuth 2.0 + PKCE), Zalo để sẵn (bật khi có khoá):
// Google/Zalo giữ mật khẩu, máy chủ chỉ cấp phiên (cookie HttpOnly) sau khi họ xác nhận người dùng (docs/bao-mat.md: không tự viết mật khẩu). Thiết kế: docs/gia-pha-dong-ho.md
const NGAY = 864e5, MOI_HAN = 14 * NGAY, DX_NGAY = 30;
const enc = new TextEncoder();

const json = (o, st = 200, h = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...h } });
const loi = (st, chu) => json({ loi: chu }, st);
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const sha = async s => b64(await crypto.subtle.digest('SHA-256', enc.encode(s)));
// mã đọc được (bỏ 0/o, 1/l/i), lấy mẫu loại bỏ để không lệch xác suất
function ma(n) { const A = 'abcdefghjkmnpqrstuvwxyz23456789'; let s = ''; while (s.length < n) for (const x of crypto.getRandomValues(new Uint8Array(n))) if (x < 248 && s.length < n) s += A[x % 31]; return s }
// ---------- kiểm dữ liệu tại ranh giới tin cậy ----------
const LA = /[\u0000-\u001f\u007f-\u009f\u061c\u200b-\u200f\u2028-\u202e\u2060-\u2069\ufeff]/g;   // ký tự điều khiển, đảo chiều chữ: dùng để giả tên
const chu = (v, max, can) => { if (v == null || v === '') { if (can) throw 0; return null } if (typeof v !== 'string') throw 0; v = v.replace(LA, '').trim(); if (!v && can) throw 0; if (v.length > max) throw 0; return v || null };
const so = (v, a, b) => { if (v == null || v === '') return null; if (!Number.isInteger(v) || v < a || v > b) throw 0; return v };
const co = v => v === true;
const ID = /^(?!(?:__proto__|constructor|prototype)$)[A-Za-z0-9_-]{1,24}$/, NGAY_THANG = /^([1-9]|[12]\d|3[01])\/([1-9]|1[0-2])$/;
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
      thu: so(m.thu, 1, 30), nuoi: co(m.nuoi), an: chu(m.an, 120), tk: chu(m.tk, 70) };
  });
  for (const m of ms) for (const r of [m.parent, m.mother, m.spouse, ...m.sp2]) if (r != null && (!ids.has(r) || r === m.id)) throw 0;
  const cha = new Map(ms.map(m => [m.id, m.parent]));   // không cho vòng cha – con
  for (const m of ms) { let x = m.parent, n = 0; while (x) { if (x === m.id || ++n > 2000) throw 0; x = cha.get(x) } }
  const out = { members: ms, seq: so(c.seq, 1, 1e7) || ms.length + 1 };
  if (JSON.stringify(out).length > 1e6) throw 0;
  return out;
}
// ---------- đăng nhập bằng Google / Zalo; phiên do máy chủ cấp ----------
const PHIEN_HAN = 30 * NGAY, CHO_HAN = 10 * 6e4;
const hex = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, '0')).join('');
const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
// __Host-: trình duyệt chỉ nhận cookie này từ đúng tên miền trang (không Domain, Path=/), nên bản xem trước <nhánh>.thegioisongsong.pages.dev
// không ném được cookie trùng tên vào trang chính. Trùng tên vẫn lọt tới (trình duyệt lạ) thì bỏ cả hai.
const banh = (req, k) => { const c = (req.headers.get('Cookie') || '').split(/;\s*/).filter(x => x.startsWith(k + '='));
  return c.length === 1 && /^[0-9a-f]{64}$/.test(c[0].slice(k.length + 1)) ? c[0].slice(k.length + 1) : null };
const cookie = (k, v, han) => `${k}=${v}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${han}`;
const PHIEN = '__Host-ss_phien', DCHO = '__Host-ss_dn';
async function ai(env, req) {
  const t = banh(req, PHIEN); if (!t) return null;
  return env.DB.prepare('SELECT n.id, n.ten FROM phien p JOIN nguoi_dung n ON n.id = p.nguoi_id WHERE p.ma_bam = ? AND p.het > ?').bind(await sha(t), Date.now()).first();
}
const chuyen = (url, cks) => { const h = new Headers({ Location: url, 'Cache-Control': 'no-store' }); for (const c of cks) h.append('Set-Cookie', c); return new Response(null, { status: 302, headers: h }) };
const form = (url, body, h = {}) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...h }, body: new URLSearchParams(body) }).then(x => x.json()).catch(() => ({}));
const lay = (url, h) => fetch(url, { headers: h }).then(x => x.json()).catch(() => ({}));
// mỗi bên đăng nhập: bật khi có khoá; vao() = địa chỉ trang đăng nhập của họ; doi() = đổi code lấy {id, ten}. *_THU: địa chỉ giả để kiểm thử
const BEN = {
  google: { kt: 'g', id: /^[0-9A-Za-z_-]{1,60}$/, bat: env => env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET,
    vao: (env, ve, st, cc) => (env.GOOGLE_THU || 'https://accounts.google.com') + '/o/oauth2/v2/auth?' + new URLSearchParams({ client_id: env.GOOGLE_CLIENT_ID, redirect_uri: ve,
      response_type: 'code', scope: 'openid profile', state: st, code_challenge: cc, code_challenge_method: 'S256', prompt: 'select_account' }),
    async doi(env, ve, code, cv) {
      const t = await form((env.GOOGLE_THU || 'https://oauth2.googleapis.com') + '/token', { code, client_id: env.GOOGLE_CLIENT_ID, client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: ve, grant_type: 'authorization_code', code_verifier: cv });
      if (!t || typeof t.access_token !== 'string') return null;
      const me = await lay((env.GOOGLE_THU || 'https://openidconnect.googleapis.com') + '/v1/userinfo', { Authorization: 'Bearer ' + t.access_token });
      return me && { id: me.sub, ten: me.name } } },
  zalo: { kt: 'z', id: /^\d{1,30}$/, bat: env => env.ZALO_APP_ID && env.ZALO_APP_SECRET,
    vao: (env, ve, st, cc) => (env.ZALO_OAUTH || 'https://oauth.zaloapp.com') + '/v4/permission?' + new URLSearchParams({ app_id: env.ZALO_APP_ID, redirect_uri: ve, code_challenge: cc, state: st }),
    async doi(env, ve, code, cv) {
      const t = await form((env.ZALO_OAUTH || 'https://oauth.zaloapp.com') + '/v4/access_token', { code, app_id: env.ZALO_APP_ID, grant_type: 'authorization_code', code_verifier: cv }, { secret_key: env.ZALO_APP_SECRET });
      if (!t || typeof t.access_token !== 'string') return null;
      const me = await lay((env.ZALO_GRAPH || 'https://graph.zalo.me') + '/v2.0/me?fields=id,name', { access_token: t.access_token });
      return me && { id: me.id, ten: me.name } } },
};
const cachBat = env => Object.keys(BEN).filter(k => BEN[k].bat(env));
async function batDau(env, req, ben) {
  const st = hex(32), cv = hex(32), cc = b64url(await crypto.subtle.digest('SHA-256', enc.encode(cv))), goc = new URL(req.url).origin;
  await env.DB.batch([env.DB.prepare('DELETE FROM dn_cho WHERE het < ?').bind(Date.now()),
    env.DB.prepare('INSERT INTO dn_cho (state_bam, ben, cv, het) VALUES (?, ?, ?, ?)').bind(await sha(st), ben, cv, Date.now() + CHO_HAN)]);
  return chuyen(BEN[ben].vao(env, goc + '/api/' + ben + '/ve', st, cc), [cookie(DCHO, st, CHO_HAN / 1000)]);
}
async function ve(env, req, ben) {
  const u = new URL(req.url), st = u.searchParams.get('state') || '', code = u.searchParams.get('code') || '', bo = cookie(DCHO, '', 0);
  const hong = ly => chuyen(u.origin + '/?dang-nhap=' + ly + '#ca-nhan', [bo]);
  // state phải khớp cookie của chính trình duyệt này: chặn kẻ xấu gài người khác đăng nhập vào tài khoản của hắn
  if (!/^[0-9a-f]{64}$/.test(st) || banh(req, DCHO) !== st || !code || code.length > 2000) return hong('loi');
  const r = await env.DB.prepare('DELETE FROM dn_cho WHERE state_bam = ? AND ben = ? AND het > ? RETURNING cv').bind(await sha(st), ben, Date.now()).first();
  if (!r) return hong('het-han');
  const me = await BEN[ben].doi(env, u.origin + '/api/' + ben + '/ve', code, r.cv);
  if (!me || typeof me.id !== 'string' || !BEN[ben].id.test(me.id)) return hong('loi');
  // mã tài khoản = HMAC(TK_KHOA, bên:mã): mã Google (sub) dùng chung mọi dịch vụ, không để lộ cho người trong dòng họ. Không đổi TK_KHOA sau khi có người dùng
  const k = await crypto.subtle.importKey('raw', enc.encode(env.TK_KHOA), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const id = BEN[ben].kt + b64url(await crypto.subtle.sign('HMAC', k, enc.encode(ben + ':' + me.id))), tk = hex(32), now = Date.now();
  await env.DB.batch([
    env.DB.prepare('INSERT OR IGNORE INTO nguoi_dung (id, ten, tao) VALUES (?, ?, ?)').bind(id, String(me.ten || '').replace(LA, '').trim().slice(0, 60) || 'Bạn', now),
    env.DB.prepare('INSERT INTO phien (ma_bam, nguoi_id, het) VALUES (?, ?, ?)').bind(await sha(tk), id, now + PHIEN_HAN),
    env.DB.prepare('DELETE FROM phien WHERE het < ?').bind(now)]);
  return chuyen(u.origin + '/?dang-nhap=ok#ca-nhan', [cookie(PHIEN, tk, PHIEN_HAN / 1000), bo]);   // dang-nhap=ok: trang vào luôn tài khoản trên máy (js/07-07)
}

// phòng chung (docs/phong-chung.md): người lạ chỉ thấy tên gọi (chữ cuối), bỏ chữ tục và tên giả ban quản trị
const XAU = new Set(['đụ', 'địt', 'đit', 'lồn', 'lon', 'cặc', 'cac', 'buồi', 'đĩ', 'đéo', 'deo', 'đm', 'dm', 'đcm', 'dcm', 'vl', 'vcl', 'clm', 'cc', 'loz', 'fuck', 'shit', 'bitch',
  'admin', 'quantri', 'quảntrị', 'mod', 'moderator', 'songsong', 'bqt']);
export function tenGoi(ten) {
  const t = String(ten || '').normalize('NFC');
  if (/[^\P{L}\p{Script=Latin}]/u.test(t)) return 'Khách viếng';   // chữ ngoài bảng Latin/tiếng Việt (ví dụ "а" Kirin giả "a")
  const w = t.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/), g = w.pop() || '', ca = w.concat(g).join('').toLowerCase();   // "L.ồ.n" → "Lồn"
  if (!g || XAU.has(g.toLowerCase()) || /admin|quảntrị|quantri|songsong/.test(ca)) return 'Khách viếng';
  return g.slice(0, 20);
}
const dongPhong = (env, id) => env.PHONG ? env.PHONG.get(env.PHONG.idFromName('chung')).fetch('https://phong/dong', { method: 'POST', headers: { 'X-Id': id } }).catch(() => { }) : null;

// trường tk (người trong cây là tài khoản nào) chỉ đổi qua /gan, /xoa-thanh-vien và lúc lập dòng họ (người lập tự gắn một người còn sống).
// Sửa cây, đề xuất, duyệt, khôi phục: tk luôn lấy theo bản đang lưu, gửi gì lên cũng bỏ
function giuTk(cay, cu, minh) {
  const C = new Map((cu ? cu.members : []).map(m => [m.id, m.tk])); let mot = !cu;
  for (const m of cay.members) { const c = cu ? C.get(m.id) : (mot && m.tk === minh && !m.d && !m.ls && minh); if (c) { m.tk = c; mot = false } else delete m.tk }
  return cay }
// chỉ đổi tk: không tăng phiên bản (đề xuất đang chờ vẫn duyệt được), không lưu lịch sử; ghi khi cây chưa bị ai đổi từ lúc đọc
const ghiTk = (env, d) => env.DB.prepare('UPDATE dong_ho SET cay = ? WHERE id = ? AND cay = ?').bind(JSON.stringify(d.cay), d.id, d.goc).run();
// lưu bản cũ trước khi thay cây, giữ 30 bản gần nhất để trưởng họ khôi phục
const luuCu = (env, id, toi) => [env.DB.prepare('INSERT OR IGNORE INTO lich_su (dong_ho_id, phien_ban, cay, luc, boi) SELECT id, phien_ban, cay, ?, ? FROM dong_ho WHERE id = ?').bind(Date.now(), toi.id, id),
  env.DB.prepare('DELETE FROM lich_su WHERE dong_ho_id = ? AND phien_ban <= (SELECT MAX(phien_ban) - 30 FROM lich_su WHERE dong_ho_id = ?)').bind(id, id)];
const vaiCua = (env, dh, nguoi) => env.DB.prepare('SELECT vai FROM thanh_vien WHERE dong_ho_id = ? AND nguoi_id = ?').bind(dh, nguoi).first('vai');

// ---------- các lệnh ----------
async function dongHoCua(env, id) { const r = await env.DB.prepare('SELECT id, ten, cay, phien_ban FROM dong_ho WHERE id = ?').bind(id).first(); if (r) { r.goc = r.cay; r.cay = JSON.parse(r.cay) } return r }

async function xuLy(env, req, duong, toi) {
  const [a, id, b, dx, c] = duong, M = req.method;
  let body = {};
  if (M !== 'GET') { if (+(req.headers.get('Content-Length') || 0) > 1.2e6) return loi(413, 'Dữ liệu quá lớn.'); const t = await req.text(); if (enc.encode(t).length > 1.2e6) return loi(413, 'Dữ liệu quá lớn.'); try { body = t ? JSON.parse(t) : {} } catch { return loi(400, 'Dữ liệu không đọc được.') } if (!body || typeof body !== 'object') return loi(400, 'Dữ liệu không đọc được.') }

  if (Object.hasOwn(BEN, a) && BEN[a].bat(env) && M === 'GET' && !b) { if (id === 'bat-dau') return batDau(env, req, a); if (id === 've') return ve(env, req, a) }
  if (a === 'dang-xuat' && M === 'POST') {
    const t = banh(req, PHIEN); if (t) await env.DB.prepare('DELETE FROM phien WHERE ma_bam = ?').bind(await sha(t)).run();
    if (toi) await dongPhong(env, toi.id);   // kết nối phòng chung đang mở cũng phải ra
    return json({ ok: true }, 200, { 'Set-Cookie': cookie(PHIEN, '', 0) });
  }
  if (a === 'toi' && M === 'GET') {
    if (!toi) return json({ nguoi: null, cach: cachBat(env) });
    const { results } = await env.DB.prepare('SELECT d.id, d.ten, t.vai FROM thanh_vien t JOIN dong_ho d ON d.id = t.dong_ho_id WHERE t.nguoi_id = ? ORDER BY t.vao').bind(toi.id).all();
    return json({ nguoi: toi, dong_ho: results, cach: cachBat(env), phong: !!env.PHONG });
  }
  if (!toi) return loi(401, 'Hãy đăng nhập.');
  // phòng chung (docs/phong-chung.md): chỉ người đã đăng nhập; chuyển kết nối WebSocket sang Durable Object kèm mã và tên do máy chủ xác nhận
  if (a === 'phong' && !id && M === 'GET') {
    if (!env.PHONG) return loi(503, 'Phòng chung chưa được bật.');
    if ((req.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return loi(426, 'Cần WebSocket.');
    let cung = false; try { cung = new URL(req.headers.get('Origin') || '').host === new URL(req.url).host } catch { }   // chống trang khác mượn cookie mở kết nối
    if (!cung) return loi(403, 'Yêu cầu không đến từ trang Song Song.');
    return env.PHONG.get(env.PHONG.idFromName('chung')).fetch('https://phong/ws', { headers: { Upgrade: 'websocket', 'X-Id': toi.id, 'X-Ten': encodeURIComponent(tenGoi(toi.ten)) } });
  }
  if (a === 'toi' && M === 'PUT') {
    let ten; try { ten = chu(body.ten, 60, true) } catch { return loi(400, 'Tên từ 1 đến 60 ký tự.') }
    await env.DB.prepare('UPDATE nguoi_dung SET ten = ? WHERE id = ?').bind(ten, toi.id).run(); await dongPhong(env, toi.id); return json({ ten });
  }

  if (a === 'tham-gia' && M === 'POST') {
    const m = String(body.ma || '').trim().toLowerCase(); if (!/^[a-z0-9]{10}$/.test(m)) return loi(400, 'Mã mời gồm 10 ký tự.');
    const r = await env.DB.prepare('SELECT l.dong_ho_id, d.ten FROM loi_moi l JOIN dong_ho d ON d.id = l.dong_ho_id WHERE l.ma_bam = ? AND l.het > ?').bind(await sha(m), Date.now()).first();
    if (!r || await env.DB.prepare('SELECT 1 FROM chan WHERE dong_ho_id = ? AND nguoi_id = ?').bind(r.dong_ho_id, toi.id).first()) return loi(404, 'Mã mời không đúng hoặc đã hết hạn.');
    await env.DB.prepare("INSERT OR IGNORE INTO thanh_vien (dong_ho_id, nguoi_id, vai, vao) VALUES (?, ?, 'thanh-vien', ?)").bind(r.dong_ho_id, toi.id, Date.now()).run();
    return json({ dong_ho: { id: r.dong_ho_id, ten: r.ten } });
  }
  if (a !== 'dong-ho') return loi(404, 'Không có lệnh này.');

  if (!id && M === 'POST') {
    let ten, cay; try { ten = chu(body.ten, 60, true); cay = giuTk(kiemCay(body.cay), null, toi.id) } catch { return loi(400, 'Tên dòng họ hoặc gia phả chưa hợp lệ.') }
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
    if (!Number.isInteger(body.phien_ban)) return loi(400, 'Thiếu phiên bản gia phả.');
    const hien = await dongHoCua(env, id); giuTk(cay, hien.cay, toi.id);
    const [, , r] = await env.DB.batch([...luuCu(env, id, toi), env.DB.prepare('UPDATE dong_ho SET cay = ?, phien_ban = phien_ban + 1 WHERE id = ? AND phien_ban = ? AND cay = ?').bind(JSON.stringify(cay), id, body.phien_ban, hien.goc)]);
    if (!r.meta.changes) { const d = await dongHoCua(env, id); return json({ loi: 'Gia phả vừa được người khác sửa. Hãy xem bản mới rồi sửa lại.', ...d }, 409) }
    return json({ phien_ban: body.phien_ban + 1 });
  }
  if (b === 'de-xuat' && !dx && M === 'POST') {
    let cay, gc; try { cay = kiemCay(body.cay); gc = chu(body.ghi_chu, 200) } catch { return loi(400, 'Gia phả chưa hợp lệ.') }
    const hien = await dongHoCua(env, id), pb = hien.phien_ban; giuTk(cay, hien.cay, toi.id);
    if (body.phien_ban !== pb) return loi(409, 'Gia phả vừa được người khác sửa. Hãy tải lại rồi sửa trên bản mới.');
    const dem = await env.DB.prepare("SELECT SUM(trang_thai = 'cho') cho, SUM(tao > ?) ngay FROM de_xuat WHERE dong_ho_id = ? AND nguoi_id = ?").bind(Date.now() - NGAY, id, toi.id).first();
    if (dem.cho >= 20) return loi(429, 'Bạn đã có 20 đề xuất đang chờ duyệt.');
    if (dem.ngay >= DX_NGAY) return loi(429, 'Mỗi ngày gửi tối đa ' + DX_NGAY + ' đề xuất.');
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
    const now = Date.now(), xong = (tt, ld) => env.DB.prepare("UPDATE de_xuat SET trang_thai = ?, ly_do = ?, cay = '', xu_ly_boi = ?, xu_ly_luc = ? WHERE id = ? AND trang_thai = 'cho'").bind(tt, ld, toi.id, now, dx);
    if (c === 'tu-choi') { let ld; try { ld = chu(body.ly_do, 200) } catch { return loi(400, 'Lý do tối đa 200 ký tự.') } await xong('tu-choi', ld).run(); return json({ ok: true }) }
    if (!(await xong('duyet', null).run()).meta.changes) return loi(404, 'Đề xuất không còn chờ duyệt.');   // hai người bấm duyệt cùng lúc: chỉ một người được
    const hien = await dongHoCua(env, id), moi = JSON.stringify(giuTk(JSON.parse(x.cay), hien.cay, toi.id));
    const [, , r] = await env.DB.batch([...luuCu(env, id, toi), env.DB.prepare('UPDATE dong_ho SET cay = ?, phien_ban = phien_ban + 1 WHERE id = ? AND phien_ban = ? AND cay = ?').bind(moi, id, x.phien_ban_goc, hien.goc)]);
    if (!r.meta.changes) { await env.DB.prepare("UPDATE de_xuat SET trang_thai = 'tu-choi', ly_do = ? WHERE id = ?").bind('Gia phả đã đổi sau khi đề xuất được gửi. Cần gửi lại trên bản mới.', dx).run(); return loi(409, 'Gia phả đã đổi từ lúc đề xuất được gửi, nên đề xuất đã bị từ chối. Người gửi cần gửi lại.') }
    return json({ phien_ban: x.phien_ban_goc + 1 });
  }
  if (b === 'loi-moi' && M === 'POST') {
    if (!duyet) return loi(403, 'Chỉ trưởng họ hoặc người được giao mới tạo mã mời.');
    const m = ma(10), het = Date.now() + MOI_HAN;
    await env.DB.prepare('INSERT INTO loi_moi (ma_bam, dong_ho_id, tao_boi, het) VALUES (?, ?, ?, ?)').bind(await sha(m), id, toi.id, het).run();
    return json({ ma: m, het }, 201);
  }
  if (b === 'lich-su' && M === 'GET') {
    if (vai !== 'truong') return loi(403, 'Chỉ trưởng họ xem được các bản cũ.');
    const { results } = await env.DB.prepare('SELECT l.phien_ban, l.luc, n.ten boi, l.cay FROM lich_su l LEFT JOIN nguoi_dung n ON n.id = l.boi WHERE l.dong_ho_id = ? ORDER BY l.phien_ban DESC LIMIT 30').bind(id).all();
    return json({ lich_su: results.map(r => ({ phien_ban: r.phien_ban, luc: r.luc, boi: r.boi, so_nguoi: JSON.parse(r.cay).members.length })) });
  }
  // "đây là tôi": thành viên tự gắn tài khoản mình với một người còn sống chưa ai nhận (không cần duyệt, mỗi tài khoản một người); trưởng họ bỏ gắn được
  if (b === 'gan' && M === 'POST') {
    const d = await dongHoCua(env, id), tim = k => d.cay.members.find(m => m.id === k);
    if (body.bo != null) {
      if (vai !== 'truong') return loi(403, 'Chỉ trưởng họ bỏ gắn được người khác.');
      const m = typeof body.bo === 'string' && tim(body.bo); if (!m) return loi(404, 'Không thấy người này trong gia phả.');
      delete m.tk;
    } else {
      const m = body.nguoi == null ? null : typeof body.nguoi === 'string' && tim(body.nguoi);
      if (m === false || m === undefined) return loi(404, 'Không thấy người này trong gia phả.');
      if (m && m.tk && m.tk !== toi.id) return loi(409, 'Người này đã có tài khoản khác nhận.');
      if (m && (m.d || m.ls)) return loi(400, 'Chỉ gắn được với người còn sống.');
      for (const x of d.cay.members) if (x.tk === toi.id) delete x.tk;
      if (m) m.tk = toi.id;
    }
    if (JSON.stringify(d.cay) === d.goc) return json({ cay: d.cay });   // không đổi gì thì không ghi
    return (await ghiTk(env, d)).meta.changes ? json({ cay: d.cay }) : loi(409, 'Gia phả vừa được người khác sửa. Hãy thử lại.');
  }
  if (b === 'khoi-phuc' && M === 'POST') {
    if (vai !== 'truong') return loi(403, 'Chỉ trưởng họ khôi phục được bản cũ.');
    if (!Number.isInteger(body.ve) || !Number.isInteger(body.phien_ban)) return loi(400, 'Thiếu phiên bản.');
    const cu = await env.DB.prepare('SELECT cay FROM lich_su WHERE dong_ho_id = ? AND phien_ban = ?').bind(id, body.ve).first('cay');
    if (!cu) return loi(404, 'Không còn bản này.');
    const hien = await dongHoCua(env, id), ban = JSON.parse(cu), goc = new Map(ban.members.map(m => [m.id, m.tk])), co = new Set(hien.cay.members.map(m => m.id));
    giuTk(ban, hien.cay, toi.id);   // người không còn trong cây hiện tại: giữ tk của bản cũ nếu tài khoản đó vẫn ở trong họ và chưa nhận ai khác
    const tv = new Set((await env.DB.prepare('SELECT nguoi_id FROM thanh_vien WHERE dong_ho_id = ?').bind(id).all()).results.map(r => r.nguoi_id)), dung = new Set(ban.members.map(m => m.tk).filter(Boolean));
    for (const m of ban.members) { const t = goc.get(m.id); if (!co.has(m.id) && t && tv.has(t) && !dung.has(t)) { m.tk = t; dung.add(t) } }
    const moi = JSON.stringify(ban);
    const [, , r] = await env.DB.batch([...luuCu(env, id, toi), env.DB.prepare('UPDATE dong_ho SET cay = ?, phien_ban = phien_ban + 1 WHERE id = ? AND phien_ban = ? AND cay = ?').bind(moi, id, body.phien_ban, hien.goc)]);
    return r.meta.changes ? json({ phien_ban: body.phien_ban + 1 }) : loi(409, 'Gia phả vừa được người khác sửa. Hãy tải lại rồi thử lại.');
  }
  if (b === 'loi-moi' && M === 'DELETE') {
    if (!duyet) return loi(403, 'Chỉ trưởng họ hoặc người được giao mới thu hồi mã mời.');
    await env.DB.prepare('DELETE FROM loi_moi WHERE dong_ho_id = ?').bind(id).run(); return json({ ok: true });
  }
  if (b === 'thanh-vien' && M === 'GET') {
    const { results } = await env.DB.prepare('SELECT n.id nguoi_id, n.ten, t.vai FROM thanh_vien t JOIN nguoi_dung n ON n.id = t.nguoi_id WHERE t.dong_ho_id = ? ORDER BY t.vao').bind(id).all();
    return json({ thanh_vien: results });
  }
  if ((b === 'vai' || b === 'xoa-thanh-vien') && M === 'POST') {
    if (vai !== 'truong') return loi(403, 'Chỉ trưởng họ mới giao vai hoặc mời người ra.');
    if (typeof body.nguoi_id !== 'string' || (b === 'vai' && !['truong', 'duyet', 'thanh-vien'].includes(body.vai))) return loi(400, 'Vai không hợp lệ.');
    if (body.nguoi_id === toi.id) return loi(400, 'Không tự đổi vai của mình.');
    if (body.nguoi_id === await env.DB.prepare('SELECT tao_boi FROM dong_ho WHERE id = ?').bind(id).first('tao_boi')) return loi(403, 'Không đổi vai người lập dòng họ.');
    const r = await (b === 'vai' ? env.DB.prepare('UPDATE thanh_vien SET vai = ? WHERE dong_ho_id = ? AND nguoi_id = ?').bind(body.vai, id, body.nguoi_id)
      : env.DB.prepare('DELETE FROM thanh_vien WHERE dong_ho_id = ? AND nguoi_id = ?').bind(id, body.nguoi_id)).run();
    if (!r.meta.changes) return loi(404, 'Người này không ở trong dòng họ.');
    if (b === 'xoa-thanh-vien' || body.vai === 'thanh-vien') await env.DB.prepare('DELETE FROM loi_moi WHERE dong_ho_id = ? AND tao_boi = ?').bind(id, body.nguoi_id).run();   // mã người đó tạo hết hiệu lực
    if (b === 'xoa-thanh-vien') for (let i = 0; i < 3; i++) {   // người rời họ không còn "đây là tôi" trong cây
      const d = await dongHoCua(env, id); let doi = false;
      for (const m of d.cay.members) if (m.tk === body.nguoi_id) { delete m.tk; doi = true }
      if (!doi || (await ghiTk(env, d)).meta.changes) break }
    if (b === 'xoa-thanh-vien') await env.DB.batch([   // không vào lại bằng mã cũ; đề xuất đang chờ của người đó bỏ đi
      env.DB.prepare('INSERT OR IGNORE INTO chan (dong_ho_id, nguoi_id, luc) VALUES (?, ?, ?)').bind(id, body.nguoi_id, Date.now()),
      env.DB.prepare("UPDATE de_xuat SET trang_thai = 'tu-choi', ly_do = 'Người gửi đã rời dòng họ.', cay = '' WHERE dong_ho_id = ? AND nguoi_id = ? AND trang_thai = 'cho'").bind(id, body.nguoi_id)]);
    return json({ ok: true });
  }
  return loi(404, 'Không có lệnh này.');
}

export async function onRequest({ request: req, env, params }) {
  try {
    if (!env.DB || !env.TK_KHOA || !cachBat(env).length) return loi(503, 'Máy chủ gia phả chưa được cấu hình.');
    if (req.method !== 'GET') {   // chống giả mạo yêu cầu từ trang khác
      const o = req.headers.get('Origin');
      let cung = false; try { cung = !!o && new URL(o).host === new URL(req.url).host } catch { }
      if (!cung) return loi(403, 'Yêu cầu không đến từ trang Song Song.');
      if (!(req.headers.get('Content-Type') || '').startsWith('application/json')) return loi(415, 'Cần gửi dữ liệu JSON.');
    }
    const duong = [].concat(params.duong || []);
    return await xuLy(env, req, duong, await ai(env, req));
  } catch (e) {
    console.error(e);
    return loi(500, 'Máy chủ gặp lỗi. Hãy thử lại sau.');
  }
}
