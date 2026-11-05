/* Lõi giao diện (tách từ 07-loi-chinh.js). Các file 07-NN-*.js dùng chung tên cấp ngoài cùng
   (const/let/function) qua phạm vi toàn cục của trang, nên PHẢI nạp đúng thứ tự số. */
/* ---------------- Vòng ký ức: album ảnh/video quay quanh tâm ---------------- */
(function(){
  const ringEl=$('#ring');if(!ringEl)return;
  const MEM=[
    {k:'school',y:1964,t:'Lớp bảy trường cấp hai xã',d:'Anh ngồi bàn thứ hai, cạnh cửa sổ. Thầy giáo cũ giữ tấm ảnh này suốt bốn mươi năm.',by:'Thầy Đặng Văn Hòa gửi',tone:'bw'},
    {k:'field',y:1966,t:'Mùa gặt làng Yên Bằng',d:'Mùa gặt cuối cùng anh còn ở nhà, đi cấy cùng mẹ bên bờ sông Đáy.',by:'Cháu Nam đăng',tone:'sepia'},
    {k:'flute',y:1968,t:'Anh và cây sáo trúc',d:'Mẹ kể anh hay ngồi trên lưng trâu thổi sáo, thổi lạc điệu mà vẫn thổi.',by:'Cháu Nam đăng',tone:'bw'},
    {k:'soldier',y:1970,t:'Ảnh thẻ trước ngày nhập ngũ',d:'Chụp ở hiệu ảnh thị xã, tháng 9 năm 1970. Đây là tấm ảnh được đặt trên bàn thờ.',by:'Gia đình',tone:'bw'},
    {k:'station',y:1970,t:'Sân ga ngày tiễn anh lên đường',d:'Thước phim gia đình dựng lại từ lời kể của bà và các cô.',by:'Cháu Trang dựng',tone:'faded',video:'02:14'},
    {k:'letter',y:1972,t:'Lá thư cuối gửi mẹ',d:'Bốn lá thư được bà giữ trong hộp bánh buộc chỉ đỏ. Đây là lá cuối, tháng 6 năm 1972.',by:'Gia đình',tone:'sepia'},
    {k:'mother',y:1985,t:'Mẹ ngồi chờ ở đầu ngõ',d:'Mỗi lần có người về từ Quảng Trị, bà lại mang hộp thư ra hỏi.',by:'Cô Lụa đăng',tone:'faded'},
    {k:'village',y:1990,t:'Ngôi nhà cũ bên lũy tre',d:'Ngôi nhà ba gian nơi anh lớn lên, trước khi gia đình xây lại.',by:'Chú Tuấn đăng',tone:'faded'},
    {k:'citadel',y:2009,t:'Lần đầu vào thăm Thành cổ',d:'Cháu Nam cõng bà vào viếng. Bà đặt lên mộ một nắm rơm khô mang từ quê.',by:'Cháu Nam quay',tone:'color',video:'06:42'},
    {k:'lotus',y:2012,t:'Ao sen trước nhà thờ họ',d:'Ao sen họ Phạm, nơi mỗi năm con cháu về giỗ chú.',by:'Cháu Trang đăng',tone:'color'},
    {k:'family',y:2019,t:'Giỗ chú, cả nhà quây quần',d:'Ngày 14 tháng 7 âm lịch, bốn thế hệ cùng ngồi quanh mâm cơm.',by:'Cháu Nam đăng',tone:'color'},
    {k:'river',y:2022,t:'Thả hoa đăng trên sông Thạch Hãn',d:'Những ngọn đèn hoa đăng trôi trên sông, tưởng nhớ những người đã nằm lại.',by:'Cháu Nam quay',tone:'color',video:'03:05'},
    {k:'graves',y:2025,t:'Chiều 27/7 ở nghĩa trang',d:'Hàng mộ trắng dưới nắng chiều, trước ngày Thương binh Liệt sĩ.',by:'Tổ chăm sóc mộ gửi',tone:'color'},
    {k:'incense',y:2026,t:'Nén hương năm nay',d:'Lần chăm mộ tháng 7 năm 2026: lau bia, dâng hoa cúc vàng, thắp hương thay gia đình.',by:'Tổ chăm sóc mộ gửi',tone:'color'}
  ];
  // ---------- vẽ ảnh minh họa ----------
  function rng(seed){let s=seed*9301+49297;return()=>(s=(s*9301+49297)%233280)/233280}
  function lg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,col])=>g.addColorStop(o,col));return g}
  function person(c,x,y,s,col,hat){c.fillStyle=col;c.beginPath();c.ellipse(x,y-s*1.55,s*.28,s*.32,0,0,7);c.fill();c.beginPath();c.moveTo(x-s*.5,y);c.quadraticCurveTo(x-s*.55,y-s*1.15,x,y-s*1.2);c.quadraticCurveTo(x+s*.55,y-s*1.15,x+s*.5,y);c.closePath();c.fill();
    if(hat){c.beginPath();c.moveTo(x-s*.62,y-s*1.62);c.lineTo(x,y-s*2.05);c.lineTo(x+s*.62,y-s*1.62);c.closePath();c.fill()}}
  const P={
    school(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#b9b4a6'],[1,'#7d786b']]);c.fillRect(0,0,w,h);c.fillStyle='#2f3b33';c.fillRect(w*.12,h*.1,w*.62,h*.36);c.strokeStyle='rgba(240,240,230,.7)';c.lineWidth=w*.004;for(let i=0;i<4;i++){c.beginPath();c.moveTo(w*.17,h*(.18+i*.065));c.lineTo(w*(.3+r()*.35),h*(.18+i*.065));c.stroke()}
      c.fillStyle='#e6e1d2';c.fillRect(w*.8,h*.08,w*.14,h*.4);c.fillStyle='#5b4a38';for(let row=0;row<2;row++)for(let i=0;i<4;i++){c.fillRect(w*(.05+i*.24),h*(.68+row*.16),w*.2,h*.04)}
      for(let i=0;i<7;i++)person(c,w*(.1+i*.13),h*(.72+(i%2)*.14),h*.14,'#3c352d')},
    field(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.45,[[0,'#d8c9a0'],[1,'#f0e2bd']]);c.fillRect(0,0,w,h*.45);c.fillStyle=lg(c,0,h*.45,0,h,[[0,'#a9a35a'],[1,'#6f7138']]);c.fillRect(0,h*.45,w,h*.55);
      c.strokeStyle='rgba(60,60,20,.35)';c.lineWidth=w*.003;for(let i=-10;i<=10;i++){c.beginPath();c.moveTo(w*.5,h*.45);c.lineTo(w*.5+i*w*.12,h);c.stroke()}
      c.fillStyle='#5b5a33';for(let i=0;i<14;i++){const x=r()*w;c.beginPath();c.ellipse(x,h*.44,w*.03,h*.04,0,0,7);c.fill()}
      person(c,w*.7,h*.86,h*.26,'#2d2a1e',true);person(c,w*.32,h*.74,h*.16,'#3a3624',true)},
    flute(c,w,h,r){c.fillStyle=lg(c,0,0,w,h,[[0,'#c9c6bd'],[1,'#7f7c74']]);c.fillRect(0,0,w,h);const x=w*.5,y=h;c.fillStyle='#2b2a27';c.beginPath();c.moveTo(x-w*.3,y);c.quadraticCurveTo(x-w*.28,y-h*.42,x,y-h*.45);c.quadraticCurveTo(x+w*.28,y-h*.42,x+w*.3,y);c.fill();
      c.fillStyle='#4a4741';c.beginPath();c.ellipse(x,h*.36,w*.1,h*.17,0,0,7);c.fill();c.fillStyle='#1d1c1a';c.beginPath();c.ellipse(x,h*.25,w*.105,h*.08,0,Math.PI,0);c.fill();
      c.strokeStyle='#d8cfb6';c.lineWidth=h*.025;c.beginPath();c.moveTo(x-w*.05,h*.44);c.lineTo(x+w*.32,h*.62);c.stroke()},
    soldier(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#d3d0c8'],[1,'#8e8b84']]);c.fillRect(0,0,w,h);const x=w*.5;c.fillStyle='#3d3f33';c.beginPath();c.moveTo(x-w*.3,h);c.quadraticCurveTo(x-w*.27,h*.6,x,h*.56);c.quadraticCurveTo(x+w*.27,h*.6,x+w*.3,h);c.fill();
      c.fillStyle='#57534b';c.fillRect(x-w*.04,h*.48,w*.08,h*.1);c.fillStyle='#6c6860';c.beginPath();c.ellipse(x,h*.38,w*.085,h*.15,0,0,7);c.fill();
      c.fillStyle='#4c5240';c.beginPath();c.ellipse(x,h*.27,w*.13,h*.12,0,Math.PI,0);c.fill();c.fillRect(x-w*.15,h*.265,w*.3,h*.03);c.fillStyle='#c9b25a';c.beginPath();c.arc(x,h*.2,h*.025,0,7);c.fill();
      c.strokeStyle='#2a2b23';c.lineWidth=w*.006;c.beginPath();c.moveTo(x-w*.06,h*.62);c.lineTo(x,h*.72);c.lineTo(x+w*.06,h*.62);c.stroke()},
    station(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#cfd3cf'],[1,'#e7e2d2']]);c.fillRect(0,0,w,h);c.fillStyle='#8b857a';c.fillRect(0,h*.5,w,h*.5);
      c.strokeStyle='#4e4a43';c.lineWidth=w*.006;[[.42,-.3],[.58,1.3]].forEach(([a,b])=>{c.beginPath();c.moveTo(w*a,h*.5);c.lineTo(w*b,h);c.stroke()});
      for(let i=0;i<8;i++){const t=i/8,yy=h*.5+h*.5*t*t;c.beginPath();c.moveTo(w*(.42-.72*t*t),yy);c.lineTo(w*(.58+.72*t*t),yy);c.stroke()}
      c.fillStyle='#3b3c3a';c.fillRect(w*.02,h*.28,w*.32,h*.3);c.fillStyle='#d9d4c4';for(let i=0;i<4;i++)c.fillRect(w*(.04+i*.075),h*.33,w*.05,h*.07);
      for(let i=0;i<5;i++)person(c,w*(.6+i*.08),h*(.66+r()*.04),h*.13,'#2e2b27',i%2===0)},
    letter(c,w,h,r){c.fillStyle=lg(c,0,0,w,h,[[0,'#7a5a3e'],[1,'#4e3826']]);c.fillRect(0,0,w,h);c.save();c.translate(w*.46,h*.5);c.rotate(-.08);c.fillStyle='#efe6cf';c.fillRect(-w*.3,-h*.4,w*.6,h*.8);
      c.strokeStyle='rgba(40,50,90,.55)';c.lineWidth=w*.0035;for(let i=0;i<9;i++){c.beginPath();let x=-w*.25;c.moveTo(x,-h*.3+i*h*.075);while(x<w*.2){x+=w*.02;c.lineTo(x,-h*.3+i*h*.075+Math.sin(x*.3+i)*h*.006)}c.stroke()}c.restore();
      c.save();c.translate(w*.8,h*.7);c.rotate(.18);c.fillStyle='#d9ccad';c.fillRect(-w*.14,-h*.12,w*.28,h*.24);c.strokeStyle='#a4977a';c.beginPath();c.moveTo(-w*.14,-h*.12);c.lineTo(0,h*.02);c.lineTo(w*.14,-h*.12);c.stroke();c.fillStyle='#b5443a';c.fillRect(w*.07,-h*.1,w*.05,h*.07);c.restore()},
    mother(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#d9d2bd'],[1,'#a8a089']]);c.fillRect(0,0,w,h);c.fillStyle='#8c8470';c.fillRect(0,h*.2,w*.18,h*.8);c.fillRect(w*.82,h*.2,w*.18,h*.8);c.fillStyle='#6a6352';c.fillRect(0,h*.15,w,h*.06);
      c.strokeStyle='#5d6a3c';c.lineWidth=w*.006;for(let i=0;i<16;i++){const x=r()*w;c.beginPath();c.moveTo(x,0);c.quadraticCurveTo(x+w*.03,h*.08,x+w*.06*(r()-.3),h*.16);c.stroke()}
      c.fillStyle='#6e5a44';c.fillRect(w*.47,h*.78,w*.12,h*.08);person(c,w*.53,h*.8,h*.3,'#2e2a24',true)},
    village(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.55,[[0,'#cfdad6'],[1,'#e9e4d0']]);c.fillRect(0,0,w,h);c.fillStyle='#55603b';for(let i=0;i<6;i++){const x=w*(i*.19);c.beginPath();c.ellipse(x,h*.36,w*.08,h*.26,0,0,7);c.fill()}
      c.fillStyle='#e6dfc8';c.fillRect(w*.3,h*.4,w*.4,h*.18);c.fillStyle='#8a4a33';c.beginPath();c.moveTo(w*.26,h*.42);c.lineTo(w*.5,h*.28);c.lineTo(w*.74,h*.42);c.closePath();c.fill();c.fillStyle='#4b3a2c';[.38,.48,.58].forEach(x=>c.fillRect(w*x,h*.47,w*.05,h*.11));
      c.fillStyle=lg(c,0,h*.6,0,h,[[0,'#6f8a86'],[1,'#3e5653']]);c.fillRect(0,h*.6,w,h*.4);c.globalAlpha=.25;c.fillStyle='#e6dfc8';c.fillRect(w*.3,h*.62,w*.4,h*.12);c.globalAlpha=1},
    citadel(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#9fc0dd'],[1,'#e8eef0']]);c.fillRect(0,0,w,h);c.fillStyle='#8f8676';c.fillRect(0,h*.32,w,h*.33);c.strokeStyle='rgba(60,50,40,.35)';c.lineWidth=1;for(let y=0;y<6;y++)for(let x=0;x<14;x++){c.strokeRect(x*w/14+(y%2)*w/28,h*.32+y*h*.055,w/14,h*.055)}
      c.fillStyle='#6e8b4a';c.fillRect(0,h*.65,w,h*.35);c.fillStyle='#e8c34a';for(let i=0;i<10;i++){c.beginPath();c.arc(w*(.45+r()*.12),h*(.72+r()*.06),h*.022,0,7);c.fill()}
      person(c,w*.3,h*.95,h*.3,'#2c3a46');person(c,w*.4,h*.97,h*.22,'#3b3330',true);person(c,w*.75,h*.93,h*.26,'#30343a')},
    lotus(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#3f5e4c'],[1,'#22372d']]);c.fillRect(0,0,w,h);for(let i=0;i<16;i++){c.fillStyle=i%2?'#5f8a4a':'#4c7a3e';c.beginPath();c.ellipse(r()*w,r()*h,w*(.06+r()*.05),h*(.05+r()*.04),r()*3,0,7);c.fill()}
      for(let i=0;i<6;i++){const x=w*(.1+r()*.8),y=h*(.15+r()*.7);c.fillStyle='#f0a8bb';for(let k=-2;k<=2;k++){c.beginPath();c.ellipse(x+k*w*.012,y,w*.014,h*.05,k*.35,0,7);c.fill()}c.fillStyle='#f7d2dc';c.beginPath();c.ellipse(x,y+h*.01,w*.012,h*.035,0,0,7);c.fill()}},
    family(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#c9a676'],[1,'#7b5a38']]);c.fillRect(0,0,w,h);c.fillStyle='#b13a2e';c.fillRect(w*.38,h*.06,w*.24,h*.14);c.fillStyle='#f2d9a0';c.fillRect(w*.4,h*.08,w*.2,h*.1);
      for(let i=0;i<6;i++){const a=Math.PI+i/5*Math.PI;person(c,w*.5+Math.cos(a)*w*.36,h*.7+Math.sin(a)*h*.18,h*.24,['#3a2e26','#4a3a2e','#2f2721'][i%3],false)}
      c.fillStyle='#5a3b25';c.beginPath();c.ellipse(w*.5,h*.72,w*.3,h*.13,0,0,7);c.fill();c.fillStyle='#efe6d2';for(let i=0;i<7;i++){c.beginPath();c.ellipse(w*(.3+i*.067),h*(.71+(i%2)*.03),w*.025,h*.02,0,0,7);c.fill()}
      for(let i=0;i<4;i++)person(c,w*(.24+i*.17),h*1.02,h*.28,'#2a211b')},
    river(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.45,[[0,'#2b3159'],[1,'#c97a5e']]);c.fillRect(0,0,w,h*.45);c.fillStyle=lg(c,0,h*.45,0,h,[[0,'#3a3550'],[1,'#141526']]);c.fillRect(0,h*.45,w,h*.55);
      c.fillStyle='#1b1a26';c.fillRect(0,h*.38,w,h*.07);for(let i=0;i<6;i++)c.fillRect(w*(.1+i*.16),h*.3,w*.02,h*.1);c.fillRect(0,h*.29,w,h*.02);
      for(let i=0;i<22;i++){const x=r()*w,y=h*(.5+r()*.48),s=.5+(y/h-.5)*2;const g=c.createRadialGradient(x,y,0,x,y,h*.05*s);g.addColorStop(0,'rgba(255,220,150,1)');g.addColorStop(1,'rgba(255,150,80,0)');c.fillStyle=g;c.beginPath();c.arc(x,y,h*.05*s,0,7);c.fill();c.fillStyle='rgba(255,200,120,.35)';c.fillRect(x-1,y+h*.02,2,h*.06*s)}},
    graves(c,w,h,r){c.fillStyle=lg(c,0,0,0,h*.5,[[0,'#e9b27a'],[1,'#f6dcb6']]);c.fillRect(0,0,w,h);c.fillStyle='#7f9a58';c.fillRect(0,h*.45,w,h*.55);
      for(let row=0;row<5;row++){const y=h*(.5+row*row*.03+row*.06),s=.4+row*.25;for(let i=0;i<12;i++){const x=w*(i/11)+(row%2)*w*.04;c.fillStyle='#f3efe6';c.fillRect(x-w*.018*s,y-h*.07*s,w*.036*s,h*.07*s);c.beginPath();c.arc(x,y-h*.07*s,w*.018*s,Math.PI,0);c.fill();c.fillStyle='rgba(60,70,40,.35)';c.fillRect(x-w*.02*s,y,w*.04*s,h*.012*s)}}},
    incense(c,w,h,r){c.fillStyle=lg(c,0,0,0,h,[[0,'#9db0a8'],[1,'#4d5b52']]);c.fillRect(0,0,w,h);c.fillStyle='#ece6d8';c.fillRect(w*.36,h*.12,w*.28,h*.55);c.beginPath();c.arc(w*.5,h*.12,w*.14,Math.PI,0);c.fill();
      c.fillStyle='#b8402f';c.font=`${Math.round(h*.06)}px serif`;c.textAlign='center';c.fillText('★',w*.5,h*.2);c.fillStyle='rgba(80,80,80,.55)';for(let i=0;i<4;i++)c.fillRect(w*.41,h*(.28+i*.07),w*.18,h*.015);
      c.fillStyle='#7a6a4a';c.fillRect(w*.3,h*.67,w*.4,h*.06);c.fillStyle='#8a6a2c';c.beginPath();c.ellipse(w*.5,h*.8,w*.07,h*.06,0,0,7);c.fill();
      c.strokeStyle='#b4413a';c.lineWidth=w*.004;[-1,0,1].forEach(k=>{c.beginPath();c.moveTo(w*.5+k*w*.012,h*.78);c.lineTo(w*.5+k*w*.02,h*.6);c.stroke()});
      c.strokeStyle='rgba(240,240,240,.5)';c.lineWidth=w*.004;c.beginPath();c.moveTo(w*.5,h*.6);c.bezierCurveTo(w*.46,h*.5,w*.56,h*.42,w*.5,h*.3);c.stroke();
      [[.22,'#f2c94c'],[.78,'#f2c94c']].forEach(([x,col])=>{c.fillStyle='#5b6e3a';c.fillRect(w*x-w*.008,h*.62,w*.016,h*.2);c.fillStyle=col;for(let i=0;i<7;i++){c.beginPath();c.arc(w*x+(r()-.5)*w*.08,h*(.58+(r()-.5)*.1),h*.03,0,7);c.fill()}})}
  };
  function tone(c,w,h,mode,seed){const r=rng(seed);const g=c.createRadialGradient(w/2,h/2,Math.min(w,h)*.25,w/2,h/2,Math.max(w,h)*.7);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');c.fillStyle=g;c.fillRect(0,0,w,h);
    const im=c.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){let R=d[i],Gc=d[i+1],B=d[i+2];const y=.3*R+.59*Gc+.11*B;
      if(mode==='bw'){R=Gc=B=y}else if(mode==='sepia'){R=y*1.07+18;Gc=y*.95+8;B=y*.78}else if(mode==='faded'){R=R*.6+y*.4+14;Gc=Gc*.6+y*.4+8;B=B*.6+y*.4}
      const n=(r()-.5)*26;d[i]=R+n;d[i+1]=Gc+n;d[i+2]=B+n}c.putImageData(im,0,0)}
  function paint(cv,item,idx,W,H){const dpr=Math.min(devicePixelRatio||1,2);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);const c=cv.getContext('2d');
    if(item.img){const w=cv.width,h=cv.height,k=Math.max(w/item.img.width,h/item.img.height),iw=item.img.width*k,ih=item.img.height*k;c.drawImage(item.img,(w-iw)/2,(h-ih)/2,iw,ih);return}const w=cv.width,h=cv.height;
    (P[item.k]||P.field)(c,w,h,rng(idx*17+3));tone(c,w,h,item.tone,idx*31+7)}
  // ---------- dựng vòng ----------
  const tilesEl=$('#ringTiles'),n=MEM.length;$('#ringCount').textContent=`${n} kỷ vật · ${MEM[0].y} – ${MEM[n-1].y}`;
  const tiles=MEM.map((m,i)=>{const b=document.createElement('button');b.className='rt';b.setAttribute('aria-label',`${m.y}, ${m.t}`);const cv=document.createElement('canvas');b.appendChild(cv);
    if(m.video){const v=document.createElement('span');v.className='rt-vid';v.innerHTML=`<svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M7 4v16l13-8z"/></svg>${m.video}`;b.appendChild(v)}
    const yr=document.createElement('span');yr.className='rt-y';yr.textContent=m.y;b.appendChild(yr);tilesEl.appendChild(b);return b});
  // vẽ 14 tấm khi vòng sắp hiện (mỗi tấm ~1 MB bộ nhớ ảnh), không vẽ sẵn lúc mở trang
  new IntersectionObserver((es,o)=>{if(es[0].isIntersecting){o.disconnect();tiles.forEach((b,i)=>paint(b.querySelector('canvas'),MEM[i],i,300,200))}},{rootMargin:'600px'}).observe(ringEl);
  // ảnh thật của gia đình: thay lần lượt các tấm minh họa (chỉ trong phiên xem này)
  // shortcut: ảnh chưa được lưu lên máy chủ, mất khi tải lại trang; cần kho lưu ảnh khi làm sản phẩm thật
  const loadImg=f=>(window.createImageBitmap?createImageBitmap(f):new Promise((ok,no)=>{const im=new Image();im.onload=()=>{URL.revokeObjectURL(im.src);ok(im)};im.onerror=no;im.src=URL.createObjectURL(f)}));
  $('#ringUpload').addEventListener('change',async e=>{const files=[...e.target.files].filter(f=>f.type.startsWith('image/'));let done=0;
    for(const f of files){const i=MEM.findIndex(m=>!m.img);if(i<0)break;try{const img=await loadImg(f);const m=MEM[i];m.img=img;m.t=f.name.replace(/\.[^.]+$/,'').slice(0,60);m.y=new Date(f.lastModified||Date.now()).getFullYear();m.d='Ảnh gia đình tải lên.';m.by='Bạn vừa tải lên';delete m.video;
      tiles[i].querySelector('.rt-y').textContent=m.y;const v=tiles[i].querySelector('.rt-vid');v&&v.remove();tiles[i].setAttribute('aria-label',`${m.y}, ${m.t}`);paint(tiles[i].querySelector('canvas'),m,i,300,200);done++}catch(_){}}
    e.target.value='';toast(done?`Đã thêm ${done} ảnh vào vòng ký ức. Ảnh chỉ lưu trong lần xem này.`:'Không đọc được ảnh. Hãy chọn tệp JPG hoặc PNG.')});
  let base=0,vel=0,hover=-1,t0=performance.now(),last=t0,drag=null,vis=false;
  new IntersectionObserver(es=>vis=es[0].isIntersecting).observe(ringEl);
  function setCap(i){if(i<0){$('#rcN').textContent='—';$('#rcT').textContent='Rê chuột hoặc chạm vào một kỷ vật';$('#rcY').textContent='';return}const m=MEM[i];$('#rcN').textContent=String(i+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');$('#rcT').textContent=m.t+(m.video?' · video '+m.video:'');$('#rcY').textContent=m.y}
  function setHover(i){hover=i;tiles.forEach((t,k)=>t.classList.toggle('on',k===i));ringEl.classList.toggle('has-hover',i>=0);setCap(i)}
  tiles.forEach((t,i)=>{t.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')setHover(i)});t.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')setHover(-1)});
    t.addEventListener('focus',()=>setHover(i));t.addEventListener('blur',()=>setHover(-1));
    t.addEventListener('click',e=>{if(drag&&drag.moved)return;if(e.pointerType!=='mouse'&&hover!==i&&matchMedia('(hover:none)').matches){setHover(i);return}openLB(i)})});
  ringEl.addEventListener('pointerdown',e=>{drag={x:e.clientX,b:base,moved:false,id:e.pointerId}});
  addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x;if(Math.abs(dx)>6)drag.moved=true;if(drag.moved){const nb=drag.b+dx*.006;vel=(nb-base)*60;base=nb}});
  addEventListener('pointerup',()=>{setTimeout(()=>drag=null,0)});
  $('#ringPrev').addEventListener('click',()=>vel-=1.6);$('#ringNext').addEventListener('click',()=>vel+=1.6);
  ringEl.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){vel-=1.6;e.preventDefault()}else if(e.key==='ArrowRight'){vel+=1.6;e.preventDefault()}});
  let scrollA=0;function sc(){const r=ringEl.getBoundingClientRect();scrollA=((innerHeight-r.top)/(innerHeight+r.height))*Math.PI*.9}addEventListener('scroll',sc,{passive:true});sc();
  function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
    if(vis){const W=ringEl.clientWidth,H=ringEl.clientHeight,tw=tiles[0].offsetWidth,th=tiles[0].offsetHeight;
      if(!drag||!drag.moved){base+=vel*dt;vel*=Math.pow(.04,dt);if(!reduce&&hover<0)base+=dt*.05}
      const A=base+scrollA,Rx=Math.min(W*.37,W/2-tw*.42),Ry=Math.min(H*.34,H/2-th*.62);
      tiles.forEach((t,i)=>{const a=A+i/n*Math.PI*2,x=W/2+Rx*Math.cos(a),y=H/2+Ry*Math.sin(a),d=(Math.sin(a)+1)/2;let s=.7+.42*d;if(i===hover)s*=1.28;
        t.style.transform=`translate3d(${(x-tw/2).toFixed(1)}px,${(y-th/2).toFixed(1)}px,0) scale(${s.toFixed(3)}) rotate(${(Math.cos(a)*-4).toFixed(2)}deg)`;t.style.zIndex=i===hover?300:Math.round(d*100);t.style.opacity=(i===hover?1:.55+.45*d).toFixed(2)})}
  }
  ssVong(frame,[ringEl]);setCap(-1);
  // ---------- xem lớn ----------
  const lb=$('#lb');let cur=0;
  function show(i){cur=(i+n)%n;const m=MEM[cur];paint($('#lbCanvas'),m,cur,900,600);$('#lbN').textContent=String(cur+1).padStart(2,'0')+' / '+String(n).padStart(2,'0');$('#lbY').textContent=m.y;$('#lbT').textContent=m.t;$('#lbD').textContent=m.d;$('#lbBy').textContent=m.by+' · ảnh minh họa';$('#lbPlay').hidden=!m.video;$('#lbPlay').dataset.len=m.video||''}
  function openLB(i){window.ssChime&&window.ssChime();show(i);lb.hidden=false;document.body.style.overflow='hidden';$('#lbClose').focus()}
  function closeLB(){lb.hidden=true;document.body.style.overflow='';tiles[cur]&&tiles[cur].focus({preventScroll:true})}
  $('#lbPrev').addEventListener('click',()=>show(cur-1));$('#lbNext').addEventListener('click',()=>show(cur+1));
  lb.addEventListener('click',e=>{if(e.target.closest('[data-lbclose]'))closeLB()});
  $('#lbPlay').addEventListener('click',()=>toast('Video mẫu ('+$('#lbPlay').dataset.len+'). Gia đình sẽ tải video thật lên đây.'));
  addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')closeLB();else if(e.key==='ArrowLeft')show(cur-1);else if(e.key==='ArrowRight')show(cur+1)});
})();
