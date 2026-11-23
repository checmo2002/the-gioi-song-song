// Phòng chung Song Song: một Durable Object giữ ai đang ở đâu (vị trí, biểu cảm, cảnh) và báo cho những người còn lại.
// Chỉ nhận kết nối do functions/api/phong chuyển tới (đã kiểm phiên đăng nhập Google, gắn X-Id, X-Ten). Thiết kế: docs/phong-chung.md
import { DurableObject } from 'cloudflare:workers';

const TOI_DA_P = 1500, CUA_SO = 5000, TIN_CUA_SO = 25, DUOI = 120, MOI_NGUOI = 5, TONG = 300;
const CHU = /^[A-Za-z0-9:_-]{0,40}$/, TC = /^[a-z0-9.]{0,120}$/i;
// chỉ giữ trường js/03 và js/04-01 gửi, đúng kiểu; tên (n) luôn lấy từ máy chủ, không tin trang
export function sach(p, ten) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const o = {};
  for (const k of ['x', 'y', 'tx', 'ty']) if (typeof p[k] === 'number' && Number.isFinite(p[k])) o[k] = Math.round(Math.max(-1, Math.min(2, p[k])) * 1000) / 1000;
  for (const k of ['c', 'w', 'h', 'k', 'li']) if (Number.isInteger(p[k]) && Math.abs(p[k]) < 1e13) o[k] = p[k];
  for (const k of ['f', 's', 'a', 'e']) if (typeof p[k] === 'string' && CHU.test(p[k])) o[k] = p[k]; else if (p[k] === null) o[k] = null;
  if (typeof p.tc === 'string' && TC.test(p.tc)) o.tc = p.tc;
  o.n = ten;
  return o;
}

export class Phong extends DurableObject {
  async fetch(req) {
    if ((req.headers.get('Upgrade') || '').toLowerCase() !== 'websocket') return new Response('Cần WebSocket.', { status: 426 });
    const id = req.headers.get('X-Id') || '', ten = decodeURIComponent(req.headers.get('X-Ten') || '').slice(0, 60);
    if (!id) return new Response('Chưa đăng nhập.', { status: 401 });
    const ds = this.ctx.getWebSockets();
    if (ds.length >= TONG) return new Response('Phòng chung đang đông, hãy thử lại sau.', { status: 503 });
    if (ds.filter(w => (w.deserializeAttachment() || {}).id === id).length >= MOI_NGUOI) return new Response('Bạn đang mở quá nhiều cửa sổ.', { status: 429 });
    const [kh, may] = Object.values(new WebSocketPair());
    const peer = [...crypto.getRandomValues(new Uint8Array(9))].map(x => x.toString(16).padStart(2, '0')).join('');   // mã ngẫu nhiên mỗi kết nối, không lộ mã tài khoản
    this.ctx.acceptWebSocket(may);   // ngủ được (hibernation): đứng yên không tính thời gian chạy
    may.serializeAttachment({ peer, id, ten, p: null, t0: Date.now(), n: 0 });
    may.send(JSON.stringify({ t: 'chao', toi: peer, ds: ds.map(w => w.deserializeAttachment()).filter(a => a && a.p).map(a => ({ peer: a.peer, p: a.p })) }));
    return new Response(null, { status: 101, webSocket: kh });
  }
  gui(tru, tin) { const s = JSON.stringify(tin); for (const w of this.ctx.getWebSockets()) if (w !== tru) try { w.send(s) } catch { } }
  async webSocketMessage(ws, tin) {
    const a = ws.deserializeAttachment(); if (!a) return ws.close(1008, 'Hỏng');
    const now = Date.now(); if (now - a.t0 > CUA_SO) { a.t0 = now; a.n = 0 }
    if (++a.n > DUOI) return ws.close(1008, 'Gửi quá nhanh');
    if (a.n > TIN_CUA_SO) { ws.serializeAttachment(a); return }   // quá nhịp: bỏ tin, chưa đuổi
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
