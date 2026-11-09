/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Thiên giới: biển mây nhiều lớp, lầu gác trên mây, hạc bay, cánh hoa, đốm sáng ---------------- */
(function(){const hero=$('.hero'),cv=$('.hero-sky');if(!cv)return;const ctx=cv.getContext('2d');let W=0,H=0,dpr=1,vis=true,layers=[],pav=[],motes=[],petals=[],cranes=[];
  function puff(w,h,warm){const g=document.createElement('canvas');g.width=w;g.height=h;const x=g.getContext('2d');const bl=Math.max(6,Math.round(h*.06));x.filter='blur('+bl+'px)';
    const n=26+Math.floor(Math.random()*10);
    for(let i=0;i<n;i++){const u=Math.random(),cx=w*(.14+u*.72),arch=Math.sin(u*Math.PI);const rx=h*(.14+Math.random()*.2)*(1+arch*.6),ry=rx*(.5+Math.random()*.2);
      const cy=h*.72-arch*h*(.18+Math.random()*.12)-ry*.3;x.save();x.translate(cx,cy);x.scale(1,ry/rx);const gr=x.createRadialGradient(0,-rx*.25,0,0,0,rx);
      gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(.6,'rgba(255,254,250,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=gr;x.beginPath();x.arc(0,0,rx,0,7);x.fill();x.restore()}
    // bóng ấm dưới chân mây
    x.globalCompositeOperation='source-atop';x.filter='none';const sh=x.createLinearGradient(0,h*.35,0,h);sh.addColorStop(0,'rgba(255,255,255,0)');sh.addColorStop(1,warm?'rgba(236,206,160,.55)':'rgba(200,212,226,.5)');x.fillStyle=sh;x.fillRect(0,0,w,h);
    x.globalCompositeOperation='source-over';return g}
  function pavilion(w,h,tiers,col){const g=document.createElement('canvas');g.width=w;g.height=h;const x=g.getContext('2d');x.filter='blur(.6px)';const gr=x.createLinearGradient(0,0,0,h);gr.addColorStop(0,col);gr.addColorStop(.6,col);gr.addColorStop(.92,'rgba(255,255,255,0)');x.fillStyle=gr;x.strokeStyle=col;
    const cx=w/2,base=h*.62;// đá nổi
    x.beginPath();x.moveTo(cx-w*.34,base);for(let i=0;i<=12;i++){const t=i/12;x.lineTo(cx-w*.34+w*.68*t,base+Math.sin(t*Math.PI)*h*(.28+.06*Math.sin(t*9)))}x.closePath();x.fill();
    x.fillRect(cx-w*.3,base-h*.03,w*.6,h*.035);// nền
    let y=base-h*.03,bw=w*.42;for(let k=0;k<tiers;k++){const ch=h*(.1-.015*k);x.fillRect(cx-bw*.42,y-ch,bw*.84,ch);// thân
      for(let c=-2;c<=2;c++)x.fillRect(cx+c*bw*.18-1,y-ch,2,ch);
      y-=ch;const rw=bw*1.25,rh=h*.06;x.beginPath();x.moveTo(cx-rw/2-w*.03,y-rh*.2);x.quadraticCurveTo(cx-rw*.3,y-rh*.1,cx-rw*.28,y-rh);x.lineTo(cx+rw*.28,y-rh);x.quadraticCurveTo(cx+rw*.3,y-rh*.1,cx+rw/2+w*.03,y-rh*.2);x.lineTo(cx+rw/2,y+rh*.1);x.lineTo(cx-rw/2,y+rh*.1);x.closePath();x.fill();
      y-=rh;bw*=.72}
    x.beginPath();x.moveTo(cx-w*.012,y);x.lineTo(cx,y-h*.07);x.lineTo(cx+w*.012,y);x.fill();
    // cây tùng bên cạnh
    x.beginPath();const tx=cx+w*.24,ty=base-h*.02;x.moveTo(tx,ty);x.lineTo(tx+w*.01,ty-h*.12);x.lineWidth=2;x.stroke();[[0,.12,.09],[.02,.09,.07],[-.02,.15,.06]].forEach(([dx,dy,r])=>{x.beginPath();x.ellipse(tx+w*dx,ty-h*dy,w*r,h*r*.35,0,0,7);x.fill()});
    return g}
  function size(){dpr=Math.min(devicePixelRatio||1,2);W=hero.clientWidth;H=hero.clientHeight;cv.width=W*dpr;cv.height=H*dpr;const mob=W<700;
    pav=[[.70,.44,.09,2,'rgba(170,184,200,.26)',.012],[.95,.38,.13,3,'rgba(165,180,196,.30)',.009],[.84,.52,.2,3,'rgba(150,164,182,.36)',.006]].map(([px,py,sc,t,c,sp],i)=>{const w=Math.round(W*sc*(mob?1.6:1)),h=Math.round(w*1.1);return{img:pavilion(w,h,t,c),x:W*(mob?Math.min(.95,px+.05):px)-w/2,y:H*py-h*.62,w,h,ph:i*2,sp}});
    layers=[[.50,.34,['far'],5,.5],[.62,.42,['mid'],9,.75],[.74,.55,['near'],14,.92],[.88,.7,['front'],20,1]].map(([yb,sc,_,sp,op],li)=>{const arr=[];const n=mob?3:5;for(let i=0;i<n;i++){const w=W*(.42+Math.random()*.3)*(mob?1.6:1)*sc*1.7,h=w*.42;arr.push({img:puff(Math.round(w),Math.round(h),li>1),x:(i/n)*W*1.3-W*.15+Math.random()*W*.1,y:H*yb-h*.5+Math.random()*H*.04,w,h,v:sp*(.7+Math.random()*.5),o:op})}return arr});
    motes=Array.from({length:mob?24:46},()=>({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.7,v:3+Math.random()*7,sw:Math.random()*6}));
    petals=Array.from({length:mob?7:14},()=>({x:Math.random()*W,y:Math.random()*H*.8,s:3+Math.random()*3,vx:8+Math.random()*10,vy:6+Math.random()*8,r:Math.random()*6,vr:(Math.random()-.5)*1.5}));
    cranes=[{x:W*.2,y:H*.22,s:mob?9:13,v:9,ph:0},{x:W*.05,y:H*.28,s:mob?7:10,v:8,ph:1.7}]}
  new ResizeObserver(size).observe(hero);size();new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(hero);
  function crane(c,t){const f=Math.sin(t*1.6+c.ph);const s=c.s;ctx.save();ctx.translate(c.x,c.y+Math.sin(t*.5+c.ph)*4);ctx.strokeStyle='rgba(70,70,80,.45)';ctx.fillStyle='rgba(70,70,80,.45)';ctx.lineWidth=1.2;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-s*1.1,s*.05);ctx.lineTo(s*1.3,-s*.05);ctx.stroke();// thân + cổ dài
    ctx.beginPath();ctx.moveTo(-s*.2,0);ctx.quadraticCurveTo(-s*.9,-s*(.6+f*.8),-s*2.1,-s*(.2+f*1.1));ctx.quadraticCurveTo(-s*1,-s*(.1+f*.3),-s*.2,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(s*.1,0);ctx.quadraticCurveTo(-s*.4,-s*(.5+f*.7),-s*1.4,-s*(.4+f*1));ctx.quadraticCurveTo(-s*.5,-s*(.1+f*.25),s*.1,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(-s*1.1,s*.05);ctx.lineTo(-s*2,s*.25);ctx.stroke();ctx.restore()}
  function frame(now,dt){const t=now/1000;ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    const drawLayer=L=>L.forEach(c=>{c.x+=c.v*dt;if(c.x>W+20)c.x=-c.w-Math.random()*W*.2;ctx.globalAlpha=c.o;ctx.drawImage(c.img,c.x,c.y+Math.sin(t*.18+c.v)*3,c.w,c.h)});
    drawLayer(layers[0]);ctx.globalAlpha=1;pav.slice(0,2).forEach(p=>ctx.drawImage(p.img,p.x,p.y+Math.sin(t*.25+p.ph)*5,p.w,p.h));
    drawLayer(layers[1]);ctx.globalAlpha=1;const p=pav[2];ctx.drawImage(p.img,p.x,p.y+Math.sin(t*.22+p.ph)*6,p.w,p.h);
    drawLayer(layers[2]);ctx.globalAlpha=1;cranes.forEach(c=>{c.x+=c.v*dt;if(c.x>W+60){c.x=-60;c.y=H*(.16+Math.random()*.16)}crane(c,t)});
    drawLayer(layers[3]);ctx.globalAlpha=1;
    ctx.globalCompositeOperation='lighter';motes.forEach(m=>{m.y-=m.v*dt;m.x+=Math.sin(t*.5+m.sw)*5*dt;if(m.y<-6){m.y=H+6;m.x=Math.random()*W}const al=.3+.3*Math.sin(t*1.6+m.sw*3);const R=m.r*4;const g=ctx.createRadialGradient(m.x,m.y,0,m.x,m.y,R);g.addColorStop(0,`rgba(255,236,190,${al.toFixed(2)})`);g.addColorStop(1,'rgba(255,236,190,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(m.x,m.y,R,0,7);ctx.fill()});
    ctx.globalCompositeOperation='source-over';petals.forEach(q=>{q.x+=q.vx*dt;q.y+=q.vy*dt+Math.sin(t+q.r)*.2;q.r+=q.vr*dt;if(q.x>W+10||q.y>H){q.x=-10;q.y=Math.random()*H*.6}ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.r);ctx.fillStyle='rgba(246,206,214,.7)';ctx.beginPath();ctx.ellipse(0,0,q.s,q.s*.55,0,0,7);ctx.fill();ctx.restore()})}
  if(reduce){frame(performance.now(),0);return}
  let last=performance.now();(function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(vis&&W&&!document.documentElement.classList.contains('hall-on'))frame(now,dt)   /* thế giới phủ kín trang giới thiệu: thôi vẽ trời */;requestAnimationFrame(loop)})(last);
})();
