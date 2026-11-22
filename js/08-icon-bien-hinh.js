/* Biểu tượng biến hình (morphicons, MIT) với dữ liệu icon Lucide (ISC). Tải lỗi thì giữ nguyên icon cũ. */
import {createMorph} from './thu-vien/morphicons-1.7.1/dom.js';
const I={"menu":[["path",{"d":"M4 5h16"}],["path",{"d":"M4 12h16"}],["path",{"d":"M4 19h16"}]],"x":[["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],"down":[["path",{"d":"m6 9 6 6 6-6"}]],"up":[["path",{"d":"m18 15-6-6-6 6"}]],"flame":[["path",{"d":"M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"}]],"check":[["path",{"d":"M20 6 9 17l-5-5"}]],"bag":[["path",{"d":"M16 10a4 4 0 0 1-8 0"}],["path",{"d":"M3.103 6.034h17.794"}],["path",{"d":"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"}]]};
const mk=(host,icon,size)=>{host.insertAdjacentHTML('afterbegin','<svg class="mi" viewBox="0 0 24 24" width="'+size+'" height="'+size+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path/></svg>');return createMorph(host.querySelector('svg.mi path'),icon,{reducedMotion:'user'})};
const watch=(el,fn)=>new MutationObserver(()=>fn(el.getAttribute('aria-expanded')==='true')).observe(el,{attributes:true,attributeFilter:['aria-expanded']});
// 1. Nút menu trên điện thoại: ba gạch <-> dấu x
{const b=document.getElementById('navMenu');if(b){b.querySelectorAll('span').forEach(x=>x.remove());const m=mk(b,I.menu,20);watch(b,o=>m.morphTo(o?I.x:I.menu))}}
// 2. Nút thu gọn bảng tìm kiếm: mũi tên xuống <-> lên
{const b=document.getElementById('ppTog');if(b){b.querySelector('svg:not(.mi)')?.remove();const m=mk(b,b.getAttribute('aria-expanded')==='true'?I.up:I.down,16);watch(b,o=>m.morphTo(o?I.up:I.down))}}
// 3. Nút Thắp hương: ngọn lửa -> dấu tích khi vừa thắp, rồi trở lại
const flash=(m,a,b)=>{m.morphTo(b);clearTimeout(m._t);m._t=setTimeout(()=>m.morphTo(a),1600)};
['pcIncense','ppIncense','homeInc'].forEach(id=>{const b=document.getElementById(id);if(!b)return;b.classList.add('has-mi');const m=mk(b,I.flame,16);b.addEventListener('click',()=>flash(m,I.flame,I.check))});
// 4. Nút mua đồ cúng: túi -> dấu tích khi mua thành công (số nén giảm)
const bal=()=>document.querySelector('[data-bal]')?.textContent;
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-buy]');if(!b)return;const before=bal(),id=b.dataset.buy;
  setTimeout(()=>{if(bal()===before)return;const nb=document.querySelector('[data-buy="'+CSS.escape(id)+'"]');if(!nb||nb.querySelector('svg.mi'))return;nb.classList.add('has-mi');const m=mk(nb,I.bag,15);requestAnimationFrame(()=>m.morphTo(I.check));setTimeout(()=>{m.destroy();nb.querySelector('svg.mi')?.remove();nb.classList.remove('has-mi')},1800)},0)},true);
document.documentElement.classList.add('mi-on');
