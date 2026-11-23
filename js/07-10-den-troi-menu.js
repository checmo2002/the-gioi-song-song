/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Đèn trời bay lên sau lời mời ---------------- */
(function(){const cv=$('.icta .lanterns');if(!cv)return;const ctx=cv.getContext('2d');let W=0,H=0,dpr=1,vis=false,L=[];
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*dpr;cv.height=H*dpr}
  new ResizeObserver(size).observe(cv);new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(cv);
  const mk=init=>({x:W*(.5+Math.random()*.5),y:init?Math.random()*H:H+30,s:6+Math.random()*12,v:8+Math.random()*14,sw:Math.random()*6,f:Math.random()*6});
  function draw(l,t){const s=l.s,x=l.x+Math.sin(t*.4+l.sw)*10,y=l.y;const fl=.8+.2*Math.sin(t*6+l.f);
    const g=ctx.createRadialGradient(x,y,0,x,y,s*3.2);g.addColorStop(0,`rgba(240,170,80,${.38*fl})`);g.addColorStop(1,'rgba(255,170,90,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,s*3.2,0,7);ctx.fill();
    ctx.fillStyle=lgr(x,y,s,fl);ctx.beginPath();ctx.moveTo(x-s*.55,y-s*.75);ctx.lineTo(x+s*.55,y-s*.75);ctx.lineTo(x+s*.42,y+s*.7);ctx.lineTo(x-s*.42,y+s*.7);ctx.closePath();ctx.fill();
    ctx.fillStyle=`rgba(255,250,220,${.9*fl})`;ctx.beginPath();ctx.ellipse(x,y+s*.55,s*.14,s*.2,0,0,7);ctx.fill()}
  function lgr(x,y,s,fl){const g=ctx.createLinearGradient(x,y-s,x,y+s);g.addColorStop(0,`rgba(255,150,70,${.55*fl})`);g.addColorStop(1,`rgba(255,215,150,${.95*fl})`);return g}
  if(reduce){setTimeout(()=>{size();L=Array.from({length:10},()=>mk(true));ctx.setTransform(dpr,0,0,dpr,0,0);L.forEach(l=>draw(l,0))},300);return}
  let last=performance.now();ssVong(function(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(vis&&W){if(!L.length)L=Array.from({length:W<600?9:16},()=>mk(true));ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);const t=now/1000;
      L.forEach((l,i)=>{l.y-=l.v*dt;if(l.y<-30)L[i]=mk(false);const a=Math.min(1,(H-l.y)/80)*Math.min(1,(l.y+30)/90);ctx.globalAlpha=Math.max(0,a);draw(l,t)});ctx.globalAlpha=1}
  },[cv]);
})();


/* ---------------- Menu điện thoại ---------------- */
(function(){const btn=$('#navMenu'),sh=$('#msheet');if(!btn)return;
  function set(o){sh.hidden=!o;btn.setAttribute('aria-expanded',o);btn.setAttribute('aria-label',o?'Đóng menu':'Mở menu');document.body.classList.toggle('menu-open',o);
    if(o){const on=$('#mainNav a.on');$$('.msheet-links a').forEach(a=>a.classList.toggle('on',!!on&&a.getAttribute('href')===on.getAttribute('href')));const f=sh.querySelector('a');f&&f.focus({preventScroll:true})}}
  btn.addEventListener('click',()=>set(sh.hidden));
  sh.addEventListener('click',e=>{if(e.target.closest('a,[data-auth]'))set(false)});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!sh.hidden){set(false);btn.focus()}});
  matchMedia('(min-width:861px)').addEventListener('change',e=>{if(e.matches)set(false)});
})();
