// Phòng chung Song Song: một Durable Object giữ ai đang ở đâu (vị trí, biểu cảm, cảnh) và báo cho những người còn lại.
// Chỉ nhận kết nối do functions/api/phong chuyển tới (đã kiểm phiên đăng nhập Google, gắn X-Id, X-Ten). Thiết kế: docs/phong-chung.md
import { DurableObject } from 'cloudflare:workers';

// nhịp trang thật tối đa 5 tin/giây (js/02-09) = 25 tin/5 giây: quá thì đuổi và cấm nối lại 60 giây (gửi dồn làm cạn hạn mức miễn phí của cả phòng)
const TOI_DA_P = 1500, CUA_SO = 5000, DUOI = 30, CAM = 60e3, MOI_NGUOI = 2, TONG = 300, CHO_P = 30e3, TUOI = 3600e3, NHANG = 15 * 60e3;
const CHU = /^[a-z0-9_-]{1,20}$/, TC = /^[a-z0-9.]{0,120}$/i, EMO = new Set(['pray', 'heart', 'flower', 'light']);
// chỉ giữ trường js/03 và js/04-01 gửi, đúng kiểu và đúng nghĩa; tên (n) luôn lấy từ máy chủ, không tin trang.
// s không nhận "ho:<mã>" (làng riêng: mã băm từ tên và số điện thoại, dò ngược được), chỉ nhận tên cảnh chung.
export function sach(p, ten, now = Date.now()) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const o = {};
  for (const k of ['x', 'y', 'tx', 'ty']) if (typeof p[k] === 'number' && Number.isFinite(p[k])) o[k] = Math.round(Math.max(-1, Math.min(2, p[k])) * 1000) / 1000;
  for (const k of ['w', 'h', 'k']) if (p[k] === 0 || p[k] === 1) o[k] = p[k];
  if (Number.isInteger(p.c) && p.c >= 0 && p.c <= 7) o.c = p.c;
  if (Number.isInteger(p.li) && p.li > now - NHANG && p.li <= now + 6e4) o.li = p.li;   // giờ thắp nhang: chỉ nhang còn đang cháy
  for (const k of ['f', 's', 'a']) if (typeof p[k] === 'string' && CHU.test(p[k])) o[k] = p[k];
  if (typeof p.e === 'string' && EMO.has(p.e)) o.e = p.e; else if (p.e === null) o.e = null;
  if (typeof p.tc === 'string' && TC.test(p.tc)) o.tc = p.tc;
  o.n = ten;
  return o;
}

export class Phong extends DurableObject {
  async fetch(req) {
    const id = req.headers.get('X-Id') || '', ten = decodeURIComponent(req.headers.get('X-Ten') || '').slice(0, 60);
    if (!id) return new Response('Chưa đăng nhập.', { status: 401 });
    // đăng xuất / đổi tên (functions/api): đóng mọi kết nối của tài khoản này, trang tự nối lại với phiên mới nếu còn
    if (new URL(req.url).pathname === '/dong') { this.dong(w => w.id === id, 4002, 'Phiên đã đổi'); return new Response(null, { status: 204 }) }
    if ((req.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return new Response('Cần WebSocket.', { status: 426 });
    if ((await this.ctx.storage.get('cam:' + id) || 0) > Date.now()) return new Response('Gửi quá nhanh, hãy thử lại sau.', { status: 429 });
    const ds = this.ctx.getWebSockets();
    if (ds.length >= TONG) return new Response('Phòng chung đang đông, hãy thử lại sau.', { status: 503 });
    if (ds.filter(w => (w.deserializeAttachment() || {}).id === id).length >= MOI_NGUOI) return new Response('Bạn đang mở quá nhiều cửa sổ.', { status: 429 });
    if (!(await this.ctx.storage.getAlarm())) await this.ctx.storage.setAlarm(Date.now() + CHO_P);
    const [kh, may] = Object.values(new WebSocketPair());
    const peer = [...crypto.getRandomValues(new Uint8Array(9))].map(x => x.toString(16).padStart(2, '0')).join('');   // mã ngẫu nhiên mỗi kết nối, không lộ mã tài khoản
    this.ctx.acceptWebSocket(may);   // ngủ được (hibernation): đứng yên không tính thời gian chạy
    may.serializeAttachment({ peer, id, ten, p: null, t0: Date.now(), n: 0, vao: Date.now() });
    may.send(JSON.stringify({ t: 'chao', toi: peer, ds: ds.map(w => w.deserializeAttachment()).filter(a => a && a.p).map(a => ({ peer: a.peer, p: a.p })) }));
    return new Response(null, { status: 101, webSocket: kh });
  }
  gui(tru, tin) { const s = JSON.stringify(tin); for (const w of this.ctx.getWebSockets()) if (w !== tru) try { w.send(s) } catch { } }
  dong(chon, ma, ly) { for (const w of this.ctx.getWebSockets()) { const a = w.deserializeAttachment(); if (a && chon(a)) { this.gui(w, { t: 'di', peer: a.peer }); try { w.send(JSON.stringify({ t: 'het', ma })); w.close(ma, ly) } catch { } } } }   // 'het': trang tự đóng, phòng khi khung đóng không tới
  // mỗi 30 giây khi còn người: đóng kết nối im lặng (chưa gửi vị trí sau 30 giây) và kết nối quá 1 giờ (buộc kiểm lại phiên)
  async alarm() {
    const now = Date.now();
    this.dong(a => !a.p && now - a.vao > CHO_P, 4001, 'Không hoạt động');
    this.dong(a => now - a.vao > TUOI, 4000, 'Nối lại');
    if (this.ctx.getWebSockets().length) await this.ctx.storage.setAlarm(now + CHO_P);
  }
  async webSocketMessage(ws, tin) {
    const a = ws.deserializeAttachment(); if (!a) return ws.close(1008, 'Hỏng');
    const now = Date.now(); if (now - a.t0 > CUA_SO) { a.t0 = now; a.n = 0 }
    if (++a.n > DUOI) { await this.ctx.storage.put('cam:' + a.id, now + CAM); this.gui(ws, { t: 'di', peer: a.peer }); return ws.close(1008, 'Gửi quá nhanh') }
    if (typeof tin !== 'string' || tin.length > TOI_DA_P) { ws.serializeAttachment(a); return }
    let m; try { m = JSON.parse(tin) } catch { ws.serializeAttachment(a); return }
    const p = sach(m && m.p, a.ten);
    if (p) { a.p = p; this.gui(ws, { t: 'p', peer: a.peer, p }) }
    ws.serializeAttachment(a);
  }
  async webSocketClose(ws, code) { const a = ws.deserializeAttachment(); if (a) this.gui(ws, { t: 'di', peer: a.peer }); try { ws.close(code === 1005 ? 1000 : code) } catch { } }
  async webSocketError(ws) { return this.webSocketClose(ws) }
}

export default { fetch: () => new Response('Không có gì ở đây.', { status: 404 }) };
