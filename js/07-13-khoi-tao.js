/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Khởi tạo ---------------- */
renderGoods();renderWall();updateTotal();
const _sel=select;select=function(id,fly){_sel(id,fly);renderWall();renderMap()};
select('khiem',false);
{const n=(!window.ssAuthAllowed||ssAuthAllowed())?ssMe.resume():null;if(n){ssSetUser(n);document.body.classList.add('signed')}}
/* ---------------- Chuyển động toàn trang ---------------- */
(function(){
  const nav=$('.nav'),prog=$('.nav-prog'),ind=$('.nav-ind'),links=$$('#mainNav a');
  // vạch chỉ mục + tiến trình + ẩn hiện menu
  const secs=[];
  let lastY=scrollY,tick=false,cur=null;
  function moveInd(a){window.tbGo&&window.tbGo(a)}
  function onScroll(){tick=false;const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;prog.style.setProperty('--p',h>0?(y/h).toFixed(4):0);
    lastY=y;
    let on=null;for(const sct of secs){const r=sct.getBoundingClientRect();if(r.top<innerHeight*.4&&r.bottom>innerHeight*.4){on=sct;break}}
    if(on!==cur){cur=on;links.forEach(a=>a.classList.toggle('on',on&&a.getAttribute('href')==='#'+on.id));moveInd(links.find(a=>a.classList.contains('on')))}
    if(!reduce){const hg=$('.hero-glow');if(hg&&y<innerHeight*1.4)hg.style.translate=`0 ${(y*.25).toFixed(1)}px`}}
  addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});addEventListener('resize',()=>moveInd(links.find(a=>a.classList.contains('on'))));onScroll();
  // ánh sáng theo con trỏ
  document.addEventListener('pointermove',e=>{const c=e.target.closest&&e.target.closest('.iso,.good,.note,.vcard');if(!c)return;const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  if(reduce)return;
  // tiêu đề tách chữ
  $$('.sec-head h2, .faq h2').forEach(h=>{let i=0;const walk=n=>{[...n.childNodes].forEach(ch=>{if(ch.nodeType===3){const frag=document.createDocumentFragment();ch.textContent.split(/(\s+)/).forEach(t=>{if(!t)return;if(/^\s+$/.test(t)){frag.appendChild(document.createTextNode(t));return}const w=document.createElement('span');w.className='w';const inner=document.createElement('span');inner.textContent=t;inner.style.setProperty('--wi',i++);w.appendChild(inner);frag.appendChild(w)});ch.replaceWith(frag)}else if(ch.nodeType===1)walk(ch)})};walk(h);h.classList.add('rvh')});
  // hiện dần
  const sel='.sec-head .eyebrow, .sec-head .lede, .iso, .good, .vmap-stage, .vmap-side, .home, .shop-bar, .tabs, .photo, .note, .msgform, .steps li, .jpanel, .faq details, .lm-facts, .lm .chap, .lm-letter, .lm-links, .lm-pn, .foot-word, .stats>div, .video, .tree .gen, .story';
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;el.classList.remove('pre','pre-h');io.unobserve(el);if(el.dataset.count!=null)count(el)}),{rootMargin:'0px 0px -5% 0px',threshold:.05});
  const prep=el=>{const r=el.getBoundingClientRect();if(!r.height||r.top<innerHeight*.92)return;const sib=[...el.parentNode.children].filter(x=>x.matches(sel));el.style.setProperty('--si',Math.min(8,Math.max(0,sib.indexOf(el))));el.classList.add('rv','pre');io.observe(el)};
  window.prepReveal=()=>{$$(sel).forEach(el=>{if(!el.classList.contains('rv'))prep(el)});$$('.rvh').forEach(h=>{if(h.dataset.rv)return;const r=h.getBoundingClientRect();if(!r.height||r.top<innerHeight*.92)return;h.dataset.rv=1;h.classList.add('pre-h');io.observe(h)})};
  window.prepReveal();
  // số đếm lên
  function count(box){const b=box.querySelector('b');if(!b)return;const target=parseInt(b.textContent.replace(/\D/g,''))||0;const t0=performance.now(),d=1400;(function f(now){const k=Math.min(1,(now-t0)/d),e=1-Math.pow(1-k,3);b.textContent=Math.round(target*e).toLocaleString('vi-VN');if(k<1)requestAnimationFrame(f)})(t0)}
  $$('.stats>div').forEach(d=>{d.dataset.count='';if(!d.classList.contains('pre')){io.observe(d)}});
})();
