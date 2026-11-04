/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduce0=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt=n=>n.toLocaleString('vi-VN');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
/* ---------------- Hai lớp: trang giới thiệu và bên trong website ---------------- */
(function(){
  const isApp=el=>el&&el.closest('.app-only');
  function setView(v,targetId,smooth){const b=document.body;const was=b.classList.contains('view-app')?'app':'intro';b.classList.toggle('view-app',v==='app');b.classList.toggle('view-intro',v!=='app');
    if(was!==v){$$(v==='app'?'.app-only':'.intro-only').forEach(el=>{el.classList.remove('view-fade');void el.offsetWidth;el.classList.add('view-fade')});dispatchEvent(new Event('resize'));setTimeout(()=>window.prepReveal&&window.prepReveal(),60)}
    const t=targetId&&document.getElementById(targetId);
    const pg=window.ssPage?ssPage(t,v):{changed:false,isTop:true};
    if(pg.changed){dispatchEvent(new Event('resize'));setTimeout(()=>window.prepReveal&&window.prepReveal(),60)}
    if(t&&!pg.isTop&&!(v==='intro'&&targetId==='dau-trang'))requestAnimationFrame(()=>t.scrollIntoView({behavior:smooth&&!pg.changed&&!reduce?'smooth':'auto'}));else scrollTo({top:0,behavior:'auto'});
    setTimeout(()=>dispatchEvent(new Event('scroll')),80)}
  window.setView=setView;
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(!id)return;const t=document.getElementById(id);if(!t)return;
    e.preventDefault();const v=isApp(t)?'app':(t.closest('.intro-only')?'intro':(document.body.classList.contains('view-app')?'app':'intro'));setView(v,id,true);try{history.pushState(null,'','#'+id)}catch(_){}});
  addEventListener('popstate',()=>route(false));
  function route(){const id=location.hash.slice(1);const t=id&&document.getElementById(id);if(t&&isApp(t))setView('app',id,false);else setView('intro',id||null,false)}
  route();
})();

let tT; window.toast=function(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2600)};
